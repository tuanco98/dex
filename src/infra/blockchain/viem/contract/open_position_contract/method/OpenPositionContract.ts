import { JobsOptions } from "bullmq";
import { Address, encodeFunctionData } from "viem";
import { POOL_CONTRACT_ADDRESS } from "../../../../../../config";
import { EListMethods } from "../../../../../../cron/cron.update_handle_trigger";
import { ERROR_CODE, ErrMsg } from "../../../../../../lib/error_handler";
import { isGreaterOrEqual } from "../../../../../../lib/utils";
import { TCopyRequest } from "../../../../../database/mongo/models/CopyProof";
import { TPermit } from "../../../../../database/mongo/models/Order";
import {
	AddNewQueueTransaction,
	TQueueTransaction,
} from "../../../../../queue_trigger/QueueTransaction";
import {
	GasLessInputType,
	OrderInputType,
	OrderLimitInputType,
} from "../../../types/type";
import {
	convertCopyRequestToArray,
	convertGasLessToArray,
	convertOrderLimitToArray,
	convertOrderToArray,
	convertPermitToArray,
	getAllowanceToken,
	getBalanceToken
} from "../../../viem.helper";
import { OPEN_POSITION_ABI } from "../abi";
import { OPEN_POSITION_CONTRACT_ADDRESS } from "../../../../../../config";

export const CheckBalance = async (owner: string, amount: string) => {
	const balance = await getBalanceToken(owner);
	if (!isGreaterOrEqual(balance, amount))
		throw ErrMsg(ERROR_CODE.INSUFFICIENT_TOKEN);
}
export const IsAllowance = async(owner: string, amount: string) => {
	const allowance = await getAllowanceToken(owner, POOL_CONTRACT_ADDRESS);
	if (!isGreaterOrEqual(allowance, amount)) return false;
	return true;
}
export const OpenPositionGasLess = async(
	order: OrderInputType,
	gasLess: GasLessInputType,
	options?: JobsOptions,
) => {
	const order_tuple = convertOrderToArray(order);
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const function_name = EListMethods.openPositionGasLess;
	const data = encodeFunctionData({
		abi: OPEN_POSITION_ABI,
		functionName: function_name,
		args: [order_tuple, gas_less_tuple],
	});
	const queue: TQueueTransaction = {
		to: OPEN_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { order, gasLess },
		owner: gasLess.owner as Address,
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const OpenLimitPosition = async(order: OrderLimitInputType, options?: JobsOptions) => {
	const order_tuple = convertOrderLimitToArray(order);
	const function_name = EListMethods.openLimitPosition;
	const data = encodeFunctionData({
		abi: OPEN_POSITION_ABI,
		functionName: function_name,
		args: [order_tuple],
	});
	const queue: TQueueTransaction = {
		to: OPEN_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { order },
		owner: order.owner as Address,
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const OpenLimitPositionWithPermit = async (
	order: OrderLimitInputType,
	permit: TPermit,
	options?: JobsOptions,
) => {
	const order_tuple = convertOrderLimitToArray(order);
	const permit_tuple = convertPermitToArray(permit);
	const function_name = EListMethods.openLimitPositionWithPermit;
	const data = encodeFunctionData({
		abi: OPEN_POSITION_ABI,
		functionName: function_name,
		args: [order_tuple, permit_tuple],
	});
	const queue: TQueueTransaction = {
		to: OPEN_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { order, permit },
		owner: order.owner as Address,
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const OpenPositionGasLessWithPermit = async(
	order: OrderInputType,
	gasLess: GasLessInputType,
	permit: TPermit,
	options?: JobsOptions,
) => {
	const order_tuple = convertOrderToArray(order);
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const permit_tuple = convertPermitToArray(permit);
	const function_name = EListMethods.openPositionGasLessWithPermit;
	const data = encodeFunctionData({
		abi: OPEN_POSITION_ABI,
		functionName: function_name,
		args: [order_tuple, gas_less_tuple, permit_tuple],
	});
	const queue: TQueueTransaction = {
		to: OPEN_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { order, gasLess, permit },
		owner: gasLess.owner as Address,
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const CancelGasLess = async (
	signature: string,
	gasLess: GasLessInputType,
	options?: JobsOptions,
) => {
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const function_name = EListMethods.cancelGasLess;
	const data = encodeFunctionData({
		abi: OPEN_POSITION_ABI,
		functionName: function_name,
		args: [signature, gas_less_tuple],
	});
	const queue: TQueueTransaction = {
		to: OPEN_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { signature, gasLess },
		owner: gasLess.owner as Address,
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const CancelOrder = async (signature: string, options?: JobsOptions) => {
	const function_name = EListMethods.cancel;
	const data = encodeFunctionData({
		abi: OPEN_POSITION_ABI,
		functionName: function_name,
		args: [signature],
	});
	const queue: TQueueTransaction = {
		to: OPEN_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { signature },
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const UpdateLimitGasLess = async(
	orderId: string,
	tp: string,
	sl: string,
	gasLess: GasLessInputType,
	options?: JobsOptions,
) => {
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const function_name = EListMethods.updateLimitGasLess;
	const data = encodeFunctionData({
		abi: OPEN_POSITION_ABI,
		functionName: function_name,
		args: [orderId, tp, sl, gas_less_tuple],
	});
	const queue: TQueueTransaction = {
		to: OPEN_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { orderId, tp, sl, gasLess },
		owner: gasLess.owner as Address,
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const ExecuteCopy = async(
	id: string,
	copyRequests: TCopyRequest[],
	permits: TPermit[],
	options?: JobsOptions,
) => {
	const copyRequestTuple = copyRequests.map(convertCopyRequestToArray);
	const permitsTuple = permits.map(convertPermitToArray);
	const function_name = EListMethods.executeCopy;
	const data = encodeFunctionData({
		abi: OPEN_POSITION_ABI,
		functionName: function_name,
		args: [id, copyRequestTuple, permitsTuple],
	});
	const queue: TQueueTransaction = {
		to: OPEN_POSITION_CONTRACT_ADDRESS,
		method: function_name,
		percentGasBuffer: 300,
		data,
		params: { id, copyRequests, permits },
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}

