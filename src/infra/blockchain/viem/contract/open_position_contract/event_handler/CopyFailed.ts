import { lowerCase } from "../../../../../../lib/utils";
import { DAO } from "../../../../../database/mongo/methods";
import { PushNewNotification } from "../../../../../notification";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { decodeReasonCopyFailed } from "../../../viem.helper";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { TCopyFailedEvent, convertCopyFailedRawEvent } from "../event";

const CopyFailedCallback: EventHandlerCallback = async (event: TEventData) => {
	const { transactionHash, args } = event;
	const rawEventValue = args as unknown as TCopyFailedEvent;
	const eventValue = convertCopyFailedRawEvent(rawEventValue);
	const trade = await DAO.trades.GetTradeById(eventValue.id);
	if (trade) {
		PushNewNotification({
			address: lowerCase(eventValue.copier),
			type: "Copy",
			payload: {
				txid: transactionHash as string,
				position: {
					orderId: trade.traderId,
					pairId: trade.pairId
				},
				reason: decodeReasonCopyFailed(eventValue.reason),
			},
			status: "Failed",
		});
	}
};
const CopyFailed = (event: TEventData) =>
	EventHandler(event, CopyFailedCallback);

export { CopyFailed };
