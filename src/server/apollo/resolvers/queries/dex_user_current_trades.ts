import { DAO } from "../../../../infra/database/mongo/methods";
import { convertTOrderRequiredToOutput } from "./dex_user_orders";
import { handleTimeFilter } from "./dex_user_details";
import { InputUserCurrentTrade } from "../../input/activityInput";

export const handleTypeTradeFilter = (
	query: any,
	typeTradeFilterBy: "Standard" | "Copy" | "All",
) => {
	const resultDataQuery = query;
	switch (typeTradeFilterBy) {
		case "Standard":
			resultDataQuery.isCopy = {
				$exists: false,
			};
			break;
		case "Copy":
			resultDataQuery.isCopy = true;
			break;
		default:
			resultDataQuery;
			break;
	}
	return resultDataQuery;
};

export const dex_user_current_trades = async (_, args: any) => {
	try {
		const {
			page = 0,
			pageSize = 10,
			address,
			timeFilterBy = "All",
			typeTradeFilterBy = "All",
		} = args as InputUserCurrentTrade;
		const getTime = handleTimeFilter(timeFilterBy);
		const queryDataCurrentTrade = handleTypeTradeFilter(
			{
				owner: address.toLowerCase(),
				isActive: true,
				orderAt: {
					$gte: getTime.from,
					$lte: getTime.to,
				},
			},
			typeTradeFilterBy,
		);
		const { data, total } = await DAO.trades.getMany(
			queryDataCurrentTrade,
			page,
			pageSize,
			false,
			{ orderAt: -1 },
		);
		const resultDataCurrentTrade = {
			total,
			data: data.map(convertTOrderRequiredToOutput),
		};
		return resultDataCurrentTrade;
	} catch (e) {
		throw e;
	}
};
