import { JobsOptions } from "bullmq";
import { Address, encodeFunctionData } from "viem";
import { EDIT_POSITION_CONTRACT_ADDRESS } from "../../../../../../config";
import { EListMethods } from "../../../../../../cron/cron.update_handle_trigger";
import {
	AddNewQueueTransaction,
	TQueueTransaction,
} from "../../../../../queue_trigger/QueueTransaction";
import { GasLessInputType } from "../../../types/type";
import { convertGasLessToArray } from "../../../viem.helper";
import { EDIT_POSITION_ABI } from "../abi";

export const AddCollateralGasLess = async(
	id: string,
	amount: string,
	gasLess: GasLessInputType,
	options?: JobsOptions,
) => {
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const function_name = EListMethods.addCollateralGasLess;
	const data = encodeFunctionData({
		abi: EDIT_POSITION_ABI,
		functionName: function_name,
		args: [id, amount, gas_less_tuple],
	});
	const queue: TQueueTransaction = {
		to: EDIT_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { id, amount, gasLess },
		owner: gasLess.owner as Address
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const RemoveCollateralGasLess =async(
	id: string,
	amount: string,
	gasLess: GasLessInputType,
	options?: JobsOptions,
) => {
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const function_name = EListMethods.removeCollateralGasLess;
	const data = encodeFunctionData({
		abi: EDIT_POSITION_ABI,
		functionName: function_name,
		args: [id, amount, gas_less_tuple],
	});
	const queue: TQueueTransaction = {
		to: EDIT_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { id, amount, gasLess },
		owner: gasLess.owner as Address
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const IncreasePositionGasLess = async(
	id: string,
	amount: string,
	gasLess: GasLessInputType,
	options?: JobsOptions,
) => {
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const function_name = EListMethods.incPositionGasLess;
	const data = encodeFunctionData({
		abi: EDIT_POSITION_ABI,
		functionName: function_name,
		args: [id, amount, gas_less_tuple],
	});
	const queue: TQueueTransaction = {
		to: EDIT_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { id, amount, gasLess },
		owner: gasLess.owner as Address
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const DecreasePositionGasLess = async(
	id: string,
	amount: string,
	gasLess: GasLessInputType,
	options?: JobsOptions,
) => {
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const function_name = EListMethods.decPositionGasLess;
	const data = encodeFunctionData({
		abi: EDIT_POSITION_ABI,
		functionName: function_name,
		args: [id, amount, gas_less_tuple],
	});
	const queue: TQueueTransaction = {
		to: EDIT_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { id, amount, gasLess },
		owner: gasLess.owner as Address
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const ExecuteEditCopy = async(copyIds: string[], options?: JobsOptions) => {
	const function_name = EListMethods.executeEditCopy;
	const data = encodeFunctionData({
		abi: EDIT_POSITION_ABI,
		functionName: function_name,
		args: [copyIds],
	});
	const queue: TQueueTransaction = {
		to: EDIT_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		percentGasBuffer: 300,
		data,
		params: { copyIds },
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
