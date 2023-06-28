import { Decimal128 } from "mongodb";
import { formatUnits, parseEther } from "viem";
import { system_status, trigger_pair_controller } from "../../../../infra";
import {
	CheckBalance,
	IsAllowance,
	OpenLimitPosition,
	OpenLimitPositionWithPermit,
	OpenPositionGasLess,
	OpenPositionGasLessWithPermit,
} from "../../../../infra/blockchain/viem/contract/open_position_contract/method/OpenPositionContract";
import {
	EOrderType,
	EPriorityTrigger,
} from "../../../../infra/blockchain/viem/types/enum";
import {
	GasLessInputType,
	OrderInputType,
	OrderLimitInputType,
} from "../../../../infra/blockchain/viem/types/type";
import {
	isBaseFeeAccept,
	isMatchAddress,
} from "../../../../infra/blockchain/viem/viem.helper";
import { DAO } from "../../../../infra/database/mongo/methods";
import {
	getDisplayLeverage,
	getPositionSize,
} from "../../../../infra/database/mongo/methods/helper";
import {
	ENotificationType
} from "../../../../infra/database/mongo/models/Notification";
import { TOrder, TPermit } from "../../../../infra/database/mongo/models/Order";
import { PushNewNotification } from "../../../../infra/notification";
import { getActionOrder } from "../../../../infra/price_observer/helper";
import { verifySignatureLimitPosition } from "../../../../lib/auth/signature_limit_position";
import { verifySignatureOpenPositionGasLess } from "../../../../lib/auth/signature_open_position";
import { MILLISECOND_PER_ONE_DAY } from "../../../../lib/constants";
import {
	ERROR_CODE,
	ErrMsg,
	ErrorHandler,
	validateMissing,
} from "../../../../lib/error_handler";
import {
	calculateAtomicPrice,
	getPrice,
	getPriceChainLink,
} from "../../helper";
import { CreateOrderGasLess } from "../../input/createGasLessInput";
import { MIN_SIZE, POOL_CONTRACT_ADDRESS } from "./../../../../config";
import { lowerCase } from "./../../../../lib/utils";

/**
 * Example
 * @param parent
 * @param {CreateOrderGasLess} args
 * @param ctx
 * @return {OutputType}
 */

const isLimitExpire = (limitExpire: number, sec_timestamp_now: number) => {
	return limitExpire > sec_timestamp_now;
};
const isLeverage = (leverage: number, pair_id: number) => {
	const pair_info = system_status.getPair(pair_id);
	if (pair_info) {
		const min_leverage = pair_info?.min_leverage;
		const max_leverage = pair_info?.max_leverage;
		if (leverage >= min_leverage && leverage <= max_leverage) return;
		throw ErrMsg(
			ERROR_CODE.INVALID_LEVERAGE,
			`x${getDisplayLeverage(
				min_leverage,
			)} <= leverage <= x${getDisplayLeverage(max_leverage)}`,
		);
	}
	throw ErrMsg(
		ERROR_CODE.PAIR_NOT_SUPPORT,
		`pairId = ${pair_id} is not support`,
	);
};
const isReadyOpenPosition = async (
	order: OrderInputType,
	gas_less: GasLessInputType,
	limitPrice?: string,
	limitExpire?: number,
) => {
	const position_size = getPositionSize(
		BigInt(order.amount),
		order.leverage,
	).toString();
	const price = getPrice(order.pairId);
	// const price = 1;
	const atomic_price = parseEther(`${price}`);
	const sec_timestamp_now = Math.floor(new Date().getTime() / 1000);

	await DAO.orders.CheckSignatureIsExist(gas_less.signature);
	await CheckBalance(gas_less.owner, order.amount);
	await isBaseFeeAccept();
	if (BigInt(position_size) < BigInt(MIN_SIZE)) {
		throw ErrMsg(
			ERROR_CODE.INVALID_POSITION_SIZE,
			`min position size ${formatUnits(MIN_SIZE, 6)}`,
		);
	}
	if (gas_less.deadline) {
		if (!(gas_less.deadline.toString().length === 10))
			throw ErrMsg(
				ERROR_CODE.INVALID_PARAMS,
				"deadline must seconds timestamp",
			);
		if (!(gas_less.deadline > sec_timestamp_now))
			throw ErrMsg(ERROR_CODE.INVALID_PARAMS, "deadline must greater than now");
	}
	isLeverage(order.leverage, order.pairId);
	if (!(limitPrice && limitExpire)) return;
	if (!(limitExpire.toString().length === 10))
		throw ErrMsg(
			ERROR_CODE.INVALID_PARAMS,
			"limitExpire must seconds timestamp",
		);
	if (!isLimitExpire(limitExpire, sec_timestamp_now))
		throw ErrMsg(
			ERROR_CODE.INVALID_PARAMS,
			"limitExpire must greater than now",
		);
	if (
		((order.orderType === "LIMIT" && order.isLong) ||
			(order.orderType === "STOP" && !order.isLong)) &&
		BigInt(atomic_price.toString()) < BigInt(limitPrice)
	) {
		throw ErrMsg(ERROR_CODE.INVALID_LIMIT_PRICE);
	}
	if (
		((order.orderType === "LIMIT" && !order.isLong) ||
			(order.orderType === "STOP" && order.isLong)) &&
		BigInt(atomic_price.toString()) > BigInt(limitPrice)
	) {
		throw ErrMsg(ERROR_CODE.INVALID_LIMIT_PRICE);
	}
};
export const dex_user_create_gasless_order = async (_, args: any) => {
	try {
		const { order, gas_less, limitPrice, limitExpire } =
			args as CreateOrderGasLess;

		validateMissing({ ...order, ...gas_less });
		await isReadyOpenPosition(order, gas_less, limitPrice);

		let isActive = true;
		let jobId: string | undefined = undefined;
		let typeNotify: ENotificationType = "OpenPosition";
		const option_trigger = {
			priority: EPriorityTrigger.OPEN_POSITION,
		};
		if (order.orderType === "MARKET") {
			const verify_signature = await verifySignatureOpenPositionGasLess(
				order,
				gas_less,
			);
			if (!verify_signature) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
			const isAllowance = await IsAllowance(gas_less.owner, order.amount);
			if (isAllowance) {
				jobId = await OpenPositionGasLess(order, gas_less, option_trigger);
			} else {
				const user = await DAO.users.GetUserByAddress(
					lowerCase(gas_less.owner),
				);
				if (
					!(
						user.permit &&
						isMatchAddress(user.permit.spender, POOL_CONTRACT_ADDRESS)
					)
				)
					throw ErrMsg(ERROR_CODE.PERMIT_MISSING, "please submit permit");
				if (!isMatchAddress(user.permit.owner, gas_less.owner))
					throw ErrMsg(ERROR_CODE.INVALID_PERMIT);
				const permit: TPermit = user.permit;
				jobId = await OpenPositionGasLessWithPermit(
					order,
					gas_less,
					permit,
					option_trigger,
				);
			}
			isActive = false;
		} else {
			validateMissing({ limitPrice, limitExpire });
			typeNotify = "OpenLimitOrder";
			const verify_signature = await verifySignatureLimitPosition({
				order,
				gas_less,
				limitPrice,
				limitExpire,
			});
			if (!verify_signature) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
			const isAllowance = await IsAllowance(gas_less.owner, order.amount);
			const chain_link_price = getPriceChainLink(order.pairId);
			const order_limit: OrderLimitInputType = {
				owner: gas_less.owner,
				isLong: order.isLong,
				orderType: EOrderType[order.orderType],
				pairId: order.pairId,
				leverage: order.leverage,
				expire:
					limitExpire ||
					Math.floor((new Date().getTime() + MILLISECOND_PER_ONE_DAY) / 1000),
				amount: order.amount.toString(),
				limitPrice: limitPrice?.toString() || chain_link_price.toString(),
				tp: order.tp.toString(),
				sl: order.sl.toString(),
				signature: gas_less.signature,
			};
			let permit: TPermit | undefined = undefined;
			if (!isAllowance) {
				const user = await DAO.users.GetUserByAddress(
					lowerCase(gas_less.owner),
				);
				permit = user?.permit;
				if (!(permit && isMatchAddress(permit.spender, POOL_CONTRACT_ADDRESS)))
					throw ErrMsg(ERROR_CODE.PERMIT_MISSING, "please submit permit");
				if (!isMatchAddress(permit.owner, gas_less.owner))
					throw ErrMsg(ERROR_CODE.INVALID_PERMIT);
			}
			const get_action_order = getActionOrder(
				{ order, gas_less, limitPrice, limitExpire },
				chain_link_price,
			);
			if (!(get_action_order === "None")) {
				if (!permit) {
					await OpenLimitPosition(order_limit, option_trigger);
				} else {
					await OpenLimitPositionWithPermit(
						order_limit,
						permit,
						option_trigger,
					);
				}
				isActive = false;
			}
		}
		const new_order: Omit<TOrder, "createdAt" | "updatedAt"> = {
			isActive,
			...order,
			...gas_less,
			amount: new Decimal128(order.amount.toString()),
			limitPrice: limitPrice
				? new Decimal128(limitPrice.toString())
				: undefined,
			limitExpire: limitExpire ? limitExpire : undefined,
			tp: new Decimal128(order.tp.toString()),
			sl: new Decimal128(order.sl.toString()),
			triggerStatus: "NONE",
		};
		const result = await DAO.orders.OpenOrder(new_order);
		await PushNewNotification({
			address: gas_less.owner,
			type: typeNotify,
			payload: {
				jobId,
				position: {
					isLong: order.isLong,
					pairId: order.pairId,
					orderId: result?.insertedId?.toString(),
					price: limitPrice || calculateAtomicPrice(
						trigger_pair_controller.getPair(order.pairId).price || 0,
					),
				},
			},
			status: typeNotify === "OpenLimitOrder" ? "Success" : "Pending",
			jobId,
		});
		return "success";
	} catch (e: any) {
		ErrorHandler(e, { args }, dex_user_create_gasless_order.name).throwErr();
	}
};
