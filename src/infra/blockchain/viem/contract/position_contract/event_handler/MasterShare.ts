import { ClientSession } from "mongodb";
import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { TMasterShareRawEvent, convertMasterShareRawEvent } from "../event";

const MasterShareCallback: EventHandlerCallback = async (
	event: TEventData,
	session?: ClientSession,
) => {
	const { args } = event;
	const rawEventValue = args as unknown as TMasterShareRawEvent;
	const eventValue = convertMasterShareRawEvent(rawEventValue);
	
};
const MasterShare = (event: TEventData) =>
	EventHandler(event, MasterShareCallback);

export { MasterShare };
