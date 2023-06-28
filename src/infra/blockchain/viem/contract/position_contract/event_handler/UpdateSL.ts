import { ClientSession } from "mongodb";
import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { TUpdateSLRawEvent, convertUpdateSLRawEvent } from "../event";

const UpdateSLCallback: EventHandlerCallback = async (
	event: TEventData,
	session?: ClientSession,
) => {
	const { transactionHash, args } = event;
	const rawEventValue = args as unknown as TUpdateSLRawEvent;
	const eventValue = convertUpdateSLRawEvent(rawEventValue);
	await DAO.trades.UpdateSL(eventValue, transactionHash as string, session);
};
const UpdateSL = (event: TEventData) => EventHandler(event, UpdateSLCallback);

export { UpdateSL };
