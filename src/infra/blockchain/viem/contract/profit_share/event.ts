import { AllString } from "../helper";

enum EventsName {
	NewShare = "NewShare",
	NewEpochTime = "NewEpochTime",
	MasterWithdraw = "MasterWithdraw",
}

type TNewShareEvent = {
	master: string;
	copier: string;
	epoch: bigint;
	currentProfit: bigint;
	totalMasterShare: bigint;
	change: bigint;
	id: string;
};

type TNewShareRawEvent = AllString<TNewShareEvent>;

const convertNewShareRawEvent = (raw_event: TNewShareRawEvent) => {
	const event: TNewShareEvent = {
		...raw_event,
		epoch: BigInt(raw_event.epoch),
		currentProfit: BigInt(raw_event.currentProfit),
		totalMasterShare: BigInt(raw_event.totalMasterShare),
		change: BigInt(raw_event.change),
	};
	return event;
};

type TNewEpochTimeEvent = {
	newEpochTime: bigint;
	startTime: bigint;
	currentEpoch: bigint;
};

type TNewEpochTimeRawEvent = AllString<TNewEpochTimeEvent>;

const convertNewEpochTimeRawEvent = (raw_event: TNewEpochTimeRawEvent) => {
	const event: TNewEpochTimeEvent = {
		newEpochTime: BigInt(raw_event.newEpochTime),
		startTime: BigInt(raw_event.startTime),
		currentEpoch: BigInt(raw_event.currentEpoch),
	};
	return event;
};
type TMasterWithdrawEvent = {
	master: string;
	total: bigint;
	epoch: number[];
};

type TMasterWithdrawRawEvent = Omit<
	AllString<TMasterWithdrawEvent>,
	"epoch"
> & { epoch: string[] };

const convertMasterWithdrawRawEvent = (raw_event: TMasterWithdrawRawEvent) => {
	const event: TMasterWithdrawEvent = {
		...raw_event,
		total: BigInt(raw_event.total),
		epoch: raw_event.epoch.map(Number),
	};
	return event;
};
export {
	EventsName as ProfitShareEventname,
	TNewShareEvent,
	TNewShareRawEvent,
	convertNewShareRawEvent,
	TNewEpochTimeEvent,
	TNewEpochTimeRawEvent,
	convertNewEpochTimeRawEvent,
	TMasterWithdrawEvent,
	TMasterWithdrawRawEvent,
	convertMasterWithdrawRawEvent,
};
