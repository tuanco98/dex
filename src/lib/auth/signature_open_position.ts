import { createWalletClient, verifyTypedData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { OPEN_POSITION_CONTRACT_ADDRESS } from "../../config";
import { contractOpenPosition, getTransport } from "../../infra/blockchain/viem";
import {
	GasLessInputType,
	OrderInputType,
} from "../../infra/blockchain/viem/types/type";
import { MILLISECOND_PER_ONE_DAY } from "../constants";
import { ERROR_CODE, ErrMsg } from "../error_handler";
import { GetDomain } from "./helper";

const OPEN_POSITION = {
	OpenPosition: [
		{ name: "owner", type: "address" },
		{ name: "isLong", type: "bool" },
		{ name: "pairId", type: "uint16" },
		{ name: "leverage", type: "uint32" },
		{ name: "amount", type: "uint256" },
		{ name: "tp", type: "uint256" },
		{ name: "sl", type: "uint256" },
		{ name: "deadline", type: "uint256" },
		{ name: "nonce", type: "uint256" },
	],
};
const verifySignatureOpenPositionGasLess = async (
	order: OrderInputType,
	gasLess: GasLessInputType,
) => {
	const nonce = (await contractOpenPosition.read.nonces([gasLess.owner])) as unknown as bigint;
	if(nonce !== BigInt(gasLess.nonce || 0)) throw ErrMsg(ERROR_CODE.INVALID_NONCE)
	const domain = GetDomain({
		verifyingContract: OPEN_POSITION_CONTRACT_ADDRESS,
	}) as any;
	const values = {
		owner: gasLess.owner,
		isLong: order.isLong,
		pairId: order.pairId,
		leverage: order.leverage,
		amount: order.amount,
		tp: order.tp,
		sl: order.sl,
		deadline: gasLess.deadline,
		nonce: gasLess.nonce,
	};
	const verify = await verifyTypedData({
		address: gasLess.owner as any,
		domain,
		types: OPEN_POSITION,
		primaryType: "OpenPosition",
		message: values,
		signature: gasLess.signature as any,
	});
	return verify;
};
const getSignatureOpenPositionGasLess = async (
	order: OrderInputType,
	private_key: string,
	deadline?: number,
) => {
	const owner = privateKeyToAccount(`0x${private_key}`).address;
	const nonce = (await contractOpenPosition.read.nonces([owner])) as unknown as bigint;
	const dead_line = deadline
		? deadline
		: Math.floor((new Date().getTime() + MILLISECOND_PER_ONE_DAY) / 1000);
	const gas_less = {
		owner,
		deadline: dead_line,
		nonce,
		signature: "",
	};
	const domain = GetDomain({
		verifyingContract: OPEN_POSITION_CONTRACT_ADDRESS,
	}) as any;
	const values = {
		owner: gas_less.owner,
		isLong: order.isLong,
		pairId: order.pairId,
		leverage: order.leverage,
		amount: order.amount,
		tp: order.tp,
		sl: order.sl,
		deadline: gas_less.deadline,
		nonce: gas_less.nonce,
	};
	const account = privateKeyToAccount(`0x${private_key}` as any);
	const walletClient = createWalletClient({
		account,
		transport: getTransport(),
	});
	const signature = await walletClient.signTypedData({
		domain,
		account,
		types: OPEN_POSITION,
		primaryType: "OpenPosition",
		message: values,
	});
	return { dead_line, nonce: Number(nonce), signature };
};
export { verifySignatureOpenPositionGasLess, getSignatureOpenPositionGasLess };
