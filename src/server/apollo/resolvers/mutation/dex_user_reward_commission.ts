import { privateKeyToAccount } from "viem/accounts";
import { MASTER_KEY, PRIVATE_KEY_REWARD_COMMISSION } from "../../../../config";
import { handleTransferTokenUSDC } from "../../../../cron/cron.reward_commission";
import { DAO } from "../../../../infra/database/mongo/methods";
import { mongo } from "../../../../infra/database/mongo/mongo";
import {
	ERROR_CODE,
	ErrMsg,
	ErrorHandler,
} from "../../../../lib/error_handler";
import { GetAuthorization } from "../../helper";

export const dex_user_reward_commission = async (_, args: any, ctx: any) => {
	const session = mongo.startSession();
	try {
		const masterKey = GetAuthorization(ctx);
		if (masterKey !== MASTER_KEY) throw ErrMsg(ERROR_CODE.MASTER_KEY_INVALID);
		const { _id } = args;
		session.startTransaction();
		const getDataRequestCommission =
			await DAO.request_commissions.getRequestCommissionById(_id, session);
		if (!getDataRequestCommission) throw ErrMsg(ERROR_CODE.DATA_INVALID);
		if (getDataRequestCommission.txid)
			throw ErrMsg(ERROR_CODE.REQUEST_HAS_BEEN_SUCCESS);
		const { address, requestAmount } = getDataRequestCommission;
		const getDataUser = await DAO.users.GetUser(address, session);
		if (!getDataUser) throw ErrMsg(ERROR_CODE.USER_NOT_FOUND);
		const { unclaim_commission } = getDataUser;
		const remainAmount = (
			BigInt(unclaim_commission.toString()) - BigInt(requestAmount.toString())
		).toString();
		if (BigInt(remainAmount) < 0n)
			throw ErrMsg(ERROR_CODE.USER_NOT_ENOUGH_COMMISSION);
		await DAO.users.updateCommission(address, remainAmount, session);
		const bot_address = privateKeyToAccount(
			`0x${PRIVATE_KEY_REWARD_COMMISSION}`,
		).address;
		const transactionHash = await handleTransferTokenUSDC(
			bot_address,
			address,
			requestAmount.toString(),
		);
		await DAO.request_commissions.updateRequestCommission(
			getDataRequestCommission._id,
			transactionHash,
			remainAmount,
			session,
		);
		await session.commitTransaction();
		const resultDataRewardCommission = {
			address,
			txid: transactionHash,
			request_amount: requestAmount.toString(),
			remain_amount: remainAmount.toString(),
		};
		return resultDataRewardCommission;
	} catch (error) {
		if (session.inTransaction()) await session.abortTransaction();
		ErrorHandler(error, args, dex_user_reward_commission.name).throwErr();
	} finally {
		await session.endSession();
	}
};
