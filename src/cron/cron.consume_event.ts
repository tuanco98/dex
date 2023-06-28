import { isAddress } from "viem";
import { getStartBlock } from "../infra/blockchain/viem/consume/consume.helper";
import { intervalConsume } from "../infra/blockchain/viem/consume/consume.interval_consume";
import { getContractInfo } from "../infra/blockchain/viem/contract";
import { ErrorHandler } from "../lib/error_handler";
import { getUniqueArr } from "../lib/utils";

export const cron_update_event = async (list_contract: string[]) => {
	try {
		const transform_list_contracts = list_contract.filter(isAddress);
		const remove_dup_contracts = getUniqueArr(transform_list_contracts);
		console.log({ all_contract: remove_dup_contracts });
		for (const contract_address of remove_dup_contracts) {
			const contract_info = getContractInfo(contract_address);
			if (!contract_info)
				throw new Error(
					`${contract_address} contract info not found. Please init before start!`,
				);
			const start_block = await getStartBlock(contract_address, contract_info.init_start_block)
			console.log({ start_block });
			if (start_block == null) throw new Error("Start block invalid");
			intervalConsume(start_block, contract_info);
		}
	} catch (e) {
		ErrorHandler(e, list_contract, cron_update_event.name).throwErr();
	}
};
