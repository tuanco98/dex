import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { convertNewShareRawEvent, TNewShareRawEvent } from "../event";

const NewShareCallback: EventHandlerCallback = async (event, session) => {
	const { args } = event;
	const rawEventValue = args as unknown as TNewShareRawEvent;
	const eventValue = convertNewShareRawEvent(rawEventValue);
	await DAO.trades.UpdateMasterShare(eventValue, session);
	await DAO.master_share_epoches.UpdateMasterShareEpoch(eventValue, session);

};

const NewShare = (event: TEventData) => EventHandler(event, NewShareCallback);

export { NewShare };
