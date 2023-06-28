import { AllString } from "../helper";
import { ECloseType } from "../position_contract/event";

enum EventsName {
	CloseFailed = "CloseFailed",
}

type TCloseFailedEvent = {
	id: string;
	price: bigint;
	closeType: ECloseType;
	reason: string;
};

type TCloseFailedRawEvent = AllString<TCloseFailedEvent>;

const convertCloseFailedRawEvent = (raw_event: TCloseFailedRawEvent) => {
	const event: TCloseFailedEvent = {
		...raw_event,
		price: BigInt(raw_event.price),
		closeType: Number(raw_event.closeType),
	};
	return event;
};

export {
	EventsName as ProcessorEventName,
	TCloseFailedEvent,
	TCloseFailedRawEvent,
	convertCloseFailedRawEvent,
};
