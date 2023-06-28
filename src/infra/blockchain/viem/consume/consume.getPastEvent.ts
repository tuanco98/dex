import { DecodeEventLogReturnType, Log } from "viem";
import {
	EDIT_POSITION_CONTRACT_ADDRESS,
	FUNDING_CONTRACT_ADDRESS,
	OPEN_POSITION_CONTRACT_ADDRESS,
	PAIR_CONTRACT_ADDRESS,
	POOL_CONTRACT_ADDRESS,
	POSITION_CONTRACT_ADDRESS,
	PROCESSOR_CONTRACT_ADDRESS,
	PROFIT_SHARE_CONTRACT_ADDRESS,
} from "../../../../config";
import { isLogging } from "../../../../cron/cron.update_latest_block";
import { DAO } from "../../../database/mongo/methods";
import { ContractInfo } from "../contract";
import { EditPositionEventName } from "../contract/edit_position/event";
import { EditPositionEventHandler } from "../contract/edit_position/event_handler";
import { FundingEventName } from "../contract/funding_contract/event";
import { FundingEventHandler } from "../contract/funding_contract/event_handler.ts";
import { OpenPositionEventName } from "../contract/open_position_contract/event";
import { OpenPositionEventHandler } from "../contract/open_position_contract/event_handler";
import { PairEventName } from "../contract/pair_contract/event";
import { PairEventHandler } from "../contract/pair_contract/event_handler";
import { PoolEventName } from "../contract/pool_contract/event";
import { PoolEventHandler } from "../contract/pool_contract/event_handler";
import { PositionEventName } from "../contract/position_contract/event";
import { PositionEventHandler } from "../contract/position_contract/event_handler";
import { GetPastEvents } from "./consume.helper";
import { ProcessorEventName } from "../contract/processor_contract/event";
import { ProcessorEventHandler } from "../contract/processor_contract/event_handler";
import { ProfitShareEventname } from "../contract/profit_share/event";
import { ProfitShareEventHandler } from "../contract/profit_share/event_handler";

enum AllEventName {
	AllEvents = "AllEvents",
}
export type GetPastEventOptionsType = {
	fromBlock: bigint;
	toBlock: bigint;
};
export const AllEvents = {
	...AllEventName,
	...PositionEventName,
	...PoolEventName,
	...FundingEventName,
	...OpenPositionEventName,
	...PairEventName,
	...EditPositionEventName,
	...ProcessorEventName,
	...ProfitShareEventname,
};
export type TAllEvents = keyof typeof AllEvents;
export type TEventData = Log & DecodeEventLogReturnType;
export const getPastEvents = async (
	options: GetPastEventOptionsType,
	contract_info: ContractInfo,
) => {
	try {
		const events = await GetPastEvents(contract_info, options);
		if (isLogging() || events.length) {
			// console.log(`-> consume smart contract ${contract_info.address} info: `, { ...options, ...{ total_event: events.length } })
		}
		for (const data of events) {
			//Check already consume this txid
			const { transactionHash, eventName, blockNumber, address, logIndex } =
				data;
			if (!eventName) continue;
			console.log(`Consumed event = ${eventName} at txid = ${transactionHash}`);
			const event_data = await DAO.contract_events.common.findOne({
				txid: transactionHash as string,
				eventName: eventName,
				blockNumber: Number(blockNumber),
				contractAddress: address.toLowerCase(),
				logIndex: Number(logIndex),
			});
			if (event_data && event_data.result === "SUCCESS") continue;
			switch (eventName) {
				case AllEvents.OpenPosition:
					switch (contract_info.address) {
						case POSITION_CONTRACT_ADDRESS:
							await PositionEventHandler.OpenPosition(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.ClosePosition:
					switch (contract_info.address) {
						case POSITION_CONTRACT_ADDRESS:
							await PositionEventHandler.ClosePosition(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.UpdateSL:
					switch (contract_info.address) {
						case POSITION_CONTRACT_ADDRESS:
							await PositionEventHandler.UpdateSL(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.UpdateTP:
					switch (contract_info.address) {
						case POSITION_CONTRACT_ADDRESS:
							await PositionEventHandler.UpdateTP(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.CopyPosition:
					switch (contract_info.address) {
						case POSITION_CONTRACT_ADDRESS:
							await PositionEventHandler.CopyPosition(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.FundingUpdated:
					switch (contract_info.address) {
						case FUNDING_CONTRACT_ADDRESS:
							await FundingEventHandler.FundingUpdated(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.Deposit:
					switch (contract_info.address) {
						case POOL_CONTRACT_ADDRESS:
							await PoolEventHandler.Deposit(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.Withdraw:
					switch (contract_info.address) {
						case POOL_CONTRACT_ADDRESS:
							await PoolEventHandler.Withdraw(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.FeePaid:
					switch (contract_info.address) {
						case POOL_CONTRACT_ADDRESS:
							await PoolEventHandler.FeePaid(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.CopyFailed:
					switch (contract_info.address) {
						case OPEN_POSITION_CONTRACT_ADDRESS:
							await OpenPositionEventHandler.CopyFailed(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.CancelSignature:
					switch (contract_info.address) {
						case OPEN_POSITION_CONTRACT_ADDRESS:
							await OpenPositionEventHandler.CancelSignature(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.PairUpdated:
					switch (contract_info.address) {
						case PAIR_CONTRACT_ADDRESS:
							await PairEventHandler.PairUpdated(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.MasterShare:
					switch (contract_info.address) {
						case POSITION_CONTRACT_ADDRESS:
							await PositionEventHandler.MasterShare(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.PermitFailed:
					switch (contract_info.address) {
						case OPEN_POSITION_CONTRACT_ADDRESS:
							await OpenPositionEventHandler.PermitFailed(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.PositionChanged:
					switch (contract_info.address) {
						case EDIT_POSITION_CONTRACT_ADDRESS:
							await EditPositionEventHandler.PositionChanged(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.EditFailed:
					switch (contract_info.address) {
						case EDIT_POSITION_CONTRACT_ADDRESS:
							await EditPositionEventHandler.EditFailed(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.CloseFailed:
					switch (contract_info.address) {
						case PROCESSOR_CONTRACT_ADDRESS:
							await ProcessorEventHandler.CloseFailed(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.NewEpochTime:
					switch (contract_info.address) {
						case PROFIT_SHARE_CONTRACT_ADDRESS:
							await ProfitShareEventHandler.NewEpochTime(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.NewShare:
					switch (contract_info.address) {
						case PROFIT_SHARE_CONTRACT_ADDRESS:
							await ProfitShareEventHandler.NewShare(data);
							break;
						default:
							break;
					}
					break;
				case AllEvents.MasterWithdraw:
					switch (contract_info.address) {
						case PROFIT_SHARE_CONTRACT_ADDRESS:
							await ProfitShareEventHandler.MasterWithdraw(data);
							break;
						default:
							break;
					}
					break;
				default:
					break;
			}
		}
	} catch (e) {
		throw e;
	}
};
