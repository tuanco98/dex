import { ClientSession } from "mongodb";
import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { TUpdateTPRawEvent, convertUpdateTPRawEvent } from "../event";

const UpdateTPCallback: EventHandlerCallback = async (
	event: TEventData,
	session?: ClientSession,
) => {
	const { transactionHash, args } = event;
	const rawEventValue = args as unknown as TUpdateTPRawEvent;
	const eventValue = convertUpdateTPRawEvent(rawEventValue);
	await DAO.trades.UpdateTP(eventValue, transactionHash as string, session);
};
const UpdateTP = (event: TEventData) => EventHandler(event, UpdateTPCallback);

export { UpdateTP };
