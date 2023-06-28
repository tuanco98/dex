import { UpdateLimitGasLess } from "../../../../infra/blockchain/viem/contract/open_position_contract/method/OpenPositionContract";
import { isBaseFeeAccept } from "../../../../infra/blockchain/viem/viem.helper";
import { DAO } from "../../../../infra/database/mongo/methods";
import { PushNewNotification } from "../../../../infra/notification";
import { verifySignatureUpdateLimit } from "../../../../lib/auth/signature_update_limit";
import {
	ERROR_CODE,
	ErrMsg,
	ErrorHandler,
	validateMissing,
} from "../../../../lib/error_handler";
import { UpdateLimitGasLessOrder } from "../../input/updateLimitGasLessOrder";

/**
 * Example
 * @param parent
 * @param {UpdateLimitGasLessOrder} args
 * @param ctx
 * @return {String}
 */
const isLimitDeadline = (limitExpire: number, sec_timestamp_now: number) => {
	return limitExpire > sec_timestamp_now;
};
const validateInput = async (params: UpdateLimitGasLessOrder) => {
	validateMissing({
		...params,
		owner: params.gasLess.owner,
		deadline: params.gasLess.deadline,
		signature: params.gasLess.deadline,
	});
	const sec_timestamp_now = Math.floor(new Date().getTime() / 1000);
	if (params.gasLess.deadline) {
		if (!(params.gasLess.deadline.toString().length === 10))
			throw ErrMsg(
				ERROR_CODE.INVALID_PARAMS,
				"deadline must seconds timestamp",
			);
		if (!isLimitDeadline(params.gasLess.deadline, sec_timestamp_now))
			throw ErrMsg(ERROR_CODE.INVALID_PARAMS, "deadline must greater than now");
	}
	const verify = await verifySignatureUpdateLimit(
		params.orderId,
		params.tp,
		params.sl,
		params.gasLess,
	);
	if (!verify) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
	const trade = await DAO.trades.GetTradeById(params.orderId);
	if (!trade) throw ErrMsg(ERROR_CODE.TRADE_NOT_EXIST);
};
export const dex_user_update_limit_gasless_order = async (_, args: any) => {
	try {
		const params = args as UpdateLimitGasLessOrder;
		await validateInput(params);
		await isBaseFeeAccept();
		const jobId = await UpdateLimitGasLess(
			params.orderId,
			params.tp,
			params.sl,
			params.gasLess,
		);
		await PushNewNotification({
			address: params.gasLess.owner,
			type: 'EditPosition',
			payload: { jobId },
			jobId,
		});
		return "success";
	} catch (e) {
		ErrorHandler(
			e,
			{ args },
			dex_user_update_limit_gasless_order.name,
		).throwErr();
	}
};
