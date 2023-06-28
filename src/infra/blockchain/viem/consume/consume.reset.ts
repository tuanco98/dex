import { isAddress } from 'viem';
import { getUniqueArr } from "../../../../lib/utils";
import { delCurrentBlockNumberConsume } from "../../../cache/cache.current_block_number_consume";
import { DAO } from "../../../database/mongo/methods";

const reset_consume = async (list_contract: string[]) => {
	try {
		const transform_list_contracts = list_contract.filter(isAddress);
		const remove_dup_contracts = getUniqueArr(transform_list_contracts);
		for (const contract_address of remove_dup_contracts) {
			await delCurrentBlockNumberConsume(contract_address);
			const { deletedCount } = await DAO.contract_events.common.deleteMany({
				contractAddress: contract_address.toLowerCase(),
			});
			console.log(
				`delete ${contract_address} consume tracker and ${deletedCount} documents ...`,
			);
		}
		console.log(`delete success!`);
	} catch (e) {
		throw e;
	}
};

export { reset_consume };
