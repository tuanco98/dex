import { AllString } from "../helper";

enum EventsName {
	FundingUpdated = "FundingUpdated",
}

type TFundingUpdatedEvent = {
	pairId: number;
	fundingTracker: number;
	fundingIncrement: number;
};

type TFundingUpdatedRawEvent = AllString<TFundingUpdatedEvent>;

const convertFundingUpdatedRawEvent = (raw_event: TFundingUpdatedRawEvent) => {
	const event: TFundingUpdatedEvent = {
		pairId: Number(raw_event.pairId),
		fundingTracker: Number(raw_event.fundingTracker),
		fundingIncrement: Number(raw_event.fundingIncrement),
	};
	return event;
};

export {
	EventsName as FundingEventName,
	TFundingUpdatedEvent,
	TFundingUpdatedRawEvent,
	convertFundingUpdatedRawEvent,
};
