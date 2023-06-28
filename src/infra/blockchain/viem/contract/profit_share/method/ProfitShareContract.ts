import { JobsOptions } from "bullmq";
import { Address, encodeFunctionData } from "viem";
import { PROFIT_SHARE_CONTRACT_ADDRESS } from "../../../../../../config";
import { EListMethods } from "../../../../../../cron/cron.update_handle_trigger";
import { AddNewQueueTransaction, TQueueTransaction } from "../../../../../queue_trigger/QueueTransaction";
import { GasLessInputType } from "../../../types/type";
import { convertGasLessToArray } from "../../../viem.helper";
import { PROFIT_SHARE_ABI } from "../abi";

export const WithdrawEpochGasLess = async (
	epoch: number[],
	gasLess: GasLessInputType,
	options?: JobsOptions,
) => {
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const function_name = EListMethods.withdrawEpochGasLess;
	const data = encodeFunctionData({
		abi: PROFIT_SHARE_ABI,
		functionName: function_name,
		args: [epoch, gas_less_tuple],
	});
	const queue: TQueueTransaction = {
		to: PROFIT_SHARE_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { epoch, gasLess },
		owner: gasLess.owner as Address,
	};
	const result = await AddNewQueueTransaction(queue, options);
	return result;
};