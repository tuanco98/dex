import { JobsOptions } from "bullmq";
import { pair_controller } from "..";
import { POOL_CONTRACT_ADDRESS } from "../../config";
import { ErrMsg, ERROR_CODE } from "../../lib/error_handler";
import { lowerCase } from "../../lib/utils";
import { getPrice } from "../../server/apollo/helper";
import {
	CheckBalance,
	IsAllowance,
	OpenLimitPosition,
	OpenLimitPositionWithPermit,
} from "../blockchain/viem/contract/open_position_contract/method/OpenPositionContract";
import { ECloseType } from "../blockchain/viem/contract/position_contract/event";
import { EOrderType, EPriorityTrigger } from "../blockchain/viem/types/enum";
import { OrderLimitInputType } from "../blockchain/viem/types/type";
import { isMatchAddress } from "../blockchain/viem/viem.helper";
import { DAO } from "../database/mongo/methods";
import { TOrder, TPermit } from "../database/mongo/models/Order";
import { IPriceTrigger } from "./IPriceTrigger";
import {
	ClosePosition,
	ClosePositions,
} from "../blockchain/viem/contract/processor_contract/method/ProcessorContract";

class PriceTrigger implements IPriceTrigger {
	constructor() {}
	async Limit(order: TOrder) {
		try {
			const {
				owner,
				isLong,
				orderType,
				pairId,
				leverage,
				limitExpire,
				amount,
				limitPrice,
				tp,
				sl,
				signature,
			} = order;
			if (!limitExpire) throw new Error("limitExpire required");
			if (!limitPrice) throw new Error("limitExpire required");
			const order_limit: OrderLimitInputType = {
				owner,
				isLong,
				orderType: EOrderType[orderType],
				pairId,
				leverage,
				expire: limitExpire,
				amount: amount.toString(),
				limitPrice: limitPrice.toString(),
				tp: tp.toString(),
				sl: sl.toString(),
				signature,
			};
			const trigger_options: JobsOptions = {
				priority: EPriorityTrigger.OPEN_POSITION,
			};
			const isAllowance = await IsAllowance(owner, amount.toString());
			let receipt: string;
			if (isAllowance) {
				await CheckBalance(owner, amount.toString());
				receipt = await OpenLimitPosition(order_limit, trigger_options);
			} else {
				const user = await DAO.users.GetUserByAddress(lowerCase(owner));
				if (
					!(
						user.permit &&
						isMatchAddress(user.permit.spender, POOL_CONTRACT_ADDRESS)
					)
				)
					throw ErrMsg(ERROR_CODE.PERMIT_MISSING, "please submit permit");
				if (!isMatchAddress(user.permit.owner, owner))
					throw ErrMsg(ERROR_CODE.INVALID_PERMIT);
				await CheckBalance(owner, amount.toString());
				const permit: TPermit = user.permit;
				receipt = await OpenLimitPositionWithPermit(
					order_limit,
					permit,
					trigger_options,
				);
			}
			return receipt;
		} catch (e) {
			throw e;
		}
	}
	async Stop(order_id: string, pair_id: number) {
		try {
			const price = getPrice(pair_id);
			const result = await ClosePosition(order_id, price, ECloseType.TP);
			return result;
		} catch (e) {
			throw e;
		}
	}
	async TakeProfit(order_id: string, pair_id: number) {
		try {
			const price = getPrice(pair_id);
			const trigger_options: JobsOptions = {
				priority: EPriorityTrigger.TAKE_PROFIT,
			};
			const result = await ClosePosition(
				order_id,
				price,
				ECloseType.TP,
				trigger_options,
			);
			return result;
		} catch (e) {
			throw e;
		}
	}
	async StopLoss(order_id: string, pair_id: number) {
		try {
			const price = getPrice(pair_id);
			const trigger_options: JobsOptions = {
				priority: EPriorityTrigger.STOP_LOSS,
			};
			const result = await ClosePosition(
				order_id,
				price,
				ECloseType.SL,
				trigger_options,
			);
			return result;
		} catch (e) {
			throw e;
		}
	}
	async Liquidation(order_ids: string[], pair_ids: number[]) {
		try {
			const prices: number[] = [];
			const closeTypes: number[] = [];
			pair_ids.map((pair_id) => {
				prices.push(pair_controller.getPair(pair_id).price);
				closeTypes.push(ECloseType.Liquidation);
			});
			const trigger_options: JobsOptions = {
				priority: EPriorityTrigger.LIQUIDATION,
			};
			const result = await ClosePositions(
				order_ids,
				prices,
				closeTypes,
				trigger_options,
			);
			return result;
		} catch (e) {
			throw e;
		}
	}
	async ClosePositions(
		order_ids: string[],
		pair_ids: number[],
		closeTypes: ECloseType[],
	) {
		try {
			const prices: number[] = [];
			pair_ids.map((pair_id) => {
				prices.push(pair_controller.getPair(pair_id).price);
				closeTypes.push(ECloseType.Liquidation);
			});

			const trigger_options: JobsOptions = {
				priority: closeTypes.includes(ECloseType.Liquidation)
					? EPriorityTrigger.LIQUIDATION
					: closeTypes.includes(ECloseType.SL)
					? EPriorityTrigger.STOP_LOSS
					: closeTypes.includes(ECloseType.TP)
					? EPriorityTrigger.TAKE_PROFIT
					: EPriorityTrigger.CLOSE,
			};
			const result = await ClosePositions(
				order_ids,
				prices,
				closeTypes,
				trigger_options,
			);
			return result;
		} catch (e) {
			throw e;
		}
	}
}
export { PriceTrigger };
