import { DAO } from "../../../../infra/database/mongo/methods";
import { ErrMsg, ErrorHandler } from "../../../../lib/error_handler";
import { convertDateDayOrMonth, typeOfDate } from "../../../../lib/utils";

enum ESortBy {
	ASC = 1,
	DESC = -1,
}

const getTime = (sortTimeBy: "Daily" | "Weekly" | "Monthly" | "All") => {
	const now = new Date();
	const dataTime: { from?: Date; to: Date } = {
		to: now,
	};
	switch (sortTimeBy) {
		case "Daily": {
			const getFromDailyDate = convertDateDayOrMonth(
				now,
				typeOfDate.startOfDay,
			);
			dataTime.from = new Date(getFromDailyDate);
			break;
		}
		case "Weekly": {
			const indexOfWeek = dataTime.to.getUTCDay();
			const getStartOfWeek =
				dataTime.to.getUTCDate() - indexOfWeek + (indexOfWeek === 0 ? -6 : 1);
			const getFromWeekly = new Date().setUTCDate(getStartOfWeek);
			dataTime.from = new Date(
				convertDateDayOrMonth(getFromWeekly, typeOfDate.startOfDay),
			);
			break;
		}
		case "Monthly": {
			const getFromMonthlyDate = convertDateDayOrMonth(
				now,
				typeOfDate.firstOfMonth,
			);
			dataTime.from = new Date(getFromMonthlyDate);
			break;
		}
		default:
			dataTime.from = new Date(0);
			break;
	}
	return dataTime as { from: Date; to: Date };
};

type GQL_IpLeaderBoard = {
	sortTimeBy: "Daily" | "Weekly" | "Monthly" | "All";
	sortBy: "ASC" | "DESC";
	sortFieldBy: "pnl" | "win" | "loss" | "volume" | "avg_leverage";
};

const dex_leader_board = async (_, args: any) => {
	try {
		const {
			sortTimeBy = "All",
			sortBy = "DESC",
			sortFieldBy = "pnl",
		} = args as GQL_IpLeaderBoard;
		const dataTime = getTime(sortTimeBy);
		const dataLeaderBoard = await DAO.trades.GetLeaderBoard(
			dataTime.from,
			dataTime.to,
			sortFieldBy,
			ESortBy[sortBy],
		);
		if (dataLeaderBoard.length === 0) return ErrMsg("DATA_EMPTY");
		const resultLeaderBoard = dataLeaderBoard.map((data) => {
			return {
				...data,
				volume: data.volume.toString(),
				pnl: data.pnl.toString(),
			};
		});
		return resultLeaderBoard;
	} catch (e) {
		ErrorHandler(e, args, dex_leader_board.name).throwErr();
	}
};

export { dex_leader_board, getTime, ESortBy };
