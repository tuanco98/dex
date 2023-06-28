import { WithId } from "mongodb";
import { DAO } from "../../../../infra/database/mongo/methods";
import {
	TOrder,
	TOrderType,
} from "../../../../infra/database/mongo/models/Order";
import { ErrorHandler } from "../../../../lib/error_handler";
import { convertTOrderRequiredToOutput } from "./dex_user_orders";
import { TTrade } from "../../../../infra/database/mongo/models/Trade";

export const dex_user_order_details = async (_, args: any) => {
	try {
		const { id, orderType } = args as { id: string; orderType: TOrderType };
		let order: WithId<TOrder> | WithId<TTrade> | null = null;
		if (!orderType || orderType === "MARKET") {
			order = await DAO.trades.GetTradeById(id);
		} else {
			order = await DAO.orders.GetOrderById({ _id: id });
		}
		if (!order) return null;
		return convertTOrderRequiredToOutput(order);
	} catch (e) {
		ErrorHandler(e, args, dex_user_order_details.name).throwErr();
	}
};
