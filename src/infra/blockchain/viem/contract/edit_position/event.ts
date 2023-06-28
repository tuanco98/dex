import { AllString } from "../helper";

enum EventsName {
	EditFailed = "EditFailed",
	PositionChanged = "PositionChanged",
}

type TPositionChangedEvent = {
	id: string;
};

type TPositionChangedRawEvent = AllString<TPositionChangedEvent>;

const convertPositionChangedRawEvent = (
	raw_event: TPositionChangedRawEvent,
) => {
	const event: TPositionChangedEvent = {
		...raw_event,
	};
	return event;
};

type TEditFailedEvent = {
	id: string;
	reason: string;
};

type TEditFailedRawEvent = AllString<TEditFailedEvent>;

const convertEditFailedRawEvent = (raw_event: TEditFailedRawEvent) => {
	const event: TEditFailedEvent = {
		...raw_event,
	};
	return event;
};

export {
	EventsName as EditPositionEventName,
	TPositionChangedEvent,
	TPositionChangedRawEvent,
	convertPositionChangedRawEvent,
	TEditFailedEvent,
	TEditFailedRawEvent,
	convertEditFailedRawEvent,
};
