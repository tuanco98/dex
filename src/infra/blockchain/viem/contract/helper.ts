import { ClientSession } from "mongodb";
import { GetJSONStringify } from "../../../../lib/utils";
import { DAO } from "../../../database/mongo/methods";
import { mongo } from "../../../database/mongo/mongo";
import { TEventData } from "../consume/consume.getPastEvent";
type EventHandlerCallback = (
	event: TEventData,
	session?: ClientSession,
) => Promise<any>;
type EventErrorCallback = (event: TEventData, error: Error) => Promise<any>;

const EventHandler = async (
	event: TEventData,
	callback: EventHandlerCallback,
	err_callback?: EventErrorCallback,
) => {
	const session = mongo.startSession();
	const { transactionHash, blockNumber, address, logIndex } = event;
	try {
		await session.withTransaction(async () => {
			if (callback) {
				await callback(event, session);
			}
			await DAO.contract_events.common.insertOne(
				{
					txid: transactionHash as string,
					blockNumber: Number(blockNumber),
					eventName: event.eventName,
					data: event,
					result: "SUCCESS",
					contractAddress: address.toLowerCase(),
					logIndex: Number(logIndex),
				},
				{ session },
			);
		});
	} catch (e: any) {
		if (err_callback) {
			await err_callback(event, e);
		}
		if (session?.inTransaction()) await session.abortTransaction();
		DAO.contract_events.common.updateOne(
			{
				txid: transactionHash as string,
				blockNumber: Number(blockNumber),
				eventName: event.eventName,
				contractAddress: address.toLowerCase(),
			},
			{
				$set: {
					data: event,
					result: `FAIL:${e.stack || e.message || GetJSONStringify(e) || ""}`,
				},
			},
			{
				upsert: true,
			},
		);
		throw e;
	} finally {
		await session?.endSession();
	}
};

const GetBoolean = (value: any) => {
	if (typeof value === "boolean") return value;
	if (typeof value === "string" && value.toLowerCase() === "true") return true;
	return false;
};
export type AllString<T> = { [Key in keyof T]: string };

export { GetBoolean, EventHandler, EventHandlerCallback };
