import { Decimal128 } from "mongodb";
import { PRICE_ATOMIC } from "../../config";
import { CreateOrderGasLess } from "../../server/apollo/input/createGasLessInput";
import { TOrder } from "../database/mongo/models/Order";
import { ETriggerAction } from "./PriceObservers";

const getNumberPriceFromDecimal = (decimal_price: Decimal128) =>
	Number((BigInt(decimal_price.toString()) * 10000n) / PRICE_ATOMIC) / 10000;
export const getActionOrder = (
	order: TOrder | CreateOrderGasLess,
	price: number,
): ETriggerAction => {
	if ("limitPrice" in order && order.limitPrice && !("order" in order)) {
		const isLimitOrder = order.orderType === "LIMIT";
		const limitPrice = getNumberPriceFromDecimal(order.limitPrice);
		const isTriggerLimit =
			(isLimitOrder && order.isLong && price <= limitPrice) ||
			(isLimitOrder && !order.isLong && price >= limitPrice);
		if (isTriggerLimit) return "TriggerLimit";
		const isTriggerStop =
			(!isLimitOrder && order.isLong && price >= limitPrice) ||
			(!(isLimitOrder || order.isLong) && price <= limitPrice);
		if (isTriggerStop) return "TriggerStop";
	}
	if ("limitPrice" in order && order.limitPrice && "order" in order) {
		const isLimitOrder = order.order.orderType === "LIMIT";
		const limitPrice = getNumberPriceFromDecimal(
			new Decimal128(order.limitPrice),
		);
		const isTriggerLimit =
			(isLimitOrder && order.order.isLong && price <= limitPrice) ||
			(isLimitOrder && !order.order.isLong && price >= limitPrice);
		if (isTriggerLimit) return "TriggerLimit";
		const isTriggerStop =
			(!isLimitOrder && order.order.isLong && price >= limitPrice) ||
			(!(isLimitOrder || order.order.isLong) && price <= limitPrice);
		if (isTriggerStop) return "TriggerStop";
	}
	return "None";
};
