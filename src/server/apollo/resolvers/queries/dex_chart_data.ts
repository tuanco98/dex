import { chart_storage_controller } from "../../../../infra";
import { collections } from "../../../../infra/database/mongo/mongo";
import { ErrorHandler } from "../../../../lib/error_handler";
import { timeSystem } from "../../../../lib/time_sys";
import { convertDateDayOrMonth, typeOfDate } from "../../../../lib/utils";
import { convertPriceToAtomic } from "../../helper";

/**
 * dex_get_signature
 * @param parent
 * @param {ChartTradingInput} args
 * @param ctx
 * @return {ChartTradingOutput}
 */

export type DataPrice = {
	open: number;
	close: number;
	highest: number;
	lowest: number;
	timestamp: Date;
	chainlink_price: number;
};

export const dex_chart_data = async (_, args: any) => {
	const date_now = new Date();
	try {
		const {
			pair_id,
			from = timeSystem.getDateInFuture(date_now, { days: -7 }),
			to = date_now,
			time_range = 1,
		} = args as {
			pair_id: number;
			from: number;
			to: number;
			time_range: number;
		};
		const convertDateOfFrom: number = convertDateDayOrMonth(
			from,
			typeOfDate.startOfDay,
		);
		const convertDateOfTo: number = convertDateDayOrMonth(
			to,
			typeOfDate.endOfDay,
		);
		const is_use_cache = true;
		if (is_use_cache) {
			const cache_chart = chart_storage_controller.getStorage(
				pair_id,
				time_range,
			);
			const missing_time_range = cache_chart.getMissingDataTime(
				new Date(convertDateOfFrom),
				new Date(convertDateOfTo),
			);
			if (!missing_time_range) {
				const data = cache_chart.getData(
					new Date(convertDateOfFrom),
					new Date(convertDateOfTo),
				);
				return {
					totalItem: data.length,
					prices: data,
				};
			} else {
				const convertQueryDateOfFrom: number = convertDateDayOrMonth(
					missing_time_range.from,
					typeOfDate.startOfDay,
				);
				const convertQueryDateOfTo: number = convertDateDayOrMonth(
					missing_time_range.to,
					typeOfDate.endOfDay,
				);
				const queryAggregateChart = [
					{
						$match: {
							pair_id: pair_id,
							timestamp: {
								$gte: new Date(convertQueryDateOfFrom),
								$lte: new Date(convertQueryDateOfTo),
							},
						},
					},
					{
						$group: {
							_id: {
								$dateTrunc: {
									date: "$timestamp",
									unit: "minute",
									binSize: time_range,
								},
							},
							open: {
								$first: "$price",
							},
							close: {
								$last: "$price",
							},
							highest: {
								$max: "$price",
							},
							lowest: {
								$min: "$price",
							},
							chainlink_price: {
								$last: "$chainlink_price",
							},
						},
					},
					{
						$sort: {
							_id: 1,
						},
					},
					{
						$project: {
							_id: 0,
							open: 1,
							close: 1,
							highest: 1,
							lowest: 1,
							chainlink_price: 1,
							timestamp: "$_id",
						},
					},
				];
				const dataPrices = (await collections.pairs_price
					.aggregate(queryAggregateChart)
					.toArray()) as DataPrice[];
				const dataPriceAtomic = dataPrices.map(convertPriceToAtomic);
				cache_chart.addData(dataPriceAtomic);
				cache_chart.setFrom(new Date(convertQueryDateOfFrom));
				const cacheData = cache_chart.getData(
					new Date(convertDateOfFrom),
					new Date(convertDateOfTo),
				);
				if (!dataPriceAtomic.length)
					return {
						totalItem: cacheData.length,
						prices: cacheData,
					};
				const mergeDataPriceAtomic = [...cacheData, dataPriceAtomic.pop()];
				const resultDataChart = {
					totalItem: mergeDataPriceAtomic.length,
					prices: mergeDataPriceAtomic,
				};
				return resultDataChart;
			}
		} else {
			const convertQueryDateOfFrom: number = convertDateDayOrMonth(
				from,
				typeOfDate.startOfDay,
			);
			const convertQueryDateOfTo: number = convertDateDayOrMonth(
				to,
				typeOfDate.endOfDay,
			);
			const queryAggregateChart = [
				{
					$match: {
						pair_id: pair_id,
						timestamp: {
							$gte: new Date(convertQueryDateOfFrom),
							$lte: new Date(convertQueryDateOfTo),
						},
					},
				},
				{
					$group: {
						_id: {
							$dateTrunc: {
								date: "$timestamp",
								unit: "minute",
								binSize: time_range,
							},
						},
						open: {
							$first: "$price",
						},
						close: {
							$last: "$price",
						},
						highest: {
							$max: "$price",
						},
						lowest: {
							$min: "$price",
						},
						chainlink_price: {
							$last: "$chainlink_price",
						},
					},
				},
				{
					$sort: {
						_id: 1,
					},
				},
				{
					$project: {
						_id: 0,
						open: 1,
						close: 1,
						highest: 1,
						lowest: 1,
						chainlink_price: 1,
						timestamp: "$_id",
					},
				},
			];
			const dataPrices = (await collections.pairs_price
				.aggregate(queryAggregateChart)
				.toArray()) as DataPrice[];
			const dataPriceAtomic = dataPrices.map(convertPriceToAtomic);
			const resultDataChart = {
				totalItem: dataPriceAtomic.length,
				prices: dataPriceAtomic,
			};
			return resultDataChart;
		}
	} catch (e) {
		ErrorHandler(e, { args }, dex_chart_data.name).throwErr();
	}
};
