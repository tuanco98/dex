import { Address, Hex, verifyTypedData } from "viem";
import { GasLessInputType } from "../../infra/blockchain/viem/types/type";
import { PROFIT_SHARE_CONTRACT_ADDRESS } from "./../../config";
import { GetDomain } from "./helper";
import { contractProfitShare } from "../../infra/blockchain/viem";
import { ERROR_CODE, ErrMsg } from "../error_handler";

const WITHDRAW_EPOCH = {
	Withdraw: [
		{ name: "epoch", type: "uint256[]" },
		{ name: "deadline", type: "uint256" },
		{ name: "nonce", type: "uint256" },
	],
};
const verifySignatureWithdrawEpochGasLess = async (
	epochs: number[],
	gasLess: GasLessInputType,
) => {
	const nonce = (await contractProfitShare.read.nonces([gasLess.owner])) as unknown as bigint;
	if(nonce !== BigInt(gasLess.nonce || 0)) throw ErrMsg(ERROR_CODE.INVALID_NONCE)
	const domain: any = GetDomain({ verifyingContract: PROFIT_SHARE_CONTRACT_ADDRESS });
	const values = {
		epoch: epochs,
		deadline: gasLess.deadline,
		nonce: gasLess.nonce,
	};
	const verify = await verifyTypedData({
		address: gasLess.owner as Address,
		domain,
		types: WITHDRAW_EPOCH,
		primaryType: "Withdraw",
		message: values,
		signature: gasLess.signature as Hex,
	});
	return verify;
};
export { verifySignatureWithdrawEpochGasLess };
