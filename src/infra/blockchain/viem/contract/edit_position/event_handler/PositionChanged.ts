import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import {
	convertPositionChangedRawEvent,
	TPositionChangedRawEvent,
} from "../event";

const PositionChangedCallback: EventHandlerCallback = async (
	event,
	session,
) => {
	const { args } = event;
	const rawEventValue = args as unknown as TPositionChangedRawEvent;
	const eventValue = convertPositionChangedRawEvent(rawEventValue);
	await DAO.trades.UnSetCopyPosition(eventValue.id, session);
};

const PositionChanged = (event: TEventData) =>
	EventHandler(event, PositionChangedCallback);

export { PositionChanged };
