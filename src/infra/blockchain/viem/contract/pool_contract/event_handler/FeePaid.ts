import { viemPublicClient } from "../../..";
import { MILLISECOND_PER_ONE_SEC } from "../../../../../../lib/constants";
import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import {
	TFeePaidRawEvent,
	convertTFeePaidRawEvent
} from "../event";

const FeePaidCallback: EventHandlerCallback = async (event, session) => {
	const { transactionHash, args, blockNumber } = event;
	const rawEventValue = args as unknown as TFeePaidRawEvent;
	const eventValue = convertTFeePaidRawEvent(rawEventValue);
	const { timestamp } = await viemPublicClient.getBlock({
		blockNumber: blockNumber as bigint,
	});
	const current_date = new Date(Number(timestamp) * MILLISECOND_PER_ONE_SEC);
	await DAO.fee_paid_events.addNewEvent(
		eventValue,
		current_date,
		transactionHash as string,
		session,
	);
};

const FeePaid = (event: TEventData) => EventHandler(event, FeePaidCallback);

export { FeePaid };
