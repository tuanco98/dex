import { lowerCase } from "../../../../../../lib/utils";
import { DAO } from "../../../../../database/mongo/methods";
import { PushNewNotification } from "../../../../../notification";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { decodeReasonCopyFailed } from "../../../viem.helper";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { TEditFailedRawEvent, convertEditFailedRawEvent } from "../event";

const EditFailedCallback: EventHandlerCallback = async (event) => {
	const { transactionHash, args } = event;
	const rawEventValue = args as unknown as TEditFailedRawEvent;
	const eventValue = convertEditFailedRawEvent(rawEventValue);
	const trade = await DAO.trades.GetTradeById(eventValue.id);
	if (trade) {
		PushNewNotification({
			address: lowerCase(trade.owner),
			type: 'EditCopy',
			payload: {
				...eventValue,
				txid: transactionHash as string,
				reason: decodeReasonCopyFailed(eventValue.reason),
			},
			status: "Failed",
		});
	}
};

const EditFailed = (event: TEventData) =>
	EventHandler(event, EditFailedCallback);

export { EditFailed };
