import { Decimal128 } from "mongodb";
import { NODE_ENV } from "../../../../config";
import { DAO } from "../../../../infra/database/mongo/methods";
import { TRequestCommission } from "../../../../infra/database/mongo/models/CommissionRequest";
import { mongo } from "../../../../infra/database/mongo/mongo";
import {
	ErrMsg,
	ErrorHandler,
	ERROR_CODE,
	validateMissing,
} from "../../../../lib/error_handler";
import { timeSystem } from "../../../../lib/time_sys";
import { isGreaterThan, isLessThanOrEqual } from "../../../../lib/utils";
import { GetAuthorization, VerifyAuthorization } from "../../helper";

const isRequestAmountValid = (
	requestCommission: string,
	amountCommission: string,
) => {
	const isHigherCommission = isGreaterThan(requestCommission, amountCommission);
	const isLowerCommission = isLessThanOrEqual(requestCommission, "0");
	return !(isHigherCommission || isLowerCommission);
};

export const dex_user_request_commission = async (_, args: any, ctx: any) => {
	const session = mongo.startSession();
	try {
		const authorization = GetAuthorization(ctx);
		const { address } = await VerifyAuthorization(authorization);
		const { request_amount } = args as { request_amount: string };
		validateMissing({ request_amount });
		const dataUser = await DAO.users.GetUser(address);
		if (!dataUser) throw ErrMsg(ERROR_CODE.USER_NOT_FOUND);
		const dateNow = new Date();
		let checkDataRequestCommission: TRequestCommission | null = null;
		await session.withTransaction(async () => {
			if (NODE_ENV !== "local" && NODE_ENV !== "dev") {
				checkDataRequestCommission =
					await DAO.request_commissions.getRequestCommissionByTime(
						address,
						timeSystem.getDateInFuture(dateNow, { days: -1 }),
						dateNow,
						session,
					);
			} else {
				checkDataRequestCommission =
					await DAO.request_commissions.getRequestCommissionByTime(
						address,
						timeSystem.getDateInFuture(dateNow, { minutes: -30 }),
						dateNow,
						session,
					);
			}
			if (checkDataRequestCommission)
				throw ErrMsg(ERROR_CODE.USER_REQUEST_IS_PENDING);
			const isReqAmountValid = isRequestAmountValid(
				request_amount,
				dataUser.unclaim_commission.toString(),
			);
			if (!isReqAmountValid)
				throw ErrMsg(ERROR_CODE.USER_NOT_ENOUGH_COMMISSION);
			const setDataRequestCommission: TRequestCommission = {
				address,
				createAt: dateNow,
				updateAt: dateNow,
				requestAmount: new Decimal128(request_amount),
			};
			await DAO.request_commissions.addRequestCommission(
				setDataRequestCommission,
				session,
			);
		});
		return "Success";
	} catch (e) {
		if (session.inTransaction()) await session.abortTransaction();
		ErrorHandler(e, { args }, dex_user_request_commission.name).throwErr();
	} finally {
		await session.endSession();
	}
};
