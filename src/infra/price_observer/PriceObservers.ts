import { Decimal128, ObjectId } from "mongodb";
import { PRICE_ATOMIC } from "../../config";
import { IObserver, ISubject } from "../../lib/design_pattern/observer";
import { PublishNewPrice } from "../../server/apollo/resolvers/subscription";
import { ECloseType } from "../blockchain/viem/contract/position_contract/event";
import { DAO } from "../database/mongo/methods";
import { TOrder } from "../database/mongo/models/Order";
import { TTrade } from "../database/mongo/models/Trade";
import { PriceTrigger } from "../price_trigger/PriceTrigger";
import { TriggeredTradeController } from "../triggered_trade_controller/TriggeredTradeController";
import { PriceSubject } from "./PriceSubject";

const DUPLICATE_ERROR = [
	"Returned error: execution reverted: !sign-used",
	"Returned error: execution reverted: !signature",
	"Returned error: execution reverted: !expire",
	"Returned error: execution reverted: !exist",
];
class PublishPriceObserver implements IObserver {
	public name = "PublishPriceObserver";
	update(subject: ISubject): void {
		if (subject instanceof PriceSubject) {
			PublishNewPrice(subject.pair_id, subject.price, subject.chainlink_price);
		}
	}
}

export type ETriggerAction =
	| "TriggerLimit"
	| "TriggerStop"
	| "TriggerLiquidation"
	| "TriggerSL"
	| "TriggerTP"
	| "TriggerCloseCopy"
	| "TriggerMarket"
	| "None";
class TriggerLimitPriceObserver implements IObserver {
	public name = "TriggerLimitPriceObserver";
	private _running = false;
	private _last_running_price = 0;
	constructor(
		private _price_trigger: PriceTrigger,
		private _triggered_trade_controller: TriggeredTradeController,
	) {}

	async update(subject: ISubject): Promise<void> {
		const now = new Date();
		const trigger_order_ids: string[] = [];
		try {
			if (subject instanceof PriceSubject && !this._running) {
				this._last_running_price = subject.price;
				this._running = true;
				const all_active_order = await DAO.orders.GetAllActiveOrdersByPair(
					subject.pair_id,
				);
				if (all_active_order.data.length) {
					console.log(`${now}: ${this.name} running ...`);
					console.log({
						price: this._last_running_price,
						moving: subject.moving_direction,
					});
					console.log(
						`>>> found ${all_active_order.data.length} orders active!`,
					);
					for (const order of [...all_active_order.data]) {
						const order_id = order._id.toHexString();
						trigger_order_ids.push(order_id);
						if (
							this._triggered_trade_controller.isTriggeredId(order_id, "Open")
						)
							continue;
						this._triggered_trade_controller.setTriggeredId(order_id, "Open");

						const action = this._getActionForOrder(order, subject.price);
						console.log(`Try to trigger ${action} order=${order._id}`);
						switch (action) {
							case "TriggerLimit":
								if ("limitPrice" in order) {
									console.log(`Trigger Limit order=${order._id}`);
									try {
										const trigger_id = await this._price_trigger.Limit(order);
										await DAO.orders.MarkTriggerOrder(order._id, trigger_id);
									} catch (e: any) {
										const message = "message" in e ? e?.message : "";
										if (DUPLICATE_ERROR.includes(message)) {
											await DAO.orders.InactiveOrder(
												order._id,
												true,
												order.orderId,
												order.txId,
											);
										}
										console.log(`${this.name} TriggerLimit ERROR`);
										await DAO.orders.MarkTriggerError(order._id, e);
										console.log(e);
									}
								}
								break;
							case "TriggerStop":
								if ("limitPrice" in order) {
									console.log(`Trigger Stop order=${order._id}`);
									try {
										const trigger_id = await this._price_trigger.Limit(order);
										await DAO.orders.MarkTriggerOrder(order._id, trigger_id);
									} catch (e: any) {
										const message = "message" in e ? e?.message : "";
										if (DUPLICATE_ERROR.includes(message)) {
											await DAO.orders.InactiveOrder(
												order._id,
												true,
												order.orderId,
												order.txId,
											);
										}
										console.log(`${this.name} TriggerStop ERROR`);
										await DAO.orders.MarkTriggerError(order._id, e);
										console.log(e);
									}
								}
								break;
							default:
								console.log(`None trigger order=${order._id}`);
								break;
						}
						this._triggered_trade_controller.delTriggeredId(order_id, "Open");
					}
					console.log(`${now}: ${this.name} ending`);
				} else {
					await DAO.orders.UpdateExpireOrder();
				}
			}
		} catch (e) {
			console.log(e);
		} finally {
			this._running = false;
			trigger_order_ids.map((id) =>
				this._triggered_trade_controller.delTriggeredId(id, "Open"),
			);
		}
	}
	private _getNumberPriceFromDecimal = (decimal_price: Decimal128) =>
		Number(BigInt(decimal_price.toString()) / BigInt(PRICE_ATOMIC));
	private _getActionForOrder = (
		order: TOrder | TTrade,
		price: number,
	): ETriggerAction => {
		if ("limitPrice" in order && order.limitPrice) {
			const isLimitOrder = order.orderType === "LIMIT";
			const limitPrice = this._getNumberPriceFromDecimal(order.limitPrice);
			const isTriggerLimit =
				(isLimitOrder && order.isLong && price <= limitPrice) ||
				(isLimitOrder && !order.isLong && price >= limitPrice);
			if (isTriggerLimit) return "TriggerLimit";
			const isTriggerStop =
				(!isLimitOrder && order.isLong && price >= limitPrice) ||
				(!(isLimitOrder || order.isLong) && price <= limitPrice);
			if (isTriggerStop) return "TriggerStop";
		}
		return "None";
	};
}

class TriggerClosePriceObserver implements IObserver {
	public name = "TriggerClosePriceObserver";
	private _running = false;
	private _last_running_price = 0;
	constructor(
		private _price_trigger: PriceTrigger,
		private _triggered_trade_controller: TriggeredTradeController,
	) {}

	async update(subject: ISubject): Promise<void> {
		const now = new Date();
		const trigger_trade_ids: string[] = [];
		try {
			if (subject instanceof PriceSubject && !this._running) {
				this._last_running_price = subject.price;
				this._running = true;
				const all_active_trade = await DAO.trades.GetAllTriggerTrade(
					subject.pair_id,
					subject.price,
					subject.moving_direction,
				);
				if (all_active_trade.data.length) {
					console.log(`${now}: ${this.name} running ...`);
					console.log({
						price: this._last_running_price,
						moving: subject.moving_direction,
					});
					console.log(
						`>>> found ${all_active_trade.data.length} trades active!`,
					);
					console;
					const trade_ids: string[] = [];
					const trade_obj_ids: ObjectId[] = [];
					const pair_ids: number[] = [];
					const close_types: ECloseType[] = [];
					for (const trade of [...all_active_trade.data]) {
						const trade_id = trade._id.toHexString();
						trigger_trade_ids.push(trade_id);
						if (
							this._triggered_trade_controller.isTriggeredId(trade_id, "Close")
						)
							continue;
						this._triggered_trade_controller.setTriggeredId(trade_id, "Close");
						const action = this._getActionForOrder(trade, subject.price);
						console.log(`Try to trigger ${action} order=${trade._id}`);
						switch (action) {
							case "TriggerLiquidation":
								if ("traderId" in trade && "pairId" in trade) {
									console.log(`Trigger Liquidation order=${trade._id}`);
									// try {
									//     let trigger_id = await this._price_trigger.Liquidation([order.traderId], [order.pairId])
									//     await DAO.trades.MarkTriggerTrade(order._id, trigger_id, "TriggerLiquidation")
									// } catch (e: any) {
									//     console.log(this.name + " TriggerLiquidation" + " ERROR")
									//     await DAO.trades.MarkTriggerTradeError(order._id, e, "TriggerLiquidation")
									//     console.log(e)
									// }
									trade_obj_ids.push(trade._id);
									trade_ids.push(trade.traderId);
									pair_ids.push(trade.pairId);
									close_types.push(ECloseType.Liquidation);
								}
								break;
							case "TriggerSL":
								if ("traderId" in trade && "pairId" in trade) {
									console.log(`Trigger SL order=${trade._id}`);
									// try {
									//     // TODO:
									//     // let { txid } = await this._price_trigger.StopLoss(order.traderId, order.pairId)
									//     // await DAO.trades.MarkTriggerTrade(order._id, txid, "TriggerSL")
									// } catch (e: any) {
									//     console.log(this.name + " TriggerSL" + " ERROR")
									//     await DAO.trades.MarkTriggerTradeError(order._id, e, "TriggerSL")
									//     console.log(e)
									// }
									trade_obj_ids.push(trade._id);
									trade_ids.push(trade.traderId);
									pair_ids.push(trade.pairId);
									close_types.push(ECloseType.SL);
								}
								break;
							case "TriggerTP":
								if ("traderId" in trade && "pairId" in trade) {
									console.log(`Trigger TP order=${trade._id}`);
									// try {
									//     // TODO:
									//     // let { txid } = await this._price_trigger.TakeProfit(order.traderId, order.pairId)
									//     // await DAO.trades.MarkTriggerTrade(order._id, txid, "TriggerTP")
									// }
									// catch (e: any) {
									//     console.log(this.name + " TriggerTP" + " ERROR")
									//     await DAO.trades.MarkTriggerTradeError(order._id, e, "TriggerTP")
									//     console.log(e)
									// }
									trade_obj_ids.push(trade._id);
									trade_ids.push(trade.traderId);
									pair_ids.push(trade.pairId);
									close_types.push(ECloseType.TP);
								}
								break;
							default:
								console.log(`None trigger order=${trade._id}`);
								break;
						}
					}
					if (trade_ids.length) {
						const trigger_id = await this._price_trigger.ClosePositions(
							trade_ids,
							pair_ids,
							close_types,
						);
						await DAO.trades.MarkTriggerTrades(trade_obj_ids, trigger_id);
					}
					this._triggered_trade_controller.delTriggeredIds(
						trade_ids.map((el) => ({ id: el, action: "Close" })),
					);
					console.log(`${now}: ${this.name} ending`);
				}
			}
		} catch (e) {
			console.log(e);
		} finally {
			this._running = false;
			trigger_trade_ids.map((id) =>
				this._triggered_trade_controller.delTriggeredId(id, "Close"),
			);
		}
	}
	private _getNumberPriceFromDecimal = (decimal_price: Decimal128) =>
		Number((BigInt(decimal_price.toString()) * 10000n) / PRICE_ATOMIC) / 10000;
	private _getActionForOrder = (
		order: TTrade,
		price: number,
	): ETriggerAction => {
		const liquidationPrice = this._getNumberPriceFromDecimal(
			order.liquidationPrice,
		);
		const isTriggerLiquidation =
			(order.isLong && price <= liquidationPrice) ||
			(!order.isLong && price >= liquidationPrice);
		if (isTriggerLiquidation) return "TriggerLiquidation";
		if (order.tp && order.tp.toString() !== "0") {
			const TpPrice = this._getNumberPriceFromDecimal(order.tp);
			const isTriggerTP =
				(order.isLong && price >= TpPrice) ||
				(!order.isLong && price <= TpPrice);
			if (isTriggerTP) return "TriggerTP";
		}
		if (order.sl && order.sl.toString() !== "0") {
			const SlPrice = this._getNumberPriceFromDecimal(order.sl);
			const isTriggerSL =
				(order.isLong && price <= SlPrice) ||
				(!order.isLong && price >= SlPrice);
			if (isTriggerSL) return "TriggerSL";
		}
		return "None";
	};
}

export {
	PublishPriceObserver,
	TriggerLimitPriceObserver,
	TriggerClosePriceObserver,
};
