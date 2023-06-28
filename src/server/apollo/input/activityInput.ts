import { ESortBy } from "../resolvers/queries/dex_leader_board";

type EtimeFilterBy = "D7" | "D30" | "All";
type ETypeTradeFilterBy = "Standard" | "Copy" | "All";
type ETypeActivity = "Current" | "Past" | "All";
type EFieldType = "amount" | "leverage" | "sl" | "tp" | "orderAt" | "entryPrice" | "liquidationPrice" | "openFee" | "updateAt" | "fundingTracker" | "closeFee"
type EArrangeType = ESortBy

type Input = {
	page: number;
	pageSize: number;
	address: string;
	timeFilterBy: EtimeFilterBy;
	typeTradeFilterBy: ETypeTradeFilterBy;
};

type InputUserActivity = Input & {
	typeActivity: ETypeActivity;
	masterFilterAddress: string;
	sortFilterBy: {
		fieldType: EFieldType,
		arrangeType: EArrangeType
	}
};

export {
	Input as InputUserCurrentTrade,
	Input as InputUserPastTrade,
	EtimeFilterBy,
	InputUserActivity,
	ETypeActivity,
};
