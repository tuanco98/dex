import { verifyTypedData } from "viem";
import { EDIT_POSITION_CONTRACT_ADDRESS } from "../../config";
import { GasLessInputType } from "../../infra/blockchain/viem/types/type";
import { EditPositionType } from "../../server/apollo/input/editPosition";
import { GetDomain } from "./helper";
import { contractEditPosition } from "../../infra/blockchain/viem";
import { ERROR_CODE, ErrMsg } from "../error_handler";

const INC_POSITION = {
	IncreasePosition: [
		{ name: "owner", type: "address" },
		{ name: "id", type: "bytes32" },
		{ name: "amount", type: "uint256" },
		{ name: "deadline", type: "uint256" },
		{ name: "nonce", type: "uint256" },
	],
};
const DEC_POSITION = {
	DecreasePosition: [
		{ name: "owner", type: "address" },
		{ name: "id", type: "bytes32" },
		{ name: "amount", type: "uint256" },
		{ name: "deadline", type: "uint256" },
		{ name: "nonce", type: "uint256" },
	],
};
const verifySignatureEditPositionSizeGasLess = async (
	id: string,
	amount: string,
	editType: EditPositionType,
	gasLess: GasLessInputType,
) => {
	const nonce = (await contractEditPosition.read.nonces([gasLess.owner])) as unknown as bigint;
	if(nonce !== BigInt(gasLess.nonce || 0)) throw ErrMsg(ERROR_CODE.INVALID_NONCE)
	const domain: any = GetDomain({
		verifyingContract: EDIT_POSITION_CONTRACT_ADDRESS,
	});
	const values = {
		owner: gasLess.owner,
		id,
		amount,
		deadline: gasLess.deadline,
		nonce: gasLess.nonce,
	};
	const types: any = editType === "DEC_POSITION" ? DEC_POSITION : INC_POSITION;
	const verify = await verifyTypedData({
		address: gasLess.owner as any,
		domain,
		types,
		primaryType:
			editType === "DEC_POSITION" ? "DecreasePosition" : "IncreasePosition",
		message: values,
		signature: gasLess.signature as any,
	});
	return verify;
};

export { verifySignatureEditPositionSizeGasLess };
