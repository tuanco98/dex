import { MIN_FIXED_AMOUNT_COPY } from "../../../../config";
import { IsAllowance } from "../../../../infra/blockchain/viem/contract/open_position_contract/method/OpenPositionContract";
import { isMatchAddress } from "../../../../infra/blockchain/viem/viem.helper";
import { DAO } from "../../../../infra/database/mongo/methods";
import { mongo } from "../../../../infra/database/mongo/mongo";
import { PushNewNotification } from "../../../../infra/notification";
import { verifySignatureCopyRequest } from "../../../../lib/auth/signature_user_copy_request";
import {
	ErrMsg,
	ErrorHandler,
	ERROR_CODE,
	validateMissing,
} from "../../../../lib/error_handler";
import { lowerCase } from "../../../../lib/utils";
import { GetAuthorization, VerifyAuthorization } from "../../helper";
import { UserCopyRequestInput } from "../../input/userCopyRequest";
import { isMatch } from "./../../../../lib/utils";
/**
 * dex_user_set_share_fee
 * @param parent
 * @param {CancelCopyGasLessInput} args
 * @param ctx
 * @return {string}
 */

const validateInput = async (params: UserCopyRequestInput) => {
	validateMissing({ ...params });
	if (
		(params.copy_request.fixedAmount === "0" ||
			!params.copy_request.fixedAmount) &&
		params.copy_request.percentAmount === 0
	)
		throw ErrMsg(ERROR_CODE.INVALID_COPY_AMOUNT);
	if (BigInt(params.copy_request.maxAmount) < MIN_FIXED_AMOUNT_COPY)
		throw ErrMsg(ERROR_CODE.INVALID_MAX_AMOUNT_COPY);
	if (
		isMatch(
			params.copy_request.owner.toLowerCase(),
			params.copy_request.master.toLowerCase(),
		)
	)
		throw ErrMsg(ERROR_CODE.CANT_COPY_YOURSELF);
	const isAllowance = await IsAllowance(
		params.copy_request.owner,
		params.copy_request.maxAmount,
	);
	const master = await DAO.users.GetUser(
		params.copy_request.master.toLowerCase(),
	);
	if (!master) throw ErrMsg(ERROR_CODE.MASTER_NOT_EXISTS);
	if (!isMatch(params.copy_request.sharePercent, master.copy_share_fee))
		throw ErrMsg(ERROR_CODE.INVALID_SHARE_FEE);
	const verify = await verifySignatureCopyRequest(params.copy_request);
	if (!verify) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
	if (!isAllowance) {
		const permit = await DAO.users.getPermitsByUser(
			lowerCase(params.copy_request.owner),
		);
		if (!permit)
			throw ErrMsg(ERROR_CODE.PERMIT_MISSING, "please submit permit");
	}
};
export const dex_user_copy_request = async (_, args: any, ctx: any) => {
	const session = mongo.startSession();
	try {
		const params = args as UserCopyRequestInput;
		const authorization = GetAuthorization(ctx);
		const { address } = await VerifyAuthorization(authorization);
		const { copy_request } = params;
		if (!isMatchAddress(address, copy_request.owner))
			throw ErrMsg(ERROR_CODE.ADDRESS_INVALID);
		await validateInput(params);
		session.startTransaction();
		await DAO.copy_proofs.newProof(copy_request);
		await PushNewNotification({
			address: copy_request.owner,
			type: "CopyMaster",
			payload: { position: { masterId: copy_request.master } },
			status: 'Success',
			session,
		});
		await session.commitTransaction();
		return params.copy_request.signature;
	} catch (e) {
		if (session.inTransaction()) await session.abortTransaction();
		ErrorHandler(e, { args }, dex_user_copy_request.name).throwErr();
	} finally {
		await session.endSession();
	}
};
