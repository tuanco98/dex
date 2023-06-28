import { IndexDescription } from "mongodb";

export type IContractEvent = {
	txid: string;
	contractAddress: string;
	blockNumber: number;
	eventName: string;
	data: any;
	logIndex: number;
	result: "SUCCESS" | Omit<string, "SUCCESS">;
};

export const ContractEventIndexes: IndexDescription[] = [
	{ key: { txid: 1, blockNumber: 1 }, unique: true, background: true },
	{ key: { txid: 1 }, background: true },
	{ key: { eventName: 1 }, background: true },
	{ key: { result: 1 }, background: true },
];
