import { DAO } from "../../../../infra/database/mongo/methods";
import { mongo } from "../../../../infra/database/mongo/mongo";
import { ErrorHandler } from "../../../../lib/error_handler";
import { GetAuthorization, VerifyAuthorization } from "../../helper";

/**
 * dex_set_pending_ref
 * @param parent
 * @param {LoginInput} args
 * @param ctx
 * @return {string}
 */

export const dex_set_pending_ref = async (_, args: any, ctx: any) => {
	const session = mongo.startSession();
	try {
		const ref_code = args.ref_code.toLowerCase();
		const authorization = GetAuthorization(ctx);
		const { address } = await VerifyAuthorization(authorization);
		let result = {} as {
			sponsor?: string;
			pending_ref?: string;
			alert?: string;
		};
		await session.withTransaction(async () => {
			const user_info = await DAO.users.GetUserByAddress(address, session);
			if (!ref_code) {
				result = {
					sponsor: user_info.sponsor,
					pending_ref: user_info.pending_ref,
				};
				return;
			}
			if (user_info.sponsor) {
				result = {
					sponsor: user_info.sponsor,
				};
				return;
			}
			const sponsor_info = await DAO.users.GetUserByRefCode(ref_code, session);
			if (!sponsor_info) {
				result = {
					sponsor: user_info.sponsor,
					pending_ref: user_info.pending_ref,
					alert: "Ref code invalid",
				};
				return;
			}
			if (sponsor_info.address === address) {
				result = {
					sponsor: user_info.sponsor,
					pending_ref: user_info.pending_ref,
					alert: "Cannot ref yourself",
				};
				return;
			}
			await DAO.users.SetUserPendingRef(address, ref_code, session);
			result = {
				pending_ref: ref_code,
			};
			return;
		});
		return result;
	} catch (e) {
		ErrorHandler(e, { args }, dex_set_pending_ref.name).throwErr();
	}
};
