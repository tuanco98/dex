import {
	AnyBulkWriteOperation,
	ClientSession,
	Decimal128,
	Filter,
	ObjectId,
	Sort,
	WithId,
} from "mongodb";
import { DAO } from ".";
import { copy_trigger, system_status } from "../../..";
import { BPS, LIQUIDATION_RATE, PRICE_ATOMIC } from "../../../../config";
import { MILLISECOND_PER_ONE_SEC } from "../../../../lib/constants";
import { ErrorHandler } from "../../../../lib/error_handler";
import { timeSystem } from "../../../../lib/time_sys";
import { lowerCase } from "../../../../lib/utils";
import { PublishNewTrade } from "../../../../server/apollo/resolvers/subscription";
import { TFundingUpdatedEvent } from "../../../blockchain/viem/contract/funding_contract/event";
import {
	ECloseType,
	TClosePositionEvent,
	TCopyPositionEvent,
	TOpenPositionEvent,
	TUpdateSLEvent,
	TUpdateTPEvent,
	getNotificationTypeClosePosition,
} from "../../../blockchain/viem/contract/position_contract/event";
import { TNewShareEvent } from "../../../blockchain/viem/contract/profit_share/event";
import { PushNewNotification } from "../../../notification";
import { ETriggerAction } from "../../../price_observer/PriceObservers";
import { TTrade } from "../models/Trade";
import { collections } from "../mongo";
import { EUnitDateTrunc, getErrMsg, getLiquidationPrice, toDecimal128 } from "./helper";
import { getOracleFee } from "../../../blockchain/viem/viem.helper";
import { Hex } from "viem";


const getMany = async (
	query: Filter<TTrade>,
	page: number,
	pageSize: number,
	skip_get_total = false,
	sort?: Sort,
	session?: ClientSession,
) => {
	if (!skip_get_total) {
		const [data, total] = await Promise.all([
			await collections.trades
				.find(query, { session })
				.skip(page * pageSize)
				.sort(sort ? sort : {})
				.limit(pageSize)
				.toArray(),
			collections.trades.countDocuments(query, { session }),
		]);
		return {
			data,
			total,
		};
	} else {
		const data = await collections.trades
			.find(query, { session })
			.skip(page * pageSize)
			.limit(pageSize)
			.toArray();
		return {
			data,
		};
	}
};

const getDAO = () => ({
	common: collections.trades,
	getMany,
	OpenTrade: async (
		openTradeEvent: TOpenPositionEvent,
		txid: string,
		session?: ClientSession,
	) => {
		try {
			const { entryPrice, fundingTracker, isLong, leverage, amount } =
				openTradeEvent;
			const pair = system_status.getPair(openTradeEvent.pairId);
			const updateAt: Date = new Date();
			const trade_info = await collections.trades.findOne(
				{ traderId: openTradeEvent.id },
				{ session },
			);
			if (trade_info?.openTx) {
				if (openTradeEvent.amount === BigInt(0)) {
					//close trade
					const { value } = await collections.trades.findOneAndUpdate(
						{ traderId: trade_info.traderId },
						{
							$set: {
								isActive: false,
								updateAt,
							},
						},
						{ session, returnDocument: "after" },
					);
					if (value) PublishNewTrade(value);
					return null;
				} else {
					//Edit trade
					const { value } = await collections.trades.findOneAndUpdate(
						{ traderId: trade_info.traderId },
						{
							$set: {
								leverage: Number(leverage),
								updateAt,
								entryPrice: new Decimal128(entryPrice.toString()),
								amount: new Decimal128(amount.toString()),
								fundingTracker: new Decimal128(fundingTracker.toString()),
								liquidationPrice: new Decimal128(
									getLiquidationPrice({
										amount,
										currentFundingTracker: fundingTracker,
										entryPrice,
										fundingTracker: BigInt(
											trade_info.fundingTracker.toString(),
										),
										isLong,
										leverage: Number(leverage),
										liquidationRate: pair?.liqThreshold
											? BigInt(BPS) - BigInt(pair.liqThreshold)
											: LIQUIDATION_RATE,
										pair_id: trade_info.pairId,
									}).toString(),
								),
							},
							$addToSet: {
								editTxs: txid.toLowerCase(),
							},
						},
						{ upsert: true, session, returnDocument: "after" },
					);
					if (value) {
						const oracleFee = await getOracleFee(txid as Hex, value.traderId)
						PushNewNotification({
							address: lowerCase(value.owner),
							type: !value.isCopy ? "EditPosition" : "EditCopy",
							payload: {
								txid,
								oracleFee: oracleFee !== 0n ? oracleFee.toString() : undefined,
								position: {
									orderId: value.traderId,
									isLong,
									pairId: value.pairId,
									price: entryPrice.toString(),
									masterId: value.masterAddress,
								},
							},
							status: "Success",
						});
						PublishNewTrade(value);
					}
					//Handle Edit Copy Trade
					const isEdit =
						!(
							amount === BigInt(trade_info.amount.toString()) &&
							entryPrice === BigInt(trade_info.entryPrice.toString())
						) || leverage !== BigInt(trade_info.leverage);
					const isNotFollow =
						entryPrice === BigInt(trade_info.entryPrice.toString()) &&
						leverage === BigInt(trade_info.leverage);

					if (isEdit && !trade_info.isCopy) {
						if (!isNotFollow) {
							const all_link_trades = await collections.trades
								.find(
									{
										linkTrade: trade_info.traderId,
										isCopy: true,
										isActive: true,
										closeTx: { $exists: false },
										closeFee: { $exists: false },
									},
									{ session },
								)
								.toArray();
							copy_trigger.ExecuteEditCopy(all_link_trades);
						}
					}
				}
			} else {
				//new trade open
				const {
					entryPrice,
					fundingTracker,
					isLong,
					leverage,
					amount,
					masterId,
					timestamp,
					pairId,
					owner,
					id,
				} = openTradeEvent;
				console.log({ owner, id, masterId });

				const new_trade: TTrade = {
					owner: lowerCase(owner),
					pairId: Number(pairId),
					traderId: id,
					isLong: isLong,
					leverage: Number(leverage),
					originAmount: new Decimal128(amount.toString()),
					amount: new Decimal128(amount.toString()),
					tp: new Decimal128("0"),
					sl: new Decimal128("0"),
					isActive: true,
					orderAt: new Date(timestamp * MILLISECOND_PER_ONE_SEC),
					updateAt: new Date(),
					openTx: txid,
					entryPrice: new Decimal128(entryPrice.toString()),
					fundingTracker: new Decimal128(fundingTracker.toString()),
					liquidationPrice: new Decimal128(
						getLiquidationPrice({
							amount,
							currentFundingTracker: fundingTracker,
							entryPrice,
							fundingTracker: fundingTracker,
							isLong,
							leverage: Number(leverage),
							liquidationRate: pair?.liqThreshold
								? BigInt(BPS) - BigInt(pair.liqThreshold)
								: LIQUIDATION_RATE,
							pair_id: Number(pairId),
						}).toString(),
					),
					triggerStatus: "NONE",
				};
				const isCopy = parseInt(masterId, 16) !== 0;
				const masterTrade = await collections.trades.findOne({
					traderId: masterId,
				});
				if (isCopy) {
					new_trade.isCopy = true;
					new_trade.linkTrade = masterId;
					if (masterTrade) {
						new_trade.masterAddress = masterTrade.owner;
					}
				}
				if (!trade_info) {
					await collections.trades.insertOne(new_trade, { session });
				} else {
					await collections.trades.updateOne(
						{
							traderId: new_trade.traderId,
						},
						{
							$set: {
								...new_trade,
							},
						},
						{ session },
					);
				}
				await DAO.users.SetSponsor(owner, session);
				if (!isCopy) {
					const all_copier_proofs = await DAO.copy_proofs.getAllCopiers(owner);
					if (all_copier_proofs.length) {
						if (copy_trigger) {
							try {
								await copy_trigger.ExecuteOpenCopy(
									new_trade,
									all_copier_proofs,
								);
							} catch (e) {
								ErrorHandler(e, { new_trade }, "Execute Copy Error");
							}
						}
					}
				}
				const oracleFee = await getOracleFee(txid as Hex, new_trade.traderId)
				PushNewNotification({
					address: lowerCase(new_trade.owner),
					type: !new_trade.isCopy ? "OpenPosition" : 'Copy',
					payload: {
						txid,
						oracleFee: oracleFee !== 0n ? oracleFee.toString() : undefined,
						position: {
							orderId: new_trade.traderId,
							isLong,
							pairId: new_trade.pairId,
							price: entryPrice.toString(),
							masterId: new_trade.masterAddress,
						},
					},
					status: "Success",
				});
				PublishNewTrade(new_trade as WithId<TTrade>);
				return new_trade;
			}
		} catch (error) {
			throw error;
		}
	},
	CloseTrade: async (
		closeTradeEvent: TClosePositionEvent,
		txid: string,
		session?: ClientSession,
	) => {
		const trade_info = await collections.trades.findOne({
			traderId: closeTradeEvent.id,
		});
		if (trade_info) {
			const notification_type = getNotificationTypeClosePosition(closeTradeEvent.closeType);
			const pnl = new Decimal128(closeTradeEvent.pnl.toString());
			switch (closeTradeEvent.closeType) {
				case ECloseType.DecreasePosition:
					await collections.trades.findOneAndUpdate(
						{
							traderId: closeTradeEvent.id,
						},
						{
							$set: {
								pnl,
								updateAt: new Date(),
							},
							$push: {
								editTxs: txid,
							},
						},
						{ session },
					);
					break;
				default: {
					const { value } = await collections.trades.findOneAndUpdate(
						{
							traderId: closeTradeEvent.id,
						},
						{
							$set: {
								isActive: false,
								pnl,
								closeTx: txid,
								closePrice: new Decimal128(
									closeTradeEvent.closePrice.toString(),
								),
								updateAt: new Date(),
								closeType: closeTradeEvent.closeType,
								triggerStatus: "SUCCESS",
								triggerCloseTxid: txid,
							},
						},
						{ session },
					);
					if (value && notification_type) {
						const oracleFee = await getOracleFee(txid as Hex, value.traderId)
						PushNewNotification({
							address: lowerCase(value.owner),
							type: notification_type,
							payload: {
								txid,
								oracleFee: oracleFee !== 0n ? oracleFee.toString() : undefined,
								position: {
									orderId: value.traderId,
									pairId: value.pairId,
									price: closeTradeEvent.closePrice.toString(),
									pnl: pnl.toString(),
								},
							},
							status: "Success",
						});
					}
					break;
				}
			}
		}
	},
	UserCloseGasLessTrade: async (
		id: string,
		txId: string,
		session?: ClientSession,
	) => {
		return collections.trades.updateOne(
			{
				traderId: id,
			},
			{
				$set: {
					isActive: false,
					closeTx: txId,
					updateAt: new Date(),
				},
			},
			{ session },
		);
	},
	GetActiveTrades: async (
		address: string,
		pairId: number | null | undefined,
		page: number,
		pageSize: number,
	) => {
		let filter: Filter<TTrade>;
		if (pairId == null) {
			filter = { owner: address, isActive: true };
		} else {
			filter = { owner: address, pairId: pairId, isActive: true };
		}
		return getMany(filter, page, pageSize, false, { orderAt: -1 });
	},
	GetInactiveTrades: async (
		address: string,
		pairId: number | null | undefined,
		page: number,
		pageSize: number,
	) => {
		let filter: Filter<TTrade>;
		if (pairId == null) {
			filter = { owner: address, isActive: false };
		} else {
			filter = { owner: address, pairId, isActive: false };
		}
		return getMany(filter, page, pageSize, false, { updateAt: -1 });
	},
	UpdateSL: async (
		updateSLEvent: TUpdateSLEvent,
		transactionHash: string,
		session?: ClientSession,
	) => {
		const { value } = await collections.trades.findOneAndUpdate(
			{ traderId: updateSLEvent.id },
			{
				$set: { sl: new Decimal128(updateSLEvent.sl.toString()) },
				$addToSet: { editTxs: transactionHash.toLowerCase() },
			},
			{ session, returnDocument: "after" },
		);
		if (value) {
			const oracleFee = await getOracleFee(transactionHash as Hex, value.traderId)
			PushNewNotification({
				address: lowerCase(value.owner),
				type: "EditPosition",
				payload: {
					txid: transactionHash,
					oracleFee: oracleFee !== 0n ? oracleFee.toString() : undefined,
					position: {
						orderId: value.traderId,
						pairId: value.pairId,
						sl: updateSLEvent.sl.toString(),
					},
				},
				status: "Success",
			});
			PublishNewTrade(value);
		}
		return value;
	},
	UpdateTP: async (
		updateTPEvent: TUpdateTPEvent,
		transactionHash: string,
		session?: ClientSession,
	) => {
		const { value } = await collections.trades.findOneAndUpdate(
			{ traderId: updateTPEvent.id },
			{
				$set: { tp: new Decimal128(updateTPEvent.tp.toString()) },
				$addToSet: { editTxs: transactionHash.toLowerCase() },
			},
			{ session, returnDocument: "after" },
		);
		if (value) {
			const oracleFee = await getOracleFee(transactionHash as Hex, value.traderId)
			PushNewNotification({
				address: lowerCase(value.owner),
				type: "EditPosition",
				payload: {
					txid: transactionHash,
					oracleFee: oracleFee !== 0n ? oracleFee.toString() : undefined,
					position: {
						orderId: value.traderId,
						pairId: value.pairId,
						tp: updateTPEvent.tp.toString(),
					},
				},
				status: "Success",
			});
			PublishNewTrade(value);
		}
		return value;
	},
	GetAllTriggerTrade: async (
		pair_id: number,
		price: number,
		price_moving: "up" | "down" | "none",
		session?: ClientSession,
	) => {
		let query: Filter<TTrade> = {};
		const atomic_price = BigInt(price * Number(PRICE_ATOMIC));
		if (price_moving === "up") {
			query = {
				pairId: pair_id,
				isActive: true,
				closeTx: { $exists: false },
				triggerStatus: "NONE",
				$or: [
					{
						isLong: true,
						tp: {
							$lte: toDecimal128(atomic_price),
							$ne: toDecimal128(BigInt(0)),
						},
					}, //Long tp
					{
						isLong: false,
						sl: {
							$lte: toDecimal128(atomic_price),
							$ne: toDecimal128(BigInt(0)),
						},
					}, //Short sl
					{
						isLong: false,
						liquidationPrice: { $lte: toDecimal128(atomic_price) },
					}, //Short liquidation
				],
			};
		} else if (price_moving === "down") {
			query = {
				pairId: pair_id,
				isActive: true,
				closeTx: { $exists: false },
				triggerStatus: "NONE",
				$or: [
					{
						isLong: false,
						tp: {
							$gte: toDecimal128(atomic_price),
							$ne: toDecimal128(BigInt(0)),
						},
					}, //Short tp
					{
						isLong: true,
						sl: {
							$gte: toDecimal128(atomic_price),
							$ne: toDecimal128(BigInt(0)),
						},
					}, //Long sl
					{
						isLong: true,
						liquidationPrice: { $gte: toDecimal128(atomic_price) },
					}, //Long liquidation
				],
			};
		} else return { data: [] };
		return getMany(query, 0, 50, true, undefined, session);
	},
	UpdateAllLiquidationPrice: async (
		fundingUpdateEvent: TFundingUpdatedEvent,
		session?: ClientSession,
	) => {
		console.log("UpdateAllLiquidationPrice");
		const pair = system_status.getPair(fundingUpdateEvent.pairId);
		const query: Filter<TTrade> = { pairId: fundingUpdateEvent.pairId };
		const all_active_trade = await getMany(
			query,
			0,
			Infinity,
			true,
			undefined,
			session,
		);
		if (all_active_trade.data.length) {
			console.log(`>>found ${all_active_trade.data.length} active trades!`);
			const operations: AnyBulkWriteOperation<TTrade>[] =
				all_active_trade.data.map((trade) => ({
					updateOne: {
						filter: {
							_id: trade._id,
						},
						update: {
							$set: {
								liquidationPrice: new Decimal128(
									getLiquidationPrice({
										amount: BigInt(trade.amount.toString()),
										currentFundingTracker: BigInt(
											fundingUpdateEvent.fundingTracker,
										),
										entryPrice: BigInt(trade.entryPrice.toString()),
										fundingTracker: BigInt(trade.fundingTracker.toString()),
										isLong: trade.isLong,
										leverage: trade.leverage,
										liquidationRate: pair?.liqThreshold
											? BigInt(BPS) - BigInt(pair.liqThreshold)
											: LIQUIDATION_RATE,
										pair_id: trade.pairId,
									}).toString(),
								),
							},
						},
					},
				}));
			// try {
			// 	// operations.map((el) => {
			// 	// 	console.log(
			// 	// 		`>>>> update ${(
			// 	// 			el["updateOne"]["filter"]["_id"] as ObjectId
			// 	// 		).toHexString()}  liquidationPrice to ${(
			// 	// 			el["updateOne"]["update"]["$set"][
			// 	// 				"liquidationPrice"
			// 	// 			] as Decimal128
			// 	// 		).toString()}`,
			// 	// 	);
			// 	// });
			// } catch (e) {
			// 	console.log(e);
			// }
			await collections.trades.bulkWrite(operations, { session });
		}
	},
	MarkTriggerTrade: async (
		_id: ObjectId,
		trigger_txid: string,
		trigger_action: ETriggerAction,
		session?: ClientSession,
	) => {
		await collections.trades.updateOne(
			{ _id },
			{
				$set: {
					triggerStatus: "PENDING",
					triggerId: trigger_txid,
					triggerAction: trigger_action,
				},
			},
			{ session },
		);
	},
	MarkTriggerTrades: async (
		_ids: ObjectId[],
		trigger_txid: string,
		session?: ClientSession,
	) => {
		await collections.trades.updateMany(
			{ _id: { $in: _ids } },
			{
				$set: {
					triggerStatus: "PENDING",
					triggerId: trigger_txid,
				},
			},
			{ session },
		);
	},
	MarkTriggerTradeError: async (
		_id: ObjectId,
		trigger_err: any,
		trigger_action: ETriggerAction,
		session?: ClientSession,
	) => {
		await collections.trades.updateOne(
			{ _id },
			{
				$set: {
					triggerError: getErrMsg(trigger_err),
					triggerAction: trigger_action,
					triggerStatus: "NONE",
					triggerId: "",
				},
			},
			{ session },
		);
	},
	GetTotalPNL: async (from: Date, to: Date, data_address?: string[]) => {
		let match = {};
		if (data_address) {
			match = {
				$match: {
					updateAt: {
						$gte: from,
						$lte: to,
					},
					isActive: false,
					pnl: {
						$ne: 0,
					},
					closeTx: {
						$exists: true,
					},
					owner: {
						$in: data_address,
					},
					isCopy: true,
				},
			};
		} else {
			match = {
				$match: {
					updateAt: {
						$gte: from,
						$lte: to,
					},
					isActive: false,
					pnl: {
						$ne: 0,
					},
					closeTx: {
						$exists: true,
					},
				},
			};
		}

		const aggregateTotalPnl = [
			match,
			{
				$group: {
					_id: null,
					totalPnl: {
						$sum: "$pnl",
					},
				},
			},
			{
				$project: {
					_id: 0,
				},
			},
		];
		const dataTotalPnl = await collections.trades
			.aggregate(aggregateTotalPnl)
			.toArray();
		return dataTotalPnl.length === 0
			? new Decimal128("0")
			: (dataTotalPnl[0].totalPnl as Decimal128);
	},
	GetTradeById: async (trade_id: string, session?: ClientSession) => {
		return collections.trades.findOne({ traderId: trade_id }, { session });
	},
	GetClosedTradeById: async (trade_id: string, session?: ClientSession) => {
		return collections.trades.findOne(
			{ traderId: trade_id, isActive: false, closePrice: { $exists: true } },
			{ session },
		);
	},
	GetLeaderBoard: async (
		from: Date,
		to: Date,
		type_field: string,
		sort_by: number,
	) => {
		const handelSortField = {};
		handelSortField[type_field] = sort_by;
		const aggregateLeaderBoard = [
			{
				$match: {
					updateAt: {
						$gte: from,
						$lte: to,
					},
					isActive: false,
					closeTx: {
						$exists: true,
					},
				},
			},
			{
				$group: {
					_id: "$owner",
					pnl: {
						$sum: "$pnl",
					},
					volume: {
						$sum: {
							$multiply: ["$amount", "$leverage"],
						},
					},
					win: {
						$sum: {
							$cond: [
								{
									$gt: ["$pnl", 0],
								},
								1,
								0,
							],
						},
					},
					loss: {
						$sum: {
							$cond: [
								{
									$gt: ["$pnl", 0],
								},
								0,
								1,
							],
						},
					},
					avg_leverage: {
						$avg: "$leverage",
					},
				},
			},
			{
				$sort: handelSortField,
			},
			{
				$limit: 10,
			},
			{
				$project: {
					address: "$_id",
					_id: 0,
					pnl: 1,
					volume: 1,
					win: 1,
					loss: 1,
					avg_leverage: {
						$round: ["$avg_leverage", 1],
					},
				},
			},
		];
		const dataLeaderBoard = await collections.trades
			.aggregate(aggregateLeaderBoard)
			.toArray();
		return dataLeaderBoard;
	},
	GetTopMasters: async (options: {
		from: Date;
		to: Date;
		page: number;
		pageSize: number;
		type_field: string;
		sort_by: number;
		user_address?: string;
	}) => {
		const { from, to, page, pageSize, type_field, sort_by, user_address } =
			options;
		const handelSortField = {};
		handelSortField[type_field] = sort_by;
		let aggregateTopMasters;
		if (user_address) {
			aggregateTopMasters = [
				{
					$match: {
						updateAt: {
							$gte: from,
							$lte: to,
						},
						isActive: false,
						closeTx: {
							$exists: true,
						},
					},
				},
				{
					$group: {
						_id: "$owner",
						pnl: {
							$sum: "$pnl",
						},
						win: {
							$sum: {
								$cond: [
									{
										$gt: ["$pnl", 0],
									},
									1,
									0,
								],
							},
						},
						loss: {
							$sum: {
								$cond: [
									{
										$gt: ["$pnl", 0],
									},
									0,
									1,
								],
							},
						},
						total_collateral: {
							$sum: "$amount",
						},
					},
				},
				{
					$addFields: {
						total_trades: {
							$sum: ["$win", "$loss"],
						},
					},
				},
				{
					$lookup: {
						from: "copy_proofs",
						localField: "_id",
						foreignField: "lowerMaster",
						pipeline: [
							{
								$match: {
									isActive: true,
								},
							},
							{
								$count: "total",
							},
						],
						as: "count_copier",
					},
				},
				{
					$unwind: {
						path: "$count_copier",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: "copy_proofs",
						localField: "_id",
						foreignField: "lowerMaster",
						pipeline: [
							{
								$match: {
									isActive: true,
									lowerOwner: user_address,
								},
							},
							{
								$project: {
									_id: 0,
									signature: 1,
								},
							},
						],
						as: "result_data",
					},
				},
				{
					$unwind: {
						path: "$result_data",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "_id",
						foreignField: "address",
						pipeline: [
							{
								$project: {
									_id: 0,
									percent_share: {
										$divide: ["$copy_share_fee", 1e6],
									},
								},
							},
						],
						as: "data_share",
					},
				},
				{
					$unwind: {
						path: "$data_share",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: "trades",
						localField: "_id",
						foreignField: "masterAddress",
						pipeline: [
							{
								$match: {
									updateAt: {
										$gte: from,
										$lte: to,
									},
									isActive: false,
									isCopy: true,
								},
							},
							{
								$group: {
									_id: null,
									totalPnl: {
										$sum: "$pnl",
									},
								},
							},
							{
								$project: {
									_id: 0,
								},
							},
						],
						as: "result_pnl_copier",
					},
				},
				{
					$unwind: {
						path: "$result_pnl_copier",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						address: "$_id",
						_id: 0,
						pnl: 1,
						roi: {
							$round: [
								{
									$multiply: [
										{
											$divide: ["$pnl", "$total_collateral"],
										},
										100,
									],
								},
								2,
							],
						},
						total_trades: 1,
						signature: "$result_data.signature",
						win_rate: {
							$round: [
								{
									$multiply: [
										{
											$divide: ["$win", "$total_trades"],
										},
										100,
									],
								},
								0,
							],
						},
						total_copiers: {
							$cond: [
								{
									$eq: [
										{
											$ifNull: ["$count_copier", 0],
										},
										0,
									],
								},
								0,
								"$count_copier.total",
							],
						},
						total_pnl_copiers: {
							$cond: [
								{
									$eq: [
										{
											$ifNull: ["$result_pnl_copier", 0],
										},
										0,
									],
								},
								0,
								"$result_pnl_copier.totalPnl",
							],
						},
						percent_share: "$data_share.percent_share",
					},
				},
				{
					$sort: handelSortField,
				},
				{
					$skip: page * pageSize,
				},
				{
					$limit: pageSize,
				},
			];
		} else {
			aggregateTopMasters = [
				{
					$match: {
						updateAt: {
							$gte: from,
							$lte: to,
						},
						isActive: false,
						closeTx: {
							$exists: true,
						},
					},
				},
				{
					$group: {
						_id: "$owner",
						pnl: {
							$sum: "$pnl",
						},
						win: {
							$sum: {
								$cond: [
									{
										$gt: ["$pnl", 0],
									},
									1,
									0,
								],
							},
						},
						loss: {
							$sum: {
								$cond: [
									{
										$gt: ["$pnl", 0],
									},
									0,
									1,
								],
							},
						},
						total_collateral: {
							$sum: "$amount",
						},
					},
				},
				{
					$addFields: {
						total_trades: {
							$sum: ["$win", "$loss"],
						},
					},
				},
				{
					$lookup: {
						from: "copy_proofs",
						localField: "_id",
						foreignField: "lowerMaster",
						pipeline: [
							{
								$match: {
									isActive: true,
								},
							},
							{
								$count: "total",
							},
						],
						as: "count_copier",
					},
				},
				{
					$unwind: {
						path: "$count_copier",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "_id",
						foreignField: "address",
						pipeline: [
							{
								$project: {
									_id: 0,
									percent_share: {
										$divide: ["$copy_share_fee", 1e6],
									},
								},
							},
						],
						as: "data_share",
					},
				},
				{
					$unwind: {
						path: "$data_share",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: "trades",
						localField: "_id",
						foreignField: "masterAddress",
						pipeline: [
							{
								$match: {
									updateAt: {
										$gte: from,
										$lte: to,
									},
									isActive: false,
									isCopy: true,
								},
							},
							{
								$group: {
									_id: null,
									totalPnl: {
										$sum: "$pnl",
									},
								},
							},
							{
								$project: {
									_id: 0,
								},
							},
						],
						as: "result_pnl_copier",
					},
				},
				{
					$unwind: {
						path: "$result_pnl_copier",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						address: "$_id",
						_id: 0,
						pnl: 1,
						roi: {
							$round: [
								{
									$multiply: [
										{
											$divide: ["$pnl", "$total_collateral"],
										},
										100,
									],
								},
								2,
							],
						},
						total_trades: 1,
						win_rate: {
							$round: [
								{
									$multiply: [
										{
											$divide: ["$win", "$total_trades"],
										},
										100,
									],
								},
								0,
							],
						},
						total_copiers: {
							$cond: [
								{
									$eq: [
										{
											$ifNull: ["$count_copier", 0],
										},
										0,
									],
								},
								0,
								"$count_copier.total",
							],
						},
						total_pnl_copiers: {
							$cond: [
								{
									$eq: [
										{
											$ifNull: ["$result_pnl_copier", 0],
										},
										0,
									],
								},
								0,
								"$result_pnl_copier.totalPnl",
							],
						},
						percent_share: "$data_share.percent_share",
					},
				},
				{
					$sort: handelSortField,
				},
				{
					$skip: page * pageSize,
				},
				{
					$limit: pageSize,
				},
			];
		}
		const aggregateTotalMasters = [
			{
				$match: {
					updateAt: {
						$gte: from,
						$lte: to,
					},
					isActive: false,
					closeTx: {
						$exists: true,
					},
				},
			},
			{
				$group: {
					_id: "$owner",
				},
			},
			{
				$count: "total",
			},
		];
		const dataTopMasters = await collections.trades
			.aggregate(aggregateTopMasters)
			.toArray();
		const totalTopMasters = await collections.trades
			.aggregate(aggregateTotalMasters)
			.toArray();
		return {
			data: dataTopMasters,
			total: totalTopMasters[0]?.total || 0,
		};
	},
	GetDataRoi: async () => {
		const dateNow = new Date();
		const dateSevenDayAgo = timeSystem.getDateInFuture(dateNow, { days: -7 });
		const aggregateDataRoi = [
			{
				$match: {
					updateAt: {
						$gte: dateSevenDayAgo,
						$lte: dateNow,
					},
					isActive: false,
					closeTx: {
						$exists: true,
					},
				},
			},
			{
				$group: {
					_id: "$owner",
					pnl: {
						$sum: "$pnl",
					},
					total_collateral: {
						$sum: "$amount",
					},
				},
			},
			{
				$project: {
					_id: 0,
					address: "$_id",
					roi: {
						$round: [
							{
								$multiply: [
									{
										$divide: ["$pnl", "$total_collateral"],
									},
									100,
								],
							},
							2,
						],
					},
				},
			},
			{
				$sort: {
					roi: -1,
				},
			},
		];
		const dataRoi = await collections.trades
			.aggregate(aggregateDataRoi)
			.toArray();
		return dataRoi;
	},
	SetCopyPosition: async (
		copy_event: TCopyPositionEvent,
		session?: ClientSession,
	) => {
		return collections.trades.updateOne(
			{ traderId: copy_event.cid },
			{ $set: { isCopy: true, linkTrade: copy_event.id } },
			{ session },
		);
	},
	UnSetCopyPosition: async (tradeId: string, session?: ClientSession) => {
		return collections.trades.updateOne(
			{ traderId: tradeId },
			{ $set: { isCopy: false } },
			{ session },
		);
	},
	GetAllLinkTradeWith: async (
		trade_id: string,
		options?: TGetAllLinkTradeWithOptions,
		session?: ClientSession,
	) => {
		const query: Filter<TTrade> = {
			linkTrade: trade_id,
			isCopy: true,
			isActive: true,
			closeTx: { $exists: false },
			closeFee: { $exists: false },
		};

		if (options) {
			if (options.without_tp) query.tp = { $eq: new Decimal128("0") };
			if (options.without_sl) query.sl = { $eq: new Decimal128("0") };
		}
		return collections.trades.find(query, { session }).toArray();
	},
	UpdateMasterShare: async (
		master_share_event: TNewShareEvent,
		session?: ClientSession,
	) => {
		const { id, master, change } = master_share_event;
		await collections.trades.updateOne(
			{ traderId: id },
			{
				$inc: {
					masterShareAmount: toDecimal128(change),
				},
				$set: {
					masterAddress: lowerCase(master),
					updateAt: new Date(),
				},
			},
			{ session },
		);
	},
	GetDashBoardTracking: async (
		from: Date,
		to: Date,
	) => {
		const aggregateScripts = [
			{
				'$match': {
					orderAt: {
						'$gte': from,
						'$lte': to
					}
				}
			}, {
				'$group': {
					'_id': '$owner',
					'totalPositionOpen': {
						'$sum': 1
					},
					'totalLossPnl': {
						'$sum': {
							'$cond': [
								{
									'$lt': [
										'$pnl', 0
									]
								}, '$pnl', 0
							]
						}
					},
					'totalProfiPnl': {
						'$sum': {
							'$cond': [
								{
									'$gt': [
										'$pnl', 0
									]
								}, '$pnl', 0
							]
						}
					}
				}
			}, {
				'$group': {
					'_id': null,
					'totalUniqueUserOpenPosition': {
						'$sum': 1
					},
					'totalOpenPosition': {
						'$sum': '$totalPositionOpen'
					},
					'totalPnlLossForUser': {
						'$sum': '$totalLossPnl'
					},
					'totalPnlProfitForUser': {
						'$sum': '$totalProfiPnl'
					}
				}
			}, {
				'$project': {
					'_id': 0
				}
			}
		]
		const data = await collections.trades
			.aggregate(aggregateScripts)
			.toArray();
		return data;
	},
	GetTotalProfitPositionForUserChart: async (
		filter: {
			from: number,
			to: number,
			unit: EUnitDateTrunc,
			binSize: number
		}
	) => {
		const aggregateScripts = [
			{
				'$match': {
					'orderAt': {
						'$gte': new Date(filter.from),
						'$lte': new Date(filter.to)
					},
					'isActive': false
				}
			}, {
				'$group': {
					'_id': {
						'$dateTrunc': {
							'date': '$orderAt',
							'unit': filter.unit,
							'binSize': filter.binSize
						}
					},
					'totalLossPnl': {
						'$sum': {
							'$cond': [
								{
									'$lt': [
										'$pnl', 0
									]
								}, '$pnl', 0
							]
						}
					},
					'totalProfitPnl': {
						'$sum': {
							'$cond': [
								{
									'$gt': [
										'$pnl', 0
									]
								}, '$pnl', 0
							]
						}
					}
				}
			},
			{
				'$project': {
					'id': '$_id',
					'_id': 0,
					'totalLossPnl': 1,
					'totalProfitPnl': 1
				}
			}, {
				'$sort': {
					'_id': 1
				}
			}
		]
		const data = await collections.trades
			.aggregate(aggregateScripts)
			.toArray();
		return data;
	}
});

type DAOType = ReturnType<typeof getDAO>;

export type TGetAllLinkTradeWithOptions = {
	without_tp: boolean;
	without_sl: boolean;
};

export { getDAO as getTraderDAO, DAOType as TraderType };
