import { DAO } from "../../../../infra/database/mongo/methods";
import { ErrorHandler } from "../../../../lib/error_handler";
import { GetAuthorization, VerifyAuthorization } from "../../helper";

/**
 * dex_user_info
 * @param parent
 * @param {LoginInput} args
 * @param ctx
 * @return {string}
 */

export const dex_user_info = async (_, args: any, ctx: any) => {
	try {
		const authorization = GetAuthorization(ctx);
		const { address } = await VerifyAuthorization(authorization);
		const user_info = await DAO.users.GetUserByAddress(address);
		return user_info;
	} catch (e) {
		ErrorHandler(e, args, dex_user_info.name).throwErr();
	}
};
