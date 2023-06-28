import { Address } from "viem";
import {
	BATCH_CALL_CONTRACT_ADDRESS,
	CHAINLINK_CONTRACT_ADDRESS,
	EDIT_POSITION_CONTRACT_ADDRESS,
	FUNDING_CONTRACT_ADDRESS,
	OPEN_POSITION_CONTRACT_ADDRESS,
	PAIR_CONTRACT_ADDRESS,
	POOL_CONTRACT_ADDRESS,
	POSITION_CONTRACT_ADDRESS,
	PROCESSOR_CONTRACT_ADDRESS,
	PROFIT_SHARE_CONTRACT_ADDRESS,
	TRADING_CONTRACT_START_BLOCK,
	TRADING_CONTRACT_STEP_BLOCK,
} from "../../../../config";
import { lowerCase } from "../../../../lib/utils";
import { BATCH_CALL_ABI } from "./batch_call_contract/abi";
import { CHAINLINK_ABI } from "./chainlink_contract/abi";
import { EDIT_POSITION_ABI } from "./edit_position/abi";
import { FUNDING_ABI } from "./funding_contract/abi";
import { OPEN_POSITION_ABI } from "./open_position_contract/abi";
import { PAIR_ABI } from "./pair_contract/abi";
import { POOL_ABI } from "./pool_contract/abi";
import { POSITION_ABI } from "./position_contract/abi";
import { PROCESSOR_ABI } from "./processor_contract/abi";
import { PROFIT_SHARE_ABI } from "./profit_share/abi";
type ContractInfo = {
	address: Address;
	abi: any;
	init_start_block: bigint;
	step_block: bigint;
};
const getContractInfo: (contract: Address) => ContractInfo | null = (
	_contract: string,
) => {
	const contract = lowerCase(_contract);
	switch (contract) {
		// case TRADING_CONTRACT_ADDRESS: return {
		//     address: TRADING_CONTRACT_ADDRESS,
		//     abi: TRADING_ABI,
		//     init_start_block: TRADING_CONTRACT_START_BLOCK,
		//     step_block: TRADING_CONTRACT_STEP_BLOCK
		// }
		case POSITION_CONTRACT_ADDRESS:
			return {
				address: POSITION_CONTRACT_ADDRESS,
				abi: POSITION_ABI,
				init_start_block: TRADING_CONTRACT_START_BLOCK,
				step_block: TRADING_CONTRACT_STEP_BLOCK,
			};
		case POOL_CONTRACT_ADDRESS:
			return {
				address: POOL_CONTRACT_ADDRESS,
				abi: POOL_ABI,
				init_start_block: TRADING_CONTRACT_START_BLOCK,
				step_block: TRADING_CONTRACT_STEP_BLOCK,
			};
		case FUNDING_CONTRACT_ADDRESS:
			return {
				address: FUNDING_CONTRACT_ADDRESS,
				abi: FUNDING_ABI,
				init_start_block: TRADING_CONTRACT_START_BLOCK,
				step_block: TRADING_CONTRACT_STEP_BLOCK,
			};
		case PROCESSOR_CONTRACT_ADDRESS:
			return {
				address: PROCESSOR_CONTRACT_ADDRESS,
				abi: PROCESSOR_ABI,
				init_start_block: TRADING_CONTRACT_START_BLOCK,
				step_block: TRADING_CONTRACT_STEP_BLOCK,
			};
		case OPEN_POSITION_CONTRACT_ADDRESS:
			return {
				address: OPEN_POSITION_CONTRACT_ADDRESS,
				abi: OPEN_POSITION_ABI,
				init_start_block: TRADING_CONTRACT_START_BLOCK,
				step_block: TRADING_CONTRACT_STEP_BLOCK,
			};
		case PAIR_CONTRACT_ADDRESS:
			return {
				address: PAIR_CONTRACT_ADDRESS,
				abi: PAIR_ABI,
				init_start_block: TRADING_CONTRACT_START_BLOCK,
				step_block: TRADING_CONTRACT_STEP_BLOCK,
			};
		case CHAINLINK_CONTRACT_ADDRESS:
			return {
				address: CHAINLINK_CONTRACT_ADDRESS,
				abi: CHAINLINK_ABI,
				init_start_block: TRADING_CONTRACT_START_BLOCK,
				step_block: TRADING_CONTRACT_STEP_BLOCK,
			};
		case EDIT_POSITION_CONTRACT_ADDRESS:
			return {
				address: EDIT_POSITION_CONTRACT_ADDRESS,
				abi: EDIT_POSITION_ABI,
				init_start_block: TRADING_CONTRACT_START_BLOCK,
				step_block: TRADING_CONTRACT_STEP_BLOCK,
			};
		case BATCH_CALL_CONTRACT_ADDRESS:
			return {
				address: BATCH_CALL_CONTRACT_ADDRESS,
				abi: BATCH_CALL_ABI,
				init_start_block: TRADING_CONTRACT_START_BLOCK,
				step_block: TRADING_CONTRACT_STEP_BLOCK,
			};
		case PROFIT_SHARE_CONTRACT_ADDRESS:
			return {
				address: PROFIT_SHARE_CONTRACT_ADDRESS,
				abi: PROFIT_SHARE_ABI,
				init_start_block: TRADING_CONTRACT_START_BLOCK,
				step_block: TRADING_CONTRACT_STEP_BLOCK,
			};
		default:
			return null;
	}
};

export { getContractInfo, ContractInfo };
