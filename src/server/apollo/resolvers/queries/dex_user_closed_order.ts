import { DAO } from "../../../../infra/database/mongo/methods";
import { ErrorHandler } from "../../../../lib/error_handler";
import { convertTOrderRequiredToOutput } from "./dex_user_orders";

/**
 * dex_user_info
 * @param parent
 * @param {LoginInput} args
 * @param ctx
 * @return {string}
 */

export const dex_user_closed_order = async (_, args: any) => {
	try {
		const { id } = args as { id: string };
		const order = await DAO.trades.GetClosedTradeById(id);
		if (!order) return null;
		return convertTOrderRequiredToOutput(order);
	} catch (e) {
		ErrorHandler(e, args, dex_user_closed_order.name).throwErr();
	}
};
