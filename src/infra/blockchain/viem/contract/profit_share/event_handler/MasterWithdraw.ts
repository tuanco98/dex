import { lowerCase } from "../../../../../../lib/utils";
import { DAO } from "../../../../../database/mongo/methods";
import { PushNewNotification } from "../../../../../notification";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import {
	convertMasterWithdrawRawEvent,
	TMasterWithdrawRawEvent,
} from "../event";

const MasterWithdrawCallback: EventHandlerCallback = async (event) => {
	const { args, transactionHash } = event;
	const rawEventValue = args as unknown as TMasterWithdrawRawEvent;
	const eventValue = convertMasterWithdrawRawEvent(rawEventValue);
	// notification
	PushNewNotification({
		address: lowerCase(eventValue.master),
		type: 'WithdrawEpoch',
		payload: {
			txid: transactionHash as string,
			amount: eventValue.total.toString(),
		},
		status: "Success",
	});
	DAO.master_share_epoches.UpdateWithdraw(eventValue, transactionHash);
};

const MasterWithdraw = (event: TEventData) =>
	EventHandler(event, MasterWithdrawCallback);

export { MasterWithdraw };
