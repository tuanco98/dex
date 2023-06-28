import { Job, JobsOptions, Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import {
	Address,
	Hex,
	TransactionReceipt,
	fromHex
} from "viem";
import { system_status } from "..";
import { errorConsoleLog, successConsoleLog } from "../../lib/color-log";
import { MILLISECOND_PER_ONE_SEC, PERCENT } from "../../lib/constants";
import { GetJSONStringify, lowerCase, sleep } from "../../lib/utils";
import { viemPublicClient, viemWalletClient } from "../blockchain/viem";
import {
	decodeParametersFeePaid,
	getFeePaidLogs
} from "../blockchain/viem/viem.helper";
import { DAO } from "../database/mongo/methods";
import { toDecimal128 } from "../database/mongo/methods/helper";
import { TLogTrigger } from "../database/mongo/models/LogTrigger";
import { mongo } from "../database/mongo/mongo";
import { UpdateNotification } from "../notification";
import { REDIS_PREFIX, REDIS_URI } from "./../../config";
import { BOTS_TRIGGER, PickBotFreeTime, UnTickBotExecute } from "./BotHandle";

const connection = new IORedis(REDIS_URI, { maxRetriesPerRequest: null });
const QUEUE_NAME = "QUEUE_TRIGGER_TRANSACTIONS";
const JOB_NAME = "TRIGGER_TRANSACTIONS";
const ERROR_MESSAGES_MUST_RETRY = [
	"Returned error: max fee per gas less than block base fee",
	"insufficient funds for gas * price + value",
	"ALL BOT INSUFFICIENT BALANCE",
	"gas required exceeds allowance",
];
export type TQueueTransaction = {
	to: Address;
	method: string;
	params: any;
	data: Hex;
	percentGasBuffer?: number;
	owner?: Address;
	value?: bigint;
};
export type QueueOptions = {
	priority?: number;
	acceptAnyBaseFee?: boolean;
};
const RETRY_TIMES = 10;
export const queueTransaction = new Queue<TQueueTransaction>(QUEUE_NAME, {
	connection,
	prefix: REDIS_PREFIX,
});
export const AddNewQueueTransaction = async (
	queue: TQueueTransaction,
	opts?: JobsOptions,
) => {
	try {
		const jobId = uuidv4() as string;
		const options = {
			...opts,
			jobId: jobId,
			attempts: RETRY_TIMES,
			backoff: {
				type: "exponential",
				delay: 100,
			},
		};
		await queueTransaction.add(JOB_NAME, queue, options);
		return jobId;
	} catch (e) {
		throw e;
	}
};
export const waitTransactionReceipt = async (txHash: Hex) => {
	try {
		const receipt = await viemPublicClient.waitForTransactionReceipt({
			hash: txHash,
			onReplaced: (replacement) => console.log(replacement),
			timeout: 3 * MILLISECOND_PER_ONE_SEC,
		});
		return receipt;
	} catch {
		let receipt: null | TransactionReceipt = null;
		while (!receipt) {
			console.log("getTransactionReceipt...");
			try {
				receipt = await viemPublicClient.getTransactionReceipt({
					hash: txHash,
				});
				if (receipt) break;
			} catch {
				receipt = null;
			}
			await sleep(300);
		}
		return receipt;
	}
};
const handleProcessTrigger = async (job: Job) => {
	const bot_trigger = await PickBotFreeTime();
	console.log(`=> BOT: ${bot_trigger.accountInfo.address} start trigger`);
	let log_trigger: TLogTrigger | undefined = undefined;
	let is_retry = false;
	try {
		const queue = job.data as TQueueTransaction;
		const { value, data, to, method, params } = queue;
		const options = { ...job.opts };
		options.jobId = undefined;
		log_trigger = {
			from: lowerCase(bot_trigger.accountInfo.address),
			to: lowerCase(to),
			method,
			isExecute: false,
			jobId: job.id || "",
			params,
			retryTimes: job.attemptsMade,
			data,
			status: false,
			createAt: new Date(),
			options: options,
		};
		const _value = value ? BigInt(value) : undefined;
		const estimate_gas = await viemPublicClient.estimateGas({
			account: bot_trigger.accountInfo,
			to,
			data,
		});
		const percent_gas_buffer = BigInt(queue?.percentGasBuffer || 50);
		const gas_buffer = (estimate_gas * percent_gas_buffer) / BigInt(PERCENT);
		const gas = BigInt(estimate_gas + gas_buffer);
		const get_gas_price = system_status.baseFee;
		log_trigger = {
			...log_trigger,
			estimateGas: toDecimal128(estimate_gas.toString()),
			gasBuffer: toDecimal128(gas.toString()),
			gasPrice: toDecimal128(get_gas_price),
		};
		const txHash = await viemWalletClient.sendTransaction({
			account: bot_trigger.accountInfo,
			to,
			value: _value,
			gas,
			data,
			chain: null,
		});
		console.log(
			`-> SendTransaction hash: ${txHash} => waiting transaction confirm`,
		);
		const receipt = await waitTransactionReceipt(txHash);
		console.log("=> Transaction confirmed");
		const transactionFee = receipt.effectiveGasPrice * receipt.gasUsed;
		const fee_paid_logs = getFeePaidLogs(receipt.logs, receipt.transactionHash);
		let oracleFee: bigint | undefined = undefined;
		if (fee_paid_logs.length > 0) {
			oracleFee = 0n
			for (const log of fee_paid_logs) {
				oracleFee += BigInt(decodeParametersFeePaid(log.data).oracle);
			}
		}
		log_trigger = {
			...log_trigger,
			status: receipt.status === "success" ? true : false,
			transactionFee: toDecimal128(transactionFee),
			oracleFee: oracleFee ? toDecimal128(oracleFee) : undefined,
			isExecute: true,
			error: receipt.status === "reverted" ? "execution reverted" : undefined,
			logs: receipt.logs,
			txId: receipt.transactionHash,
			gasUsed: toDecimal128(receipt.gasUsed.toString()),
			gasUsedForL1: toDecimal128(fromHex(receipt["gasUsedForL1"], "bigint")),
		};
		const message_log = `=> BOT: ${bot_trigger.accountInfo.address} trigger ${receipt.status} => txId: ${receipt.transactionHash}`;
		receipt.status === "success"
			? successConsoleLog(message_log)
			: errorConsoleLog(message_log);
		return GetJSONStringify(receipt);
	} catch (e: any) {
		const message = e.details
			? e.details?.replace("execution reverted: ", "")
			: e.shortMessage
			? e.shortMessage
			: e.message;
		if (log_trigger) {
			log_trigger = { ...log_trigger, error: message };
		}
		const is_error_must_retry = ERROR_MESSAGES_MUST_RETRY.some((el) =>
			message?.startsWith(el),
		);
		if (is_error_must_retry) {
			is_retry = true;
			throw e;
		}
		errorConsoleLog(
			`=> BOT: ${bot_trigger.accountInfo.address} trigger fail => ${message}`,
		);
		return { error: message };
	} finally {
		UnTickBotExecute(bot_trigger.id);
		if (
			log_trigger &&
			(!is_retry || (is_retry && job.attemptsMade === RETRY_TIMES))
		) {
			await DAO.logs_trigger.NewLogTrigger(log_trigger);
		}
	}
};
export const initWorkerTriggerTransaction = () => {
	try {
		if (connection.status === "ready")
			successConsoleLog("BullMQ: Init queue success!");
		const worker = new Worker(QUEUE_NAME, handleProcessTrigger, {
			connection,
			concurrency: BOTS_TRIGGER.length,
			prefix: REDIS_PREFIX,
		});
		successConsoleLog("BullMQ: Init worker success!");
		queueTransaction.on("waiting", (job: Job) => {
			console.log(`=> Job id waiting: ${job.id}`);
		});
		worker.on(
			"failed",
			(
				job: Job<any, string | { error: any }, string> | undefined,
				error: Error,
			) => {
				if (job?.attemptsMade && job.attemptsMade < RETRY_TIMES) {
					errorConsoleLog(`=> Job ${job.id} failed is reason: ${error}}`);
					console.log(`=> Job ${job.id} retry...`);
				}
			},
		);
		worker.on("error", () => {
			errorConsoleLog(`=> Queue error!!!`);
		});
		worker.on("completed", async (job: Job) => {
			successConsoleLog(`Job id: ${job.id} => completed`);
			if (!job.returnvalue) return;
			const session = mongo.startSession();
			try {
				session.startTransaction();
				if (job.returnvalue?.error) {
					if (job.id) {
						await UpdateNotification({
							jobId: job.id,
							payload: {
								jobId: job?.id || "",
								reason: job.returnvalue?.error,
							},
							status: "Failed",
							session,
						});
						await session.commitTransaction();
					}
					return;
				}
				const receipt = JSON.parse(job.returnvalue) as TransactionReceipt;
				if (receipt.status === "success") {
					await UpdateNotification({
						jobId: job?.id || "",
						session,
					});
				}
				await session.commitTransaction();
			} catch (err) {
				if (session.inTransaction()) await session.abortTransaction();
				console.log(err);
			} finally {
				await session.endSession();
			}
		});
	} catch (e: any) {
		throw e;
	}
};
