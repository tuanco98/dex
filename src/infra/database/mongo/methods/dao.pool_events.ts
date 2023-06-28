import { ClientSession, Decimal128 } from "mongodb";
import {
	TDepositEvent,
	TWithdrawEvent,
} from "../../../blockchain/viem/contract/pool_contract/event";
import { collections } from "../mongo";
import { EUnitDateTrunc, toDecimal128 } from "./helper";

const getDAO = () => ({
	common: collections.pool_events,
	addNewPoolEvent: async (
		event: TDepositEvent | TWithdrawEvent,
		type: "Deposit" | "Withdraw",
		txid: string,
		createAt: Date,
		session?: ClientSession,
	) => {
		return collections.pool_events.insertOne(
			{
				...event,
				amount: toDecimal128(event.amount),
				amountLp: toDecimal128(event.amountLp),
				owner: event.owner.toLowerCase(),
				type,
				txid: txid.toLowerCase(),
				createAt,
			},
			{ session },
		);
	},
	getTotalDepositMinusTotalWithdraw: async (from: Date, to: Date) => {
		const aggregateTDepositMinusTWithdraw = [
			{
				$match: {
					createAt: {
						$gte: from,
						$lt: to,
					},
				},
			},
			{
				$group: {
					_id: null,
					totalDeposit: {
						$sum: {
							$cond: [
								{
									$eq: ["$type", "Deposit"],
								},
								"$amount",
								0,
							],
						},
					},
					totalWithdraw: {
						$sum: {
							$cond: [
								{
									$eq: ["$type", "Withdraw"],
								},
								"$amount",
								0,
							],
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					totalDepositMinusTotalWithdraw: {
						$subtract: ["$totalDeposit", "$totalWithdraw"],
					},
				},
			},
		];
		const dataTDepositMinusTWithdraw = await collections.pool_events
			.aggregate(aggregateTDepositMinusTWithdraw)
			.toArray();
		if (dataTDepositMinusTWithdraw.length === 0) return new Decimal128("0");
		return dataTDepositMinusTWithdraw[0]
			.totalDepositMinusTotalWithdraw as Decimal128;
	},
	GetPoolEventsChart: async (filter: {
		from: number,
		to: number,
		unit: EUnitDateTrunc,
		binSize: number
	}) => {
		const aggregateScripts = [
			{
				'$match': {
					'createAt': {
						'$gte': new Date(filter.from),
						'$lte': new Date(filter.to)
					}
				}
			}, {
				'$group': {
					'_id': {
						'$dateTrunc': {
							'date': '$createAt',
							'unit': filter.unit,
							'binSize': filter.binSize
						}
					},
					'totalDeposit': {
						'$sum': {
							'$cond': [
								{
									'$eq': [
										'$type', 'Deposit'
									]
								}, '$amount', 0
							]
						}
					},
					'totalWithdraw': {
						'$sum': {
							'$cond': [
								{
									'$eq': [
										'$type', 'Withdraw'
									]
								}, '$amount', 0
							]
						}
					}
				}
			}, {
				'$project': {
					'id': '$_id',
					'_id': 0,
					'totalDeposit': 1,
					'totalWithdraw': 1
				}
			}, {
				'$sort': {
					'id': 1
				}
			}
		]
		const data = await collections.pool_events
			.aggregate(aggregateScripts)
			.toArray();
		return data;
	},
	getFirstDepositTime: async () => {
		const firstEvent = await collections.pool_events.findOne(
			{},
			{ sort: { created_at: 1 } },
		);
		if (!firstEvent) return new Date(0);
		return firstEvent.createAt;
	},
});

type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getPoolEventDAO, DAOType as PoolEventType };
