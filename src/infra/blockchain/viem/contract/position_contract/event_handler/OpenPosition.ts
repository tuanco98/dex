import { ClientSession } from "mongodb";
import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { TOpenPositionRawEvent, convertOpenPositionRawEvent } from "../event";

const OpenPositionCallback: EventHandlerCallback = async (
	event: TEventData,
	session?: ClientSession,
) => {
	try {
		const { transactionHash, args } = event;
		const rawEventValue = args as unknown as TOpenPositionRawEvent;
		const eventValue = convertOpenPositionRawEvent(rawEventValue);
		await DAO.trades.OpenTrade(eventValue, transactionHash as string, session);
	} catch (e) {
		throw e;
	}
};

export const OpenPosition = async (event: TEventData) =>
	EventHandler(event, OpenPositionCallback);
