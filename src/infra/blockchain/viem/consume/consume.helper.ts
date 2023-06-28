import { Address, decodeEventLog } from "viem";
import { getCurrentBlockNumberConsume } from "../../../cache/cache.current_block_number_consume";
import { viemPublicClient } from "..";
import { ContractInfo } from "../contract";
import { GetPastEventOptionsType, TEventData } from "./consume.getPastEvent";

const getStartBlock = async (
	contract_address: Address,
	init_start_block: bigint,
) => {
	const getCurrentBlock: bigint | null = await getCurrentBlockNumberConsume(
		contract_address,
	);
	return getCurrentBlock ? getCurrentBlock : init_start_block;
};

const getConsumeOptions = (
	start_block: bigint,
	latest_block: bigint,
	step_block: bigint,
) => {
	const currentBlockWithStepBlock = start_block + step_block - 1n;
	const toBlock =
		currentBlockWithStepBlock >= latest_block
			? latest_block - 1n
			: currentBlockWithStepBlock;
	return { fromBlock: start_block, toBlock };
};
const GetPastEvents = async (
	contract_info: ContractInfo,
	options: GetPastEventOptionsType,
): Promise<TEventData[]> => {
	const logs = await viemPublicClient.getLogs({
		address: contract_info.address,
		fromBlock: options.fromBlock,
		toBlock: options.toBlock,
	});
	const decode_logs: any[] = logs.map((log) => {
		const decode = decodeEventLog({
			abi: contract_info.abi,
			data: log.data,
			topics: log.topics,
		});
		return { ...decode, ...log };
	});
	return decode_logs;
};
export { getStartBlock, getConsumeOptions, GetPastEvents };
