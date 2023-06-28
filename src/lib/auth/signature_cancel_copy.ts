import { verifyTypedData } from "viem";
import { GasLessInputType } from "../../infra/blockchain/viem/types/type";
import { OPEN_POSITION_CONTRACT_ADDRESS } from "./../../config";
import { GetDomain } from "./helper";

const CANCEL_COPY = {
	Cancel: [
		{ name: "owner", type: "address" },
		{ name: "sign", type: "bytes" },
		{ name: "deadline", type: "uint256" },
	],
};
const verifySignatureCancelCopyGasLess = async (
	sign: string,
	gasLess: GasLessInputType,
) => {
	const domain = GetDomain({
		verifyingContract: OPEN_POSITION_CONTRACT_ADDRESS,
	}) as any;
	const values = {
		owner: gasLess.owner,
		sign,
		deadline: gasLess.deadline,
	};
	const verify = await verifyTypedData({
		address: gasLess.owner as any,
		domain,
		types: CANCEL_COPY,
		primaryType: "Cancel",
		message: values,
		signature: gasLess.signature as any,
	});
	return verify;
};

export { verifySignatureCancelCopyGasLess };
