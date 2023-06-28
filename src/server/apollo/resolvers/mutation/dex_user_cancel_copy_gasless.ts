import { isBaseFeeAccept } from "../../../../infra/blockchain/viem/viem.helper";
import { DAO } from "../../../../infra/database/mongo/methods";
import { mongo } from "../../../../infra/database/mongo/mongo";
import { PushNewNotification } from "../../../../infra/notification";
import { verifySignatureCancelGasLess } from "../../../../lib/auth/signature_cancel_gasless";
import {
	ERROR_CODE,
	ErrMsg,
	ErrorHandler,
	validateMissing,
} from "../../../../lib/error_handler";
import { isMatch, lowerCase } from "../../../../lib/utils";
import { CancelCopyGasLessInput } from "../../input/cancelCopyGasLess";
/**
 * dex_user_cancel_copy_gasless
 * @param parent
 * @param {CancelCopyGasLessInput} args
 * @param ctx
 * @return {string}
 */
const isLimitDeadline = (limitExpire: number, sec_timestamp_now: number) => {
	return limitExpire > sec_timestamp_now;
};
const validateInput = async (params: CancelCopyGasLessInput) => {
	validateMissing({ ...params, ...params.gasLess });
	const sec_timestamp_now = Math.floor(new Date().getTime() / 1000);
	if (
		isMatch(lowerCase(params.master_address), lowerCase(params.gasLess.owner))
	)
		throw ErrMsg(ERROR_CODE.INVALID_PARAMS, "can not unfollow myself");
	if (params.gasLess.deadline) {
		if (!(params.gasLess.deadline.toString().length === 10))
			throw ErrMsg(
				ERROR_CODE.INVALID_PARAMS,
				"deadline must seconds timestamp",
			);
		if (!isLimitDeadline(params.gasLess.deadline, sec_timestamp_now))
			throw ErrMsg(ERROR_CODE.INVALID_PARAMS, "deadline must greater than now");
	}
	const verify = await verifySignatureCancelGasLess(
		params.sign,
		params.gasLess,
	);
	if (!verify) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
};
export const dex_user_cancel_copy_gasless = async (_, args: any) => {
	const session = mongo.startSession();
	try {
		const params = args as CancelCopyGasLessInput;
		await validateInput(params);
		await isBaseFeeAccept();
		session.startTransaction();
		await DAO.copy_proofs.deleteProof(
			params.gasLess.owner,
			params.sign,
			params.master_address,
			session,
		);
		await PushNewNotification({
			address: params.gasLess.owner,
			type: "CancelCopyMaster",
			payload: {
				signature: params.sign,
				position: { masterId: params.master_address },
			},
			status: "Success",
			session,
		});
		await session.commitTransaction();
		return "Success";
	} catch (e) {
		if (session.inTransaction()) await session.abortTransaction();
		ErrorHandler(e, { args }, dex_user_cancel_copy_gasless.name).throwErr();
	} finally {
		await session.endSession();
	}
};
