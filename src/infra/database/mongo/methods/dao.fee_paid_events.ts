import { ClientSession, Decimal128, WithId } from "mongodb";
import { DAO } from ".";
import {
	EFeeTypeType,
	TFeePaidEvent,
} from "../../../blockchain/viem/contract/pool_contract/event";
import { TFeeEvent } from "../models/FeePaidEvent";
import { collections } from "../mongo";

const getDAO = () => ({
	common: collections.fee_paid_events,
	addNewEvent: async (
		event: TFeePaidEvent,
		createAt: Date,
		txid: string,
		session?: ClientSession,
	) => {
		const deposit_event = await collections.fee_paid_events.findOne({
			id: event.id,
		});
		const is_open_position_event = deposit_event ? false : true;
		await collections.fee_paid_events.insertOne(
			{
				fee: new Decimal128(event.fee.toString()),
				id: event.id,
				oracle: new Decimal128(event.oracle.toString()),
				createAt,
				txid,
				feeType: event.feeType,
				is_open_position_event,
				is_mapping: false,
				try_mapping_times: 0,
			},
			{ session },
		);
	},
	totalFee: async (from: Date, to: Date, session?: ClientSession) => {
		const aggregateTotalFee = [
			{
				$match: {
					createAt: {
						$gte: from,
						$lte: to,
					},
				},
			},
			{
				$group: {
					_id: null,
					totalFee: {
						$sum: "$fee",
					},
				},
			},
			{
				$project: {
					_id: 0,
				},
			},
		];
		const dataTotalFee = await collections.fee_paid_events
			.aggregate(aggregateTotalFee, { session })
			.toArray();
		if (dataTotalFee.length === 0) return new Decimal128("0");
		return dataTotalFee[0].totalFee as Decimal128;
	},
	GetUnMappingEvent: async (session?: ClientSession) => {
		return collections.fee_paid_events.findOne(
			{ is_mapping: false },
			{ sort: { try_mapping_times: 1 }, session },
		);
	},
	MappingPaidEvent: async (
		un_mapping_event: WithId<TFeeEvent>,
		session?: ClientSession,
	) => {
		const { id, fee, _id, feeType } = un_mapping_event;
		const trade_info = await DAO.trades.GetTradeById(id, session);
		if (!trade_info) {
			if (
				["0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000001"].includes(id)
			) {
				await collections.fee_paid_events.updateOne(
					{ _id },
					{ $set: { is_mapping: true } },
				);
				console.log(`Trade=${id} document not complete yet! Ignore this id!`);
			} else {
				console.log(`Trade=${id} document not complete yet!`);
				await collections.fee_paid_events.updateOne(
					{ _id },
					{ $inc: { try_mapping_times: 1 } },
				);
			}
		} else {
			switch (feeType) {
				case EFeeTypeType.OnlyOracle:
					await collections.trades.updateOne(
						{ traderId: un_mapping_event.id },
						{
							$set: {
								editFee: un_mapping_event.fee,
								executionFeeEdit: un_mapping_event.oracle,
							},
						},
					);
					break;
				case EFeeTypeType.ClosePosition:
					await collections.trades.updateOne(
						{ traderId: un_mapping_event.id },
						{
							$set: {
								closeFee: un_mapping_event.fee,
								executionFeeClose: un_mapping_event.oracle,
							},
						},
					);
					break;
				case EFeeTypeType.OpenPosition:
					//Open Fee Paid Event
					await DAO.users.AddCommissionForSponsor(
						trade_info.owner,
						fee,
						session,
					);
					await collections.trades.updateOne(
						{ traderId: un_mapping_event.id },
						{
							$setOnInsert: { traderId: un_mapping_event.id },
							$inc: {
								openFee: new Decimal128(un_mapping_event.fee.toString()),
								executionFeeOpen: new Decimal128(
									un_mapping_event.oracle.toString(),
								),
								originAmount: new Decimal128(
									(
										BigInt(un_mapping_event.fee.toString()) +
										BigInt(un_mapping_event.oracle.toString())
									).toString(),
								),
							},
						},
						{
							upsert: true,
						},
					);
					break;
				default:
					break;
			}

			await collections.fee_paid_events.updateOne(
				{ _id },
				{ $set: { is_mapping: true } },
				{ session },
			);
		}
	},
});

type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getFeePaidEventDAO, DAOType as FeePaidEventType };
