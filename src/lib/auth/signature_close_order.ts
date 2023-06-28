import { verifyTypedData } from "viem";
import { GasLessInputType } from "../../infra/blockchain/viem/types/type";
import { PROCESSOR_CONTRACT_ADDRESS } from "./../../config";
import { GetDomain } from "./helper";

const CLOSE_POSITION = {
	ClosePosition: [
		{ name: "owner", type: "address" },
		{ name: "id", type: "bytes32" },
		{ name: "deadline", type: "uint256" },
	],
};
const verifySignatureClosePositionGasLess = async (
	id: string,
	gasLess: GasLessInputType,
) => {
	const domain = GetDomain({
		verifyingContract: PROCESSOR_CONTRACT_ADDRESS,
	}) as any;
	const values = {
		owner: gasLess.owner,
		id,
		deadline: gasLess.deadline,
	};
	const verify = await verifyTypedData({
		address: gasLess.owner as any,
		domain,
		types: CLOSE_POSITION,
		primaryType: "ClosePosition",
		message: values,
		signature: gasLess.signature as any,
	});
	return verify;
};
export { verifySignatureClosePositionGasLess };
