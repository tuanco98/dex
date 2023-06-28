import { verifyTypedData } from "viem";
import { GasLessInputType } from "../../infra/blockchain/viem/types/type";
import { POOL_CONTRACT_ADDRESS } from "./../../config";
import { GetDomain } from "./helper";
import { contractPool } from "../../infra/blockchain/viem";
import { ERROR_CODE, ErrMsg } from "../error_handler";

const WITHDRAW_POOL = {
	Withdraw: [
		{ name: "amountLp", type: "uint256" },
		{ name: "deadline", type: "uint256" },
		{ name: "nonce", type: "uint256" },
	],
};
const verifySignatureWithdrawGasLess = async (
	amount: string,
	gasLess: GasLessInputType,
) => {
	const nonce = (await contractPool.read.nonces([gasLess.owner])) as unknown as bigint;
	if(nonce !== BigInt(gasLess.nonce || 0)) throw ErrMsg(ERROR_CODE.INVALID_NONCE)
	const domain: any = GetDomain({ verifyingContract: POOL_CONTRACT_ADDRESS });
	const values = {
		amountLp: amount,
		deadline: gasLess.deadline,
		nonce: gasLess.nonce,
	};
	const verify = await verifyTypedData({
		address: gasLess.owner as any,
		domain,
		types: WITHDRAW_POOL,
		primaryType: "Withdraw",
		message: values,
		signature: gasLess.signature as any,
	});
	return verify;
};
export { verifySignatureWithdrawGasLess };
