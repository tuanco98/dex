import { DAO } from "../../../../infra/database/mongo/methods";
import { mongo } from "../../../../infra/database/mongo/mongo";
import { verifySignatureSetShareFee } from "../../../../lib/auth/signature_set_share_fee";
import {
	ErrMsg,
	ErrorHandler,
	ERROR_CODE,
	validateMissing,
} from "../../../../lib/error_handler";
import { SetShareFeeInput } from "../../input/setShareFee";
/**
 * dex_user_set_share_fee
 * @param parent
 * @param {CancelCopyGasLessInput} args
 * @param ctx
 * @return {string}
 */

const isLimitDeadline = (limitExpire: number, sec_timestamp_now: number) => {
	return limitExpire > sec_timestamp_now;
};
const validateInput = async (params: SetShareFeeInput) => {
	const { gasLess } = params;
	validateMissing({
		...params,
		signature: gasLess.signature,
		owner: gasLess.owner,
		deadline: gasLess.deadline,
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
	const verify = await verifySignatureSetShareFee(
		params.new_share_fee,
		params.gasLess,
	);
	if (!verify) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
};
export const dex_user_set_share_fee = async (_, args: any) => {
	const session = mongo.startSession();
	try {
		const params = args as SetShareFeeInput;
		const { new_share_fee, gasLess } = params;
		await validateInput(params);
		await session.withTransaction(async () => {
			await DAO.users.SetCopyFee(
				gasLess.owner,
				new_share_fee,
				gasLess.signature,
			);
		});
		return "Success";
	} catch (e) {
		if (session.inTransaction()) await session.abortTransaction();
		ErrorHandler(e, { args }, dex_user_set_share_fee.name).throwErr();
	} finally {
		await session.endSession();
	}
};
