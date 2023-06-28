import { AllString, GetBoolean } from "../helper";

enum EventsName {
	OpenPosition = "OpenPosition",
	ClosePosition = "ClosePosition",
	UpdateTP = "UpdateTP",
	UpdateSL = "UpdateSL",
	CopyPosition = "CopyPosition",
	MasterShare = "MasterShare",
}
const getNotificationTypeClosePosition = (closeType: ECloseType) => {
	switch (closeType) {
		case ECloseType.Liquidation:
			return "Liquidation";
		case ECloseType.Market:
			return "ClosePosition";
		case ECloseType.SL:
			return "StopLoss";
		case ECloseType.TP:
			return "TakeProfit";
		case ECloseType.MasterCopy:
			return "CloseCopy";
		default:
			break;
	}
}
type TOpenPositionEvent = {
	id: string;
	owner: string;
	isLong: boolean;
	pairId: number;
	leverage: bigint;
	timestamp: number;
	entryPrice: bigint;
	amount: bigint;
	fundingTracker: bigint;
	masterId: string;
};

type TOpenPositionRawEvent = AllString<TOpenPositionEvent>;

const convertOpenPositionRawEvent = (raw_event: TOpenPositionRawEvent) => {
	const event: TOpenPositionEvent = {
		...raw_event,
		isLong: GetBoolean(raw_event.isLong),
		pairId: Number(raw_event.pairId),
		leverage: BigInt(raw_event.leverage),
		timestamp: Number(raw_event.timestamp),
		entryPrice: BigInt(raw_event.entryPrice),
		amount: BigInt(raw_event.amount),
		fundingTracker: BigInt(raw_event.fundingTracker),
	};
	return event;
};

enum ECloseType {
	Liquidation = 0,
	Market = 1,
	TP = 2,
	SL = 3,
	MasterCopy = 4,
	DecreasePosition = 5,
}

type TClosePositionEvent = {
	id: string;
	pnl: bigint;
	closePrice: bigint;
	closeType: ECloseType; //closeType
	//0: liquidation
	//1: market
	//2: tp
	//3: sl
};

type TClosePositionRawEvent = AllString<TClosePositionEvent>;

const convertClosePositionRawEvent = (raw_event: TClosePositionRawEvent) => {
	const event: TClosePositionEvent = {
		...raw_event,
		pnl: BigInt(raw_event.pnl),
		closePrice: BigInt(raw_event.closePrice),
		closeType: Number(raw_event.closeType),
	};
	return event;
};

type TUpdateTPEvent = {
	id: string;
	tp: bigint;
};

type TUpdateTPRawEvent = AllString<TUpdateTPEvent>;

const convertUpdateTPRawEvent = (raw_event: TUpdateTPRawEvent) => {
	const event: TUpdateTPEvent = {
		...raw_event,
		tp: BigInt(raw_event.tp),
	};
	return event;
};

type TUpdateSLEvent = {
	id: string;
	sl: bigint;
};

type TUpdateSLRawEvent = AllString<TUpdateSLEvent>;

const convertUpdateSLRawEvent = (raw_event: TUpdateSLRawEvent) => {
	const event: TUpdateSLEvent = {
		...raw_event,
		sl: BigInt(raw_event.sl),
	};
	return event;
};

type TCopyPositionEvent = {
	id: string;
	cid: string;
};

type TCopyPositionRawEvent = AllString<TCopyPositionEvent>;

const convertCopyPositionRawEvent = (raw_event: TCopyPositionRawEvent) => {
	const event: TCopyPositionEvent = {
		...raw_event,
	};
	return event;
};

type TMasterShareEvent = {
	id: string;
	master: string;
	amount: bigint;
};

type TMasterShareRawEvent = AllString<TMasterShareEvent>;

const convertMasterShareRawEvent = (raw_event: TMasterShareRawEvent) => {
	const event: TMasterShareEvent = {
		...raw_event,
		amount: BigInt(raw_event.amount),
	};
	return event;
};

export {
	EventsName as PositionEventName,
	TOpenPositionRawEvent,
	TOpenPositionEvent,
	convertOpenPositionRawEvent,
	TClosePositionRawEvent,
	TClosePositionEvent,
	convertClosePositionRawEvent,
	TUpdateTPRawEvent,
	TUpdateTPEvent,
	convertUpdateTPRawEvent,
	TUpdateSLRawEvent,
	TUpdateSLEvent,
	convertUpdateSLRawEvent,
	ECloseType,
	TCopyPositionEvent,
	TCopyPositionRawEvent,
	convertCopyPositionRawEvent,
	TMasterShareEvent,
	TMasterShareRawEvent,
	convertMasterShareRawEvent,
	getNotificationTypeClosePosition
};
