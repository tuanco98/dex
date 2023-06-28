import { pair_controller } from "../../../../infra";
import { DAO } from "../../../../infra/database/mongo/methods";
import { getDisplayLeverage } from "../../../../infra/database/mongo/methods/helper";
import { collections } from "../../../../infra/database/mongo/mongo";
import {
	MILLISECOND_PER_ONE_DAY,
	MILLISECOND_PER_ONE_SEC,
} from "../../../../lib/constants";
import { ErrorHandler } from "../../../../lib/error_handler";
import { request_validator } from "../../../../lib/validate";
import { calculateAtomicPrice } from "../../helper";
import {
	LookUpFirstPriceStage,
	ProjectStage,
	TQueryDataPairInfo,
} from "./dex_pair_info";

/**
 * dex_get_signature
 * @param parent
 * @param {PairsInput} args
 * @param ctx
 * @return {PairOutput}
 */

type TQueryGetDataPairs = TQueryDataPairInfo;

export const dex_pairs_get = async (_, args: any) => {
	try {
		const newDate = Date.now();
		const { page = 0, pageSize = 10 } = args;
		request_validator.ValidatePagination({ page, pageSize });
		const queryAggregateGetPair = [
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
		const dataPairs = (await collections.pairs
			.aggregate(queryAggregateGetPair)
			.toArray()) as TQueryGetDataPairs[];
		if (!dataPairs) throw new Error(`DATA_INVALID`);
		const totalDocPair = await DAO.pairs.get_total_count_pair();
		const convertDataPairs = dataPairs.map((data) => {
			return {
				...data,
				max_leverage: getDisplayLeverage(data.max_leverage),
				min_leverage: getDisplayLeverage(data.min_leverage),
				current_price: calculateAtomicPrice(data.current_price || "0"),
				price_24h: calculateAtomicPrice(data.price_24h || "0"),
				chainlink_price: calculateAtomicPrice(
					pair_controller.getPair(data.pair_id).chainlink_price,
				),
				create_at: data.createAt,
			};
		});
		const resultDataPairs = {
			total: totalDocPair,
			data: convertDataPairs,
		};
		return resultDataPairs;
	} catch (error) {
		ErrorHandler(error, args, dex_pairs_get.name).throwErr();
	}
};
