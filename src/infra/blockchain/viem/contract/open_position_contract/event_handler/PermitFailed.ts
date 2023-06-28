import { ClientSession } from "mongodb";
import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { TPermitFailedRawEvent, convertPermitFailedRawEvent } from "../event";

const PermitFailedCallback: EventHandlerCallback = async (
	event: TEventData,
	session?: ClientSession,
) => {
	const { args } = event;
	const rawEventValue = args as unknown as TPermitFailedRawEvent;
	const eventValue = convertPermitFailedRawEvent(rawEventValue);
	await DAO.users.UnsetPermit(eventValue.owner, session);
};
const PermitFailed = (event: TEventData) =>
	EventHandler(event, PermitFailedCallback);

export { PermitFailed };
