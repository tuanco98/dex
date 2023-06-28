import { pair_controller } from "../../../../infra";
import { getDisplayLeverage } from "../../../../infra/database/mongo/methods/helper";
import { TPair } from "../../../../infra/database/mongo/models/Pair";
import { collections } from "../../../../infra/database/mongo/mongo";
import {
	MILLISECOND_PER_ONE_DAY,
	MILLISECOND_PER_ONE_SEC,
} from "../../../../lib/constants";
import { ErrorHandler } from "../../../../lib/error_handler";
import { request_validator } from "../../../../lib/validate";
import { calculateAtomicPrice } from "../../helper";

/**
 * dex_get_signature
 * @param parent
 * @param {LoginInput} args
 * @param ctx
 * @return {string}
 */

export type TQueryDataPairInfo = TPair & {
	current_price: number;
	price_24h: number;
};
export const LookUpFirstPriceStage = (
	from: Date,
	to: Date,
	isGetFirst: boolean,
	result_field_name,
) => ({
	$lookup: {
		from: "pairs_price",
		localField: "pair_id",
		foreignField: "pair_id",
		as: result_field_name,
		pipeline: [
			{
				$match: {
					timestamp: {
						$gte: from,
						$lte: to,
					},
				},
			},
			{
				$sort: {
					timestamp: 1,
				},
			},
			{
				$group: {
					_id: null,
					price: isGetFirst
						? {
								$first: "$price",
						  }
						: {
								$last: "$price",
						  },
				},
			},
			{
				$project: {
					_id: 0,
					price: 1,
				},
			},
		],
	},
});
export const ProjectStage = {
	$project: {
		_id: 0,
		pair_id: 1,
		pair_name: 1,
		createAt: 1,
		source: 1,
		max_leverage: 1,
		min_leverage: 1,
		openFee: 1,
		closeFee: 1,
		spread: 1,
		liqThreshold: 1,
		fundingTracker: 1,
		price_24h: "$result_price.price",
		current_price: "$current_price.price",
	},
};
export const dex_pair_info = async (_, args: any) => {
	try {
		const newDate = Date.now();
		const { pair_id } = args;
		request_validator.ValidateMissing({ pair_id });
		const queryAggregateGetPair = [
			{
				$match: {
					pair_id: pair_id,
				},
			},
			LookUpFirstPriceStage(
				new Date(
					newDate - MILLISECOND_PER_ONE_DAY - MILLISECOND_PER_ONE_SEC * 60,
				),
				new Date(newDate - MILLISECOND_PER_ONE_DAY),
				false,
				"result_price",
			),
			LookUpFirstPriceStage(
				new Date(newDate - MILLISECOND_PER_ONE_SEC * 60),
				new Date(),
				false,
				"current_price",
			),
			{
				$unwind: {
					path: "$result_price",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$unwind: {
					path: "$current_price",
					preserveNullAndEmptyArrays: true,
				},
			},
			ProjectStage,
		];
		const dataPair = (await collections.pairs
			.aggregate(queryAggregateGetPair)
			.toArray()) as TQueryDataPairInfo[];
		if (!dataPair) throw new Error(`Could not find pair with ID: ${pair_id}`);
		const resultDataPair = {
			...dataPair[0],
			max_leverage: getDisplayLeverage(dataPair[0].max_leverage),
			min_leverage: getDisplayLeverage(dataPair[0].min_leverage),
			current_price: calculateAtomicPrice(dataPair[0]?.current_price || 0),
			price_24h: calculateAtomicPrice(dataPair[0]?.price_24h || 0),
			chainlink_price: calculateAtomicPrice(
				pair_controller.getPair(pair_id).chainlink_price,
			),
			create_at: dataPair[0].createAt,
		};
		return resultDataPair;
	} catch (error) {
		ErrorHandler(error, args, dex_pair_info.name).throwErr();
	}
};
