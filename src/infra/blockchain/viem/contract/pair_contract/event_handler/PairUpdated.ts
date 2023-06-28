import { ClientSession } from "mongodb";
import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { TPairUpdatedRawEvent, convertPairUpdatedRawEvent } from "../event";

const PairUpdatedCallback: EventHandlerCallback = async (
	event: TEventData,
	session?: ClientSession,
) => {
	const { args } = event;
	const rawEventValue = args as unknown as TPairUpdatedRawEvent;
	const eventValue = convertPairUpdatedRawEvent(rawEventValue);
	await DAO.pairs.updatePairByEvent(eventValue, session);
};
const PairUpdated = (event: TEventData) =>
	EventHandler(event, PairUpdatedCallback);

export { PairUpdated };
