import { OrderInputType } from "../../../../infra/blockchain/viem/types/type";
import { getSignatureOpenPositionGasLess } from "../../../../lib/auth/signature_open_position";
import { ErrorHandler } from "./../../../../lib/error_handler";

export const dex_user_get_sign_gasless = async (_, args: any) => {
	try {
		const { order, private_key, deadline } = args as {
			order: OrderInputType;
			private_key: string;
			limitPrice: string;
			limitExpire: number;
			deadline?: number;
		};
		let sign: null | any = null;
		if (order.orderType === "MARKET") {
			sign = await getSignatureOpenPositionGasLess(
				order,
				private_key,
				deadline,
			);
		}
		return sign;
	} catch (e) {
		ErrorHandler(e, args, dex_user_get_sign_gasless.name).throwErr();
	}
};
