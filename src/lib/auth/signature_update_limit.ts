import { verifyTypedData } from "viem";
import { OPEN_POSITION_CONTRACT_ADDRESS } from "../../config";
import { GasLessInputType } from "../../infra/blockchain/viem/types/type";
import { GetDomain } from "./helper";

const UPDATE_LIMIT = {
	UpdateLimit: [
		{ name: "owner", type: "address" },
		{ name: "id", type: "bytes32" },
		{ name: "tp", type: "uint256" },
		{ name: "sl", type: "uint256" },
		{ name: "deadline", type: "uint256" },
	],
};
const verifySignatureUpdateLimit = async (
	orderId: string,
	tp: string,
	sl: string,
	gasLess: GasLessInputType,
) => {
	const domain: any = GetDomain({
		verifyingContract: OPEN_POSITION_CONTRACT_ADDRESS,
	});
	const values = {
		owner: gasLess.owner,
		id: orderId,
		tp,
		sl,
		deadline: gasLess.deadline,
	};
	const verify = await verifyTypedData({
		address: gasLess.owner as any,
		domain,
		types: UPDATE_LIMIT,
		primaryType: "UpdateLimit",
		message: values,
		signature: gasLess.signature as any,
	});
	return verify;
};

export { verifySignatureUpdateLimit };
