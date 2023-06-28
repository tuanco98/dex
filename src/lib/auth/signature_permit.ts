import { Hex, hashTypedData, recoverAddress, toHex } from "viem";
import { USDC_TOKEN_CONTRACT_ADDRESS } from "../../config";
import { TPermit } from "../../infra/database/mongo/models/Order";
import { GetDomain } from "./helper";
import { isMatchAddress } from "../../infra/blockchain/viem/viem.helper";
import { contractUSDCToken } from "../../infra/blockchain/viem";
import { ERROR_CODE, ErrMsg } from "../error_handler";

const PERMIT = {
	Permit: [
		{ name: "owner", type: "address" },
		{ name: "spender", type: "address" },
		{ name: "value", type: "uint256" },
		{ name: "nonce", type: "uint256" },
		{ name: "deadline", type: "uint256" },
	],
};
const toSignature = (v: number, r: string, s: string) => {
	const _v = toHex(v).slice(2);
	const _r = r.startsWith("0x") ? r.slice(2) : r;
	const _s = s.startsWith("0x") ? s.slice(2) : s;
	return `0x${_r}${_s}${_v}` as Hex;
};
const verifySignaturePermit = async (permit: TPermit) => {
	const nonce = (await contractUSDCToken.read.nonces([permit.owner])) as unknown as bigint;
	if(nonce !== BigInt(permit.nonce || 0)) throw ErrMsg(ERROR_CODE.INVALID_NONCE)
	const domain: any = GetDomain({
		name: "USD Coin (Arb1)",
		verifyingContract: USDC_TOKEN_CONTRACT_ADDRESS,
	});
	const values = {
		owner: permit.owner,
		spender: permit.spender,
		value: permit.value,
		nonce: permit.nonce,
		deadline: permit.deadline,
	};
	const message = hashTypedData({
		domain,
		types: PERMIT,
		primaryType: "Permit",
		message: values,
	});
	const signature = toSignature(permit.v, permit.r, permit.s)
	const recover = await recoverAddress({
		hash: message,
		signature
	});
	if (!isMatchAddress(recover, permit.owner)) return false;
	return true;
};
export { verifySignaturePermit };
