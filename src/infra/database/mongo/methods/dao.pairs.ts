import { ClientSession, Filter } from "mongodb";
import { system_status } from "../../..";
import { BPS, LIQUIDATION_RATE } from "../../../../config";
import { ErrorHandler } from "../../../../lib/error_handler";
import { TFundingUpdatedEvent } from "../../../blockchain/viem/contract/funding_contract/event";
import { TPairUpdatedEvent } from "../../../blockchain/viem/contract/pair_contract/event";
import { TPair, TSourcePair } from "../models/Pair";
import { collections } from "../mongo";
const common = () => collections.pairs;
const createPair = async (options: {
	pair_id: number;
	pair_name: string;
	source_pair: TSourcePair[];
	max_leverage: number;
	min_leverage: number;
}) => {
	try {
		const { pair_id, pair_name, source_pair, max_leverage, min_leverage } =
			options;
		const newDate = new Date();
		const checkLeverage = min_leverage < max_leverage;
		if (!checkLeverage) throw new Error("");
		const newDataPair: TPair = {
			pair_id,
			pair_name,
			createAt: newDate,
			source: source_pair,
			min_leverage,
			max_leverage,
			fundingTracker: 0,
			liqThreshold: (BPS - LIQUIDATION_RATE).toString(),
			updateAt: new Date(),
		};
		await collections.pairs.insertOne(newDataPair);
	} catch (error) {
		ErrorHandler(error, options, createPair.name).throwErr();
	}
};

const getPairById = async (pair_id: number) => {
	try {
		const dataPairById = await collections.pairs.findOne({ pair_id });
		return dataPairById;
	} catch (error) {
		ErrorHandler(error, { pair_id }, getPairById.name).throwErr();
	}
};

const getPairs = async (
	page: number,
	pageSize: number,
	session?: ClientSession,
) => {
	try {
		const dataPairs = await collections.pairs
			.find({}, { session })
			.skip(page * pageSize)
			.limit(pageSize)
			.sort({ pair_id: 1 })
			.project({ _id: 0, source: 0 })
			.toArray();
		return dataPairs as Omit<TPair, "source">[];
	} catch (error) {
		ErrorHandler(error, {}, getPairs.name).throwErr();
	}
};

const getTotalCountPair = () => {
	return collections.pairs.countDocuments();
};

const getMany = async (
	query: Filter<TPair>,
	page: number,
	pageSize: number,
	skip_get_total = false,
	session?: ClientSession,
) => {
	if (!skip_get_total) {
		const [data, total] = await Promise.all([
			collections.pairs
				.find(query, { session })
				.skip(page * pageSize)
				.limit(pageSize)
				.toArray(),
			collections.pairs.countDocuments(query, { session }),
		]);
		return {
			data,
			total,
		};
	} else {
		const data = await collections.pairs
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
	common: common(),
	getMany,
	create_pair: createPair,
	get_pair_by_id: getPairById,
	get_pairs: getPairs,
	get_total_count_pair: getTotalCountPair,
	updateFundingTracker: async (
		funding_update_event: TFundingUpdatedEvent,
		txid: string,
		session?: ClientSession,
	) => {
		await collections.pairs.updateOne(
			{
				pair_id: funding_update_event.pairId,
			},
			{
				$set: {
					fundingTracker: funding_update_event.fundingTracker,
					updateAt: new Date(),
					last_update_txid: txid,
				},
			},
			{ session },
		);
	},
	updatePairByEvent: async (
		pair_updated_event: TPairUpdatedEvent,
		session?: ClientSession,
	) => {
		const data = await collections.pairs.findOneAndUpdate(
			{ pair_id: pair_updated_event.pairId },
			{
				$setOnInsert: {},
				$set: {
					max_leverage: pair_updated_event.maxLeverage,
					min_leverage: pair_updated_event.minLeverage,
					spread: pair_updated_event.spread.toString(),
					openFee: pair_updated_event.openFee.toString(),
					closeFee: pair_updated_event.closeFee.toString(),
					liqThreshold: pair_updated_event.liqThreshold.toString(),
				},
			},
			{ returnDocument: "after", session },
		);
		if (data.value) {
			system_status.updatePair(data.value);
		}
		return data.value;
	},
});
type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getPairDAO, DAOType as PairType };
