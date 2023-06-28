import { ClientSession } from "mongodb";
import { copy_trigger } from "../../../../..";
import { DAO } from "../../../../../database/mongo/methods";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import {
	ECloseType,
	TClosePositionRawEvent,
	convertClosePositionRawEvent,
} from "../event";

const ClosePositionCallback: EventHandlerCallback = async (
	event: TEventData,
	session?: ClientSession,
) => {
	const { transactionHash, args } = event;
	const rawEventValue = args as unknown as TClosePositionRawEvent;
	const eventValue = convertClosePositionRawEvent(rawEventValue);
	await DAO.trades.CloseTrade(eventValue, transactionHash as string, session);
	if (
		copy_trigger &&
		[ECloseType.Market, ECloseType.SL, ECloseType.TP].includes(
			eventValue.closeType,
		)
	) {
		switch (eventValue.closeType) {
			case ECloseType.Market:
				copy_trigger.ExecuteCloseCopy(eventValue.id);
				break;
			case ECloseType.SL:
				copy_trigger.ExecuteCloseCopy(eventValue.id, {
					without_sl: true,
					without_tp: false,
				});
				break;
			case ECloseType.TP:
				copy_trigger.ExecuteCloseCopy(eventValue.id, {
					without_sl: false,
					without_tp: true,
				});
				break;

			default:
				break;
		}
	}
};
const ClosePosition = (event: TEventData) =>
	EventHandler(event, ClosePositionCallback);

export { ClosePosition };
