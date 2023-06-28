import {
	ANTI_REORG_BLOCK_NUMBER,
	AVG_BLOCK_TIME_SEC,
} from "../../../../config";
import { MILLISECOND_PER_ONE_SEC } from "../../../../lib/constants";
import { ErrorHandler } from "../../../../lib/error_handler";
import { setCurrentBlockNumberConsume } from "../../../cache/cache.current_block_number_consume";
import { getLatestBlockNumber } from "../../../cache/cache.latest_block_number";
import { ContractInfo } from "../contract";
import { getPastEvents } from "./consume.getPastEvent";
import { getConsumeOptions } from "./consume.helper";

export const intervalConsume = async (
	start_block: bigint,
	contract_info: ContractInfo,
) => {
	let _start_block = start_block;
	let new_start_block: bigint | null = null;
	try {
		const latest_block = await getLatestBlockNumber();
		if (!latest_block) return;
		if (latest_block < 0) throw new Error(`Latest blockNumber invalid`);
		const safe_latest_block = latest_block - ANTI_REORG_BLOCK_NUMBER;
		if (_start_block >= safe_latest_block) {
			_start_block = safe_latest_block;
			return;
		}
		
		const options = getConsumeOptions(
			_start_block,
			safe_latest_block,
			contract_info.step_block,
		);
		await getPastEvents(options, contract_info);
		new_start_block = options.toBlock + 1n;
		await setCurrentBlockNumberConsume(contract_info.address, new_start_block);
	} catch (e) {
		ErrorHandler(
			e,
			{ _start_block, contract_info },
			intervalConsume.name,
		).throwErr();
	} finally {
		setTimeout(
			() => intervalConsume(new_start_block || _start_block, contract_info),
			AVG_BLOCK_TIME_SEC * MILLISECOND_PER_ONE_SEC,
		);
	}
};
