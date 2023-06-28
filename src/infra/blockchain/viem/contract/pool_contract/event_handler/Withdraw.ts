import { MILLISECOND_PER_ONE_SEC } from "../../../../../../lib/constants";
import { DAO } from "../../../../../database/mongo/methods";
import { viemPublicClient } from "../../..";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { TWithdrawRawEvent, convertWithdrawRawEvent } from "../event";
import { PushNewNotification } from "../../../../../notification";
import { lowerCase } from "../../../../../../lib/utils";
import { getOracleFee } from "../../../viem.helper";
import { Hex } from "viem";

const withdrawtFeePaidId = '0x0000000000000000000000000000000000000000000000000000000000000001'
const WithdrawCallback: EventHandlerCallback = async (event, session) => {
	const { transactionHash, args, blockNumber } = event;
	const rawEventValue = args as unknown as TWithdrawRawEvent;
	const eventValue = convertWithdrawRawEvent(rawEventValue);
	const { timestamp } = await viemPublicClient.getBlock({
		blockNumber: blockNumber as bigint,
	});
	const current_date = new Date(Number(timestamp) * MILLISECOND_PER_ONE_SEC);
	// notification
	const oracleFee = await getOracleFee(
		transactionHash as Hex,
		withdrawtFeePaidId,
	);
	PushNewNotification({
		address: lowerCase(eventValue.owner),
		type: "WithdrawPool",
		payload: {
			txid: transactionHash as string,
			oracleFee: oracleFee !== 0n ? oracleFee.toString() : undefined,
			amount: eventValue.amount.toString(),
		},
		status: "Success",
	});
	await DAO.pool_events.addNewPoolEvent(
		eventValue,
		"Withdraw",
		transactionHash as string,
		current_date,
		session,
	);
};

const Withdraw = (event: TEventData) => EventHandler(event, WithdrawCallback);

export { Withdraw };
