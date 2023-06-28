import { ClientSession } from "mongodb";
import { lowerCase } from "../../../../../../lib/utils";
import { DAO } from "../../../../../database/mongo/methods";
import { ENotificationType } from "../../../../../database/mongo/models/Notification";
import { PushNewNotification } from "../../../../../notification";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import {
	TCancelSignatureRawEvent,
	convertCancelSignatureRawEvent,
} from "../event";

const CancelSignatureCallback: EventHandlerCallback = async (
	event: TEventData,
	session?: ClientSession,
) => {
	const { transactionHash, args } = event;
	const rawEventValue = args as unknown as TCancelSignatureRawEvent;
	const eventValue = convertCancelSignatureRawEvent(rawEventValue);
	let type_notification: ENotificationType | null = "CancelLimitOrder";
	let masterId: string | undefined = undefined;
	const cancel_limit_order = await DAO.orders.InactiveOrderBySignature(
		eventValue.owner,
		eventValue.signature,
		transactionHash as string,
		session,
	);
	if (!cancel_limit_order) {
		const cancel_copy_master = await DAO.copy_proofs.deleteProofBySignature(
			eventValue.owner,
			eventValue.signature,
			session,
		);
		type_notification = cancel_copy_master ? "CancelCopyMaster" : null;
		masterId = cancel_copy_master?.master
	}
	if (type_notification) {
		PushNewNotification({
			address: lowerCase(eventValue.owner),
			type: type_notification,
			payload: {
				...eventValue,
				txid: transactionHash as string,
				signature: eventValue.signature,
				position: masterId ? { masterId } : undefined
			},
			status: "Success",
		});
	}
};
const CancelSignature = (event: TEventData) =>
	EventHandler(event, CancelSignatureCallback);

export { CancelSignature };
