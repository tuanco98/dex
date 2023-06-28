import { Decimal128, WithId } from "mongodb";
import { PRICE_ATOMIC } from "../../../../config";
import { system_status, trigger_pair_controller } from "../../../../infra";
import { DAO } from "../../../../infra/database/mongo/methods";
import {
	getDisplayLeverage,
	getPNL,
} from "../../../../infra/database/mongo/methods/helper";
import {
	TOrder,
	TOrderRequired,
} from "../../../../infra/database/mongo/models/Order";
import { TTrade } from "../../../../infra/database/mongo/models/Trade";
import { ErrorHandler } from "../../../../lib/error_handler";
import { MyOmit } from "../../../../lib/typescript-utils";
import { request_validator } from "../../../../lib/validate";
import { GetAuthorization, VerifyAuthorization } from "../../helper";
import { TUserOrdersInput } from "../../input/dex_user_orders.input";

/**
 * dex_user_info
 * @param parent
 * @param {LoginInput} args
 * @param ctx
 * @return {string}
 */

export type OutputData = Partial<
	MyOmit<TOrderRequired, "amount" | "sl" | "tp"> & {
		id?: string;
		amount?: string;
		sl?: string;
		tp?: string;
		orderAt?: Date;
		pnl?: string;
		entryPrice?: string;
		liquidationPrice?: string;
		orderType?: string;
		closePrice?: string;
		limitPrice?: string;
		closeFee?: string;
		openFee?: string;
		fundingTracker?: number;
		masterShareAmount?: string;
	}
>;

type Output = {
	total: number;
	data: OutputData[];
};

export const convertTOrderRequiredToOutput = (
	order: WithId<TOrder> | WithId<TTrade>,
) => {
	const { isLong } = order;

	const current_price = trigger_pair_controller.getPair(order.pairId).price;
	let pnl = "0";
	const limitPrice: string | undefined =
		"limitPrice" in order ? order.limitPrice?.toString() : undefined;
	if ("entryPrice" in order && order.entryPrice && order.isActive) {
		const current_funding_tracker = system_status.getPair(
			order.pairId,
		)?.fundingTracker;
		pnl = getPNL(
			isLong,
			(BigInt(Math.round(current_price * 1e8)) * PRICE_ATOMIC) / BigInt(1e8),
			BigInt(order.entryPrice.toString()),
			BigInt(order.amount.toString()),
			order.leverage,
			BigInt(order.fundingTracker?.toString() || "0"),
			BigInt(current_funding_tracker || "0"),
		).toString();
	} else if ("pnl" in order && !order.isActive) {
		pnl = order.pnl?.toString() || "0";
	}

	const output: OutputData = {
		...order,
		fundingTracker:
			"fundingTracker" in order ? Number(order.fundingTracker) : undefined,
		leverage: getDisplayLeverage(order.leverage),
		limitPrice,
		id:
			"orderId" in order
				? order.orderId
				: "traderId" in order
				? order.traderId
				: order._id.toHexString(),
		sl: order.sl.toString() || "0",
		tp: order.tp.toString() || "0",
		amount: order.amount.toString(),
		pnl,
		openFee:
			"openFee" in order && order.openFee
				? (
						BigInt(order.openFee.toString()) +
						BigInt(order.executionFeeOpen?.toString() || 0)
				  ).toString()
				: undefined,
		closeFee:
			"closeFee" in order && order.closeFee
				? (
						BigInt(order.closeFee.toString()) +
						BigInt(order.executionFeeClose?.toString() || 0)
				  ).toString()
				: undefined,
		entryPrice:
			"entryPrice" in order && order.entryPrice instanceof Decimal128
				? order.entryPrice.toString() || "0"
				: undefined,
		liquidationPrice:
			"liquidationPrice" in order &&
			order.liquidationPrice instanceof Decimal128
				? order.liquidationPrice.toString() || "0"
				: undefined,
		closePrice:
			"closePrice" in order && order.closePrice instanceof Decimal128
				? order.closePrice.toString() || "0"
				: undefined,
		masterShareAmount:
			"masterShareAmount" in order &&
			order.masterShareAmount instanceof Decimal128
				? order.masterShareAmount.toString()
				: undefined,
	};
	return output;
};

export const dex_user_orders = async (_, args: any, ctx: any) => {
	try {
		const {
			order_type,
			pair_id,
			page = 0,
			pageSize = 10,
		} = args as TUserOrdersInput;
		request_validator.ValidatePagination({ page, pageSize });
		const authorization = GetAuthorization(ctx);
		const { address } = await VerifyAuthorization(authorization);
		if (order_type === "order") {
			const { data, total } = await DAO.orders.GetActiveOrders(
				address,
				pair_id,
				page,
				pageSize,
			);
			return {
				total,
				data: data.map(convertTOrderRequiredToOutput),
			} as Output;
		}
		if (order_type === "position") {
			const { data, total } = await DAO.trades.GetActiveTrades(
				address,
				pair_id,
				page,
				pageSize,
			);
			return {
				total,
				data: data.map(convertTOrderRequiredToOutput),
			} as Output;
		}
		if (order_type === "history") {
			const { data, total } = await DAO.trades.GetInactiveTrades(
				address,
				pair_id,
				page,
				pageSize,
			);
			return {
				total,
				data: data.map(convertTOrderRequiredToOutput),
			} as Output;
		}
	} catch (e) {
		ErrorHandler(e, args, dex_user_orders.name).throwErr();
	}
};
