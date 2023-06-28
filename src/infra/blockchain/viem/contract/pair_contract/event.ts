import { AllString, GetBoolean } from "../helper";

type TPairUpdatedEvent = {
	pairId: number;
	chainlinkFeed: string;
	isClosed: boolean;
	allowSelfExecution: boolean;
	maxLeverage: number;
	minLeverage: number;
	openFee: bigint;
	closeFee: bigint;
	spread: bigint;
	minAge: number;
	maxDeviation: bigint;
	liqThreshold: bigint;
};

type TPairUpdatedRawEvent = AllString<TPairUpdatedEvent>;

const convertPairUpdatedRawEvent = (raw_event: TPairUpdatedRawEvent) => {
	const event: TPairUpdatedEvent = {
		...raw_event,
		isClosed: GetBoolean(raw_event.isClosed),
		allowSelfExecution: GetBoolean(raw_event.allowSelfExecution),
		pairId: Number(raw_event.pairId),
		maxLeverage: Number(raw_event.maxLeverage),
		minLeverage: Number(raw_event.minLeverage),
		openFee: BigInt(raw_event.openFee),
		closeFee: BigInt(raw_event.closeFee),
		spread: BigInt(raw_event.spread),
		minAge: Number(raw_event.minAge),
		maxDeviation: BigInt(raw_event.maxDeviation),
		liqThreshold: BigInt(raw_event.liqThreshold),
	};
	return event;
};
enum EventsName {
	PairUpdated = "PairUpdated",
}

export {
	EventsName as PairEventName,
	TPairUpdatedEvent,
	TPairUpdatedRawEvent,
	convertPairUpdatedRawEvent,
};
