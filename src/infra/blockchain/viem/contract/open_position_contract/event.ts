import { AllString } from "../helper";

enum EventsName {
	CopyFailed = "CopyFailed",
	CancelSignature = "CancelSignature",
	PermitFailed = "PermitFailed",
}

type TCopyFailedEvent = {
	id: string;
	copier: string;
	reason: string;
};

type TCopyFailedRawEvent = AllString<TCopyFailedEvent>;

const convertCopyFailedRawEvent = (raw_event: TCopyFailedRawEvent) => {
	const event: TCopyFailedEvent = {
		id: raw_event.id,
		copier: raw_event.copier,
		reason: raw_event.reason,
	};
	return event;
};

type TCancelSignatureEvent = {
	signature: string;
	owner: string;
};

type TCancelSignatureRawEvent = AllString<TCancelSignatureEvent>;

const convertCancelSignatureRawEvent = (
	raw_event: TCancelSignatureRawEvent,
) => {
	const event: TCancelSignatureEvent = {
		...raw_event,
	};
	return event;
};
type TPermitFailedEvent = {
	owner: string;
	reason: string;
};

type TPermitFailedRawEvent = AllString<TPermitFailedEvent>;

const convertPermitFailedRawEvent = (raw_event: TPermitFailedRawEvent) => {
	const event: TPermitFailedEvent = {
		...raw_event,
	};
	return event;
};

export {
	TCopyFailedEvent,
	TCopyFailedRawEvent,
	convertCopyFailedRawEvent,
	TCancelSignatureEvent,
	TCancelSignatureRawEvent,
	convertCancelSignatureRawEvent,
	TPermitFailedEvent,
	TPermitFailedRawEvent,
	convertPermitFailedRawEvent,
	EventsName as OpenPositionEventName,
};
