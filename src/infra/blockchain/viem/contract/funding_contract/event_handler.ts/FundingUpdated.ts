import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import {
	TFundingUpdatedRawEvent,
	convertFundingUpdatedRawEvent,
} from "../event";

const FundingUpdatedCallback: EventHandlerCallback = async (event, session) => {
	const { transactionHash, args } = event;
	const rawEventValue = args as unknown as TFundingUpdatedRawEvent;
	const eventValue = convertFundingUpdatedRawEvent(rawEventValue);
	await DAO.pairs.updateFundingTracker(eventValue, transactionHash as string, session);
	await DAO.trades.UpdateAllLiquidationPrice(eventValue, session);
};

const FundingUpdated = (event: TEventData) =>
	EventHandler(event, FundingUpdatedCallback);

export { FundingUpdated };
