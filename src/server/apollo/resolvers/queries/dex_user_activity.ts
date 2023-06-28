import { Sort } from "mongodb";
import { DAO } from "../../../../infra/database/mongo/methods";
import { collections } from "../../../../infra/database/mongo/mongo";
import { ErrorHandler } from "../../../../lib/error_handler";
import { request_validator } from "../../../../lib/validate";
import { ETypeActivity, InputUserActivity } from "../../input/activityInput";
import { handleTypeTradeFilter } from "./dex_user_current_trades";
import { handleTimeFilter } from "./dex_user_details";
import { convertTOrderRequiredToOutput } from "./dex_user_orders";

const handleTypeActivity = (
	query: any,
	from: Date,
	to: Date,
	typeActivity: ETypeActivity,
) => {
	const copyQuery = query;
	const objectTime = {
		$gte: from,
		$lte: to,
	};
	switch (typeActivity) {
		case "Current":
			copyQuery.isActive = true;
			copyQuery.orderAt = objectTime;
			break;
		case "Past":
			copyQuery.isActive = false;
			copyQuery.updateAt = objectTime;
			break;
		default:
			copyQuery.$or = [
				{
					isActive: true,
					orderAt: objectTime,
				},
				{
					isActive: false,
					updateAt: objectTime,
				},
			];
			break;
	}

	return copyQuery;
};

const handleSortFilter = (sortFilter: Pick<InputUserActivity, 'sortFilterBy'>) => {
	const { fieldType, arrangeType } = sortFilter.sortFilterBy
	const handelSortField = {};
	handelSortField[fieldType] = arrangeType;
	return handelSortField
}

export const dex_user_activity = async (_, args: any) => {
	try {
		const {
			page = 0,
			pageSize = 10,
			address,
			timeFilterBy = "All",
			typeTradeFilterBy = "All",
			typeActivity = "All",
			masterFilterAddress,
			sortFilterBy
		} = args as InputUserActivity;
		request_validator.ValidateMissing(address);
		const { from, to } = handleTimeFilter(timeFilterBy);
		const queryDataActivity = { owner: address.toLowerCase() };
		const getTypeActivity = handleTypeActivity(
			queryDataActivity,
			from,
			to,
			typeActivity,
		);
		const getTypeTrade = handleTypeTradeFilter(
			getTypeActivity,
			typeTradeFilterBy,
		);
		if (masterFilterAddress) getTypeTrade.masterAddress = masterFilterAddress.toLowerCase();
		let getSortFilter: Sort = { orderAt: -1 }
		if (sortFilterBy) getSortFilter = handleSortFilter({ sortFilterBy })
		const { data, total } = await DAO.trades.getMany(
			getTypeTrade,
			page,
			pageSize,
			false,
			getSortFilter
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
		ErrorHandler(e, args, dex_user_activity.name).throwErr();
	}
};
