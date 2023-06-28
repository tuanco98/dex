import { JobsOptions } from "bullmq";
import { Address, encodeFunctionData, parseEther } from "viem";
import {
	POOL_CONTRACT_ADDRESS,
	PROCESSOR_CONTRACT_ADDRESS,
} from "../../../../../../config";
import { EListMethods } from "../../../../../../cron/cron.update_handle_trigger";
import { ERROR_CODE, ErrMsg } from "../../../../../../lib/error_handler";
import { isGreaterOrEqual } from "../../../../../../lib/utils";
import {
	AddNewQueueTransaction,
	TQueueTransaction,
} from "../../../../../queue_trigger/QueueTransaction";
import { GasLessInputType } from "../../../types/type";
import {
	convertGasLessToArray,
	getAllowanceToken,
	getBalanceToken,
} from "../../../viem.helper";
import { ECloseType } from "../../position_contract/event";
import { PROCESSOR_ABI } from "../abi";

export const CheckBalance = async (owner: string, amount: string) => {
	const balance = await getBalanceToken(owner);
	if (!isGreaterOrEqual(balance, amount))
		throw ErrMsg(ERROR_CODE.INSUFFICIENT_TOKEN);
};
export const IsAllowance = async (owner: string, amount: string) => {
	const allowance = await getAllowanceToken(owner, POOL_CONTRACT_ADDRESS);
	if (!isGreaterOrEqual(allowance, amount)) return false;
	return true;
};
export const ClosePosition = async (
	orderId: string,
	price: number,
	closeType: ECloseType,
	options?: JobsOptions,
) => {
	const atomic_price = parseEther(`${price}`);
	const function_name = EListMethods.closePosition;
	const data = encodeFunctionData({
		abi: PROCESSOR_ABI,
		functionName: function_name,
		args: [orderId, atomic_price, closeType],
	});
	const queue: TQueueTransaction = {
		to: PROCESSOR_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { orderId, price, closeType },
	};
	const result = await AddNewQueueTransaction(queue, options);
	return result;
};
export const ClosePositions = async (
	orderIds: string[],
	prices: number[],
	closeTypes: ECloseType[],
	options?: JobsOptions,
) => {
	const atomic_prices: bigint[] = prices.map((el) => parseEther(`${el}`));
	const function_name = EListMethods.closePositions;
	const data = encodeFunctionData({
		abi: PROCESSOR_ABI,
		functionName: function_name,
		args: [orderIds, atomic_prices, closeTypes],
	});
	const queue: TQueueTransaction = {
		to: PROCESSOR_CONTRACT_ADDRESS,
		method: function_name,
		percentGasBuffer: 300,
		data,
		params: { orderIds, prices, closeTypes },
	};
	const result = await AddNewQueueTransaction(queue, options);
	return result;
};
export const ClosePositionGasLess = async (
	orderId: string,
	gasLess: GasLessInputType,
	options?: JobsOptions,
) => {
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const function_name = EListMethods.closePositionGasLess;
	const data = encodeFunctionData({
		abi: PROCESSOR_ABI,
		functionName: function_name,
		args: [orderId, gas_less_tuple],
	});
	const queue: TQueueTransaction = {
		to: PROCESSOR_CONTRACT_ADDRESS,
		method: function_name,
		data,
		params: { orderId, gasLess },
		owner: gasLess.owner as Address,
	};
	const result = await AddNewQueueTransaction(queue, options);
	return result;
};
