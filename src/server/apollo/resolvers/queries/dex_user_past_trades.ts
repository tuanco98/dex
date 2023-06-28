import { DAO } from "../../../../infra/database/mongo/methods";
import { convertTOrderRequiredToOutput } from "./dex_user_orders";
import { handleTimeFilter } from "./dex_user_details";
import { request_validator } from "../../../../lib/validate";
import { collections } from "../../../../infra/database/mongo/mongo";
import { handleTypeTradeFilter } from "./dex_user_current_trades";
import { InputUserPastTrade } from "../../input/activityInput";

export const dex_user_past_trades = async (_, args: any) => {
	try {
		const {
			page = 0,
			pageSize = 10,
			address,
			timeFilterBy = "All",
			typeTradeFilterBy = "All",
		} = args as InputUserPastTrade;
		request_validator.ValidateMissing(address);
		const getTime = handleTimeFilter(timeFilterBy);
		const queryDataPastTrade = handleTypeTradeFilter(
			{
				owner: address.toLowerCase(),
				isActive: false,
				updateAt: {
					$gte: getTime.from,
					$lte: getTime.to,
				},
			},
			typeTradeFilterBy,
		);
		const { data, total } = await DAO.trades.getMany(
			queryDataPastTrade,
			page,
			pageSize,
			false,
			{ updateAt: -1 },
		);
		const convertDataOrder = data.map(convertTOrderRequiredToOutput);
		const addNewField = convertDataOrder.map(async (data) => {
			const total_copier = await collections.trades.countDocuments({
				linkTrade: data.id,
				isCopy: true,
			});
			return {
				...data,
				copier: total_copier,
			};
		});
		const resultDataPastTrade = {
			total,
			data: addNewField,
		};
		return resultDataPastTrade;
	} catch (e) {
		throw e;
	}
};
