import { verifyTypedData } from "viem";
import { GasLessInputType } from "../../infra/blockchain/viem/types/type";
import { POOL_CONTRACT_ADDRESS } from "./../../config";
import { GetDomain } from "./helper";
import { contractPool } from "../../infra/blockchain/viem";
import { ERROR_CODE, ErrMsg } from "../error_handler";

const DEPOSIT_POOL = {
	Deposit: [
		{ name: "amount", type: "uint256" },
		{ name: "deadline", type: "uint256" },
		{ name: "nonce", type: "uint256" },
	],
};
const verifySignatureDepositGasLess = async (
	amount: string,
	gasLess: GasLessInputType,
) => {
	const nonce = (await contractPool.read.nonces([gasLess.owner])) as unknown as bigint;
	if(nonce !== BigInt(gasLess.nonce || 0)) throw ErrMsg(ERROR_CODE.INVALID_NONCE)
	const domain = GetDomain({ verifyingContract: POOL_CONTRACT_ADDRESS }) as any;
	const values = {
		amount,
		deadline: gasLess.deadline,
		nonce: gasLess.nonce,
	};
	const verify = await verifyTypedData({
		address: gasLess.owner as any,
		domain,
		types: DEPOSIT_POOL,
		primaryType: "Deposit",
		message: values,
		signature: gasLess.signature as any,
	});
	return verify;
};
export { verifySignatureDepositGasLess };
