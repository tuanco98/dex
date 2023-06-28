import { JobsOptions } from "bullmq";
import { Address, encodeFunctionData,  } from "viem";
import { POOL_CONTRACT_ADDRESS } from "../../../../../../config";
import { EListMethods } from "../../../../../../cron/cron.update_handle_trigger";
import { ERROR_CODE, ErrMsg } from "../../../../../../lib/error_handler";
import { isGreaterOrEqual } from "../../../../../../lib/utils";
import { TPermit } from "../../../../../database/mongo/models/Order";
import {
	AddNewQueueTransaction,
	TQueueTransaction,
} from "../../../../../queue_trigger/QueueTransaction";
import { GasLessInputType } from "../../../types/type";
import {
	convertGasLessToArray,
	convertPermitToArray,
	getAllowanceToken,
	getBalanceToken,
} from "../../../viem.helper";
import { POOL_ABI } from "../abi";

import { contractPool } from "../../..";

export const LiquidityShare = async()=> {
	return (await contractPool.read.liquidityShare([])) as unknown as bigint;
}
export const _LOCK_PERIOD = async ()=> {
	return (await contractPool.read.LOCK_PERIOD([])) as unknown as bigint;
}
export const LastDeposit = async(owner: string) => {
	return (await contractPool.read.lastDeposit([owner])) as unknown as bigint;
}
export const CheckBalance = async(owner: string, amount: string) => {
	const balance = await getBalanceToken(owner);
	if (!isGreaterOrEqual(balance, amount))
		throw ErrMsg(ERROR_CODE.INSUFFICIENT_TOKEN);
}
export const GetPoolBalance = async() => {
	return (await contractPool.read.getPoolBalance([])) as unknown as bigint;
}
export const BalanceOf =  async(owner: string) => {
	return (await contractPool.read.balanceOf([owner])) as unknown as bigint;
}
export const IsAllowance =async(owner: string, amount: string) => {
	const allowance = await getAllowanceToken(owner, POOL_CONTRACT_ADDRESS as Address);
	if (!isGreaterOrEqual(allowance, amount)) return false;
	return true;
}
export const DepositPoolGasLess =async(
	amount: string,
	gasLess: GasLessInputType,
	options?: JobsOptions,
) => {
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const function_name = EListMethods.depositGasLess;
	const data = encodeFunctionData({
		abi: POOL_ABI,
		functionName: function_name,
		args: [amount, gas_less_tuple],
	});
	const queue: TQueueTransaction = {
		to: POOL_CONTRACT_ADDRESS as Address,
		method: EListMethods.depositGasLess,
		data,
		params: { amount, gasLess },
		owner: gasLess.owner as Address,
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const DepositPoolGasLessWithPermit = async(
	amount: string,
	gasLess: GasLessInputType,
	permit: TPermit,
	options?: JobsOptions,
)=> {
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const permit_tuple = convertPermitToArray(permit);
	const function_name = EListMethods.depositGasLessWithPermit;
	const data = encodeFunctionData({
		abi: POOL_ABI,
		functionName: function_name,
		args: [amount, gas_less_tuple, permit_tuple],
	});
	const queue: TQueueTransaction = {
		to: POOL_CONTRACT_ADDRESS as Address,
		method: function_name,
		data,
		params: { amount, gasLess, permit },
		owner: gasLess.owner as Address,
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
export const WithdrawPoolGasLess = async (
	amount: string,
	gasLess: GasLessInputType,
	options?: JobsOptions,
) => {
	const gas_less_tuple = convertGasLessToArray(gasLess);
	const function_name = EListMethods.withdrawGasLess;
	const data = encodeFunctionData({
		abi: POOL_ABI,
		functionName: function_name,
		args: [amount, gas_less_tuple],
	});
	const queue: TQueueTransaction = {
		to: POOL_CONTRACT_ADDRESS as Address,
		method: function_name,
		data,
		params: { amount, gasLess },
		owner: gasLess.owner as Address,
	};
	const result = await AddNewQueueTransaction(
		queue,
		options,
	);
	return result;
}
