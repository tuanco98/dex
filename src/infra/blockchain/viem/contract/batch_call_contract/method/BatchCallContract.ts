import { contractBathCall } from "../../..";

export const BatchAllowance = async (
	token: string,
	spender: string,
	addresses: string[],
) => {
	return (await contractBathCall.read.batchAllowance([
		token,
		spender,
		addresses,
	])) as bigint[];
};
export const BatchBalanceOf = async (token: string, addresses: string[]) => {
	return (await contractBathCall.read.batchBalanceOf([
		token,
		addresses,
	])) as bigint[];
};
export const BatchEthBalances = async (addresses: string[]) => {
	return (await contractBathCall.read.batchEthBalances([
		addresses,
	])) as bigint[];
};
