import { DAO } from "../../../../../database/mongo/methods";
import { ETriggerAction } from "../../../../../price_observer/PriceObservers";
import { CONTRACT_ERROR, decodeReasonCopyFailed } from "../../../viem.helper";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { ECloseType, getNotificationTypeClosePosition } from "../../position_contract/event";
import { convertCloseFailedRawEvent, TCloseFailedRawEvent } from "../event";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { PushNewNotification } from "../../../../../notification";
import {
	lowerCase,
} from "../../../../../../lib/utils";

const CloseFailedCallback: EventHandlerCallback = async (
	event: TEventData,
	session,
) => {
	const { args, transactionHash } = event;
	const rawEventValue = args as unknown as TCloseFailedRawEvent;
	const eventValue = convertCloseFailedRawEvent(rawEventValue);
	let trigger_reason: ETriggerAction = "None";
	switch (eventValue.closeType) {
		case ECloseType.Liquidation:
			trigger_reason = "TriggerLiquidation";
			break;
		case ECloseType.Market:
			trigger_reason = "TriggerMarket";
			break;
		case ECloseType.SL:
			trigger_reason = "TriggerSL";
			break;
		case ECloseType.TP:
			trigger_reason = "TriggerTP";
			break;
		case ECloseType.MasterCopy:
			trigger_reason = "TriggerCloseCopy";
			break;
		default:
			break;
	}
	switch (eventValue.reason) {
		case CONTRACT_ERROR.LIQUIDATE || CONTRACT_ERROR.CLOSED:
			break;

		default:
			break;
	}
	const trade = await DAO.trades.GetTradeById(eventValue.id, session);
	if (trade) {
		await DAO.trades.MarkTriggerTradeError(
			trade._id,
			eventValue.reason,
			trigger_reason,
			session,
		);
		const notify_type = getNotificationTypeClosePosition(eventValue.closeType);
		if (notify_type) {
			PushNewNotification({
				address: lowerCase(trade.owner),
				type: notify_type,
				payload: {
					txid: transactionHash as string,
					position: {
						orderId: trade.traderId,
						pairId: trade.pairId
					},
					reason: decodeReasonCopyFailed(eventValue.reason),
				},
				status: 'Failed',
			});
		}
	}
};
const CloseFailed = (event: TEventData) =>
	EventHandler(event, CloseFailedCallback);

export { CloseFailed };
