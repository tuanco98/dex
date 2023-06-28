import { MILLISECOND_PER_ONE_SEC } from "../../../../../../lib/constants";
import { DAO } from "../../../../../database/mongo/methods";
import { viemPublicClient } from "../../..";
import { TEventData } from "../../../consume/consume.getPastEvent";
import { EventHandler, EventHandlerCallback } from "../../helper";
import { TDepositEvent } from "../event";
import { PushNewNotification } from "../../../../../notification";
import { lowerCase } from "../../../../../../lib/utils";
import { getOracleFee } from "../../../viem.helper";
import { Hex } from "viem";

const depositFeePaidId = '0x0000000000000000000000000000000000000000000000000000000000000000'
const DepositCallback: EventHandlerCallback = async (event, session) => {
	const { transactionHash, args, blockNumber } = event;
	const eventValue = args as unknown as TDepositEvent;
	const { timestamp } = await viemPublicClient.getBlock({
		blockNumber: blockNumber as bigint,
	});
	const current_date = new Date(Number(timestamp) * MILLISECOND_PER_ONE_SEC);
	// notification
	const oracleFee = await getOracleFee(
		transactionHash as Hex,
		depositFeePaidId,
	);
	PushNewNotification({
		address: lowerCase(eventValue.owner),
		type: "DepositPool",
		payload: {
			txid: transactionHash as string,
			oracleFee: oracleFee !== 0n ? oracleFee.toString() : undefined,
			amount: eventValue.amount.toString(),
		},
		status: "Success",
	});
	await DAO.pool_events.addNewPoolEvent(
		eventValue,
		"Deposit",
		transactionHash as string,
		current_date,
		session,
	);
};

const Deposit = (event: TEventData) => EventHandler(event, DepositCallback);

export { Deposit };
