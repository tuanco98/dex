import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { convertNewEpochTimeRawEvent, TNewEpochTimeRawEvent } from "../event";

const NewEpochTimeCallback: EventHandlerCallback = async (event, session) => {
	const { args, transactionHash } = event;
	const rawEventValue = args as unknown as TNewEpochTimeRawEvent;
	const eventValue = convertNewEpochTimeRawEvent(rawEventValue);
	await DAO.current_epoch.common.updateOne(
		{},
		{
			$setOnInsert: {
				createAt: new Date(),
			},
			$set: {
				epochTime: Number(eventValue.newEpochTime),
				startEpoch: Number(eventValue.currentEpoch),
				startTime: Number(eventValue.startTime),
				updateTxid: transactionHash as `0x${string}`,
				updateAt: new Date(),
			},
		},
		{ upsert: true },
	);
};

const NewEpochTime = (event: TEventData) =>
	EventHandler(event, NewEpochTimeCallback);

export { NewEpochTime };
