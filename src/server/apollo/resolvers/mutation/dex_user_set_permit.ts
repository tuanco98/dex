import {
	ErrMsg,
	ErrorHandler,
	ERROR_CODE,
	validateMissing,
} from "./../../../../lib/error_handler";
import { DAO } from "../../../../infra/database/mongo/methods";
import { TPermit } from "../../../../infra/database/mongo/models/Order";
import { mongo } from "../../../../infra/database/mongo/mongo";
import { verifySignaturePermit } from "../../../../lib/auth/signature_permit";

/**
 * dex_user_set_permit
 * @param parent
 * @param {LoginInput} args
 * @param ctx
 * @return {string}
 */

export const dex_user_set_permit = async (_, args: any) => {
	const session = mongo.startSession();
	try {
		const { permit } = args as { permit: TPermit };
		validateMissing({ ...permit });
		const verify_permit = await verifySignaturePermit(permit);
		if (!verify_permit) throw ErrMsg(ERROR_CODE.INVALID_PERMIT);
		await session.withTransaction(async () => {
			await DAO.users.SetPermit(permit, session);
		});
		return "Success";
	} catch (e) {
		if (session.inTransaction()) await session.abortTransaction();
		ErrorHandler(e, { args }, dex_user_set_permit.name).throwErr();
	} finally {
		await session.endSession();
	}
};
