import { ClientSession } from "mongodb";
import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { TCopyPositionRawEvent, convertCopyPositionRawEvent } from "../event";

const CopyPositionCallback: EventHandlerCallback = async (
	event: TEventData,
	session?: ClientSession,
) => {
	const { args } = event;
	const rawEventValue = args as unknown as TCopyPositionRawEvent;
	const eventValue = convertCopyPositionRawEvent(rawEventValue);
	await DAO.trades.SetCopyPosition(eventValue, session);
};

const CopyPosition = (event: TEventData) =>
	EventHandler(event, CopyPositionCallback);

export { CopyPosition };
