import { JobsOptions } from "bullmq";
import { Decimal128, IndexDescription } from "mongodb";
import { Log } from "viem";
type TLogTrigger = {
	from: string;
	to: string;
	data: string;
	method: any;
	params: any;
	jobId: string;
	isExecute: boolean; //isExecute = false -> not valid -> status=false | isExecute = true -> valid -> ready to send to blockchain
	status: boolean; //status = true -> send to blockchain success; status = false -> send to blockchain fail
	linkId?: string;
	transactionFee?: Decimal128;
	oracleFee?: Decimal128;
	retryTimes: number;
	txId?: string;
	logs?: Log[];
	estimateGas?: Decimal128;
	gasBuffer?: Decimal128;
	gasPrice?: Decimal128;
	gasPriceBuffer?: Decimal128;
	gasUsed?: Decimal128;
	gasUsedForL1?: Decimal128;
	error?: string;
	createAt: Date;
	handleAt?: Date;
	options: JobsOptions;
};

const LogTriggerIndexes: IndexDescription[] = [
	{ key: { from: 1 }, background: true },
	{ key: { to: 1 }, background: true },
	{ key: { jobId: 1 }, background: true },
	{ key: { status: 1 }, background: true },
	{ key: { createAt: 1 }, background: true },
	{ key: { txId: 1 }, background: true },
];

export { TLogTrigger, LogTriggerIndexes };
