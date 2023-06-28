import { DAO } from "../../../../infra/database/mongo/methods";
import { ErrorHandler } from "../../../../lib/error_handler";
import { ESortBy, getTime } from "./dex_leader_board";

type GQL_IpTopMaster = {
	sortTimeBy: "Daily" | "Weekly" | "Monthly" | "All";
	sortBy: "ASC" | "DESC";
	sortFieldBy:
		| "pnl"
		| "roi"
		| "total_copiers"
		| "total_pnl_copiers"
		| "total_trades"
		| "win_rate"
		| "percent_share";
	page: number;
	pageSize: number;
};

export const dex_top_masters = async (_, args: any) => {
	try {
		const {
			sortTimeBy = "All",
			sortBy = "DESC",
			sortFieldBy = "roi",
			page = 0,
			pageSize = 10,
		} = args as GQL_IpTopMaster;
		const user_address = args.user_address?.toLowerCase() || "";
		const dataTime = getTime(sortTimeBy);
		const { data, total } = await DAO.trades.GetTopMasters({
			from: dataTime.from,
			to: dataTime.to,
			page,
			pageSize,
			sort_by: ESortBy[sortBy],
			type_field: sortFieldBy,
			user_address,
		});
		const convertDataTopMasters = data.map(async (data) => {
			return {
				...data,
				total_pnl_copiers: data.total_pnl_copiers.toString(),
				pnl: data.pnl.toString(),
				roi: data.roi.toString(),
			};
		});
		return {
			total: total,
			data: convertDataTopMasters,
		};
	} catch (e) {
		ErrorHandler(e, args, dex_top_masters.name).throwErr();
	}
};
