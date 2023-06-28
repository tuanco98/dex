import { ErrorHandler } from "../../../../lib/error_handler";

/**
 * Example
 * @param parent
 * @param {EditLimitOrder} args
 * @param ctx
 * @return {String}
 */
export const dex_user_edit_limit_order = async (_, args: any) => {
	try {
		// const { orderId } = args as EditLimitOrder;

		// TODO: validate input

		return "success";
	} catch (e) {
		ErrorHandler(e, { args }, dex_user_edit_limit_order.name).throwErr();
	}
};
