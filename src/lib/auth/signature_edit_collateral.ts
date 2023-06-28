import { verifyTypedData } from "viem";
import { EDIT_POSITION_CONTRACT_ADDRESS } from "../../config";
import { GasLessInputType } from "../../infra/blockchain/viem/types/type";
import { EditPositionType } from "../../server/apollo/input/editPosition";
import { GetDomain } from "./helper";
import { contractEditPosition } from "../../infra/blockchain/viem";
import { ERROR_CODE, ErrMsg } from "../error_handler";

const ADD_COLLATERAL = {
	AddCollateral: [
		{ name: "owner", type: "address" },
		{ name: "id", type: "bytes32" },
		{ name: "amount", type: "uint256" },
		{ name: "deadline", type: "uint256" },
		{ name: "nonce", type: "uint256" },
	],
};
const REMOVE_COLLATERAL = {
	RemoveCollateral: [
		{ name: "owner", type: "address" },
		{ name: "id", type: "bytes32" },
		{ name: "amount", type: "uint256" },
		{ name: "deadline", type: "uint256" },
		{ name: "nonce", type: "uint256" },
	],
};
const verifySignatureEditCollateralGasLess = async (
	id: string,
	amount: string,
	editType: EditPositionType,
	gasLess: GasLessInputType,
) => {
	const nonce = (await contractEditPosition.read.nonces([gasLess.owner])) as unknown as bigint;
	if(nonce !== BigInt(gasLess.nonce || 0)) throw ErrMsg(ERROR_CODE.INVALID_NONCE)
	const domain = GetDomain({
		verifyingContract: EDIT_POSITION_CONTRACT_ADDRESS,
	}) as any;
	const values = {
		owner: gasLess.owner,
		id,
		amount,
		deadline: gasLess.deadline,
		nonce: gasLess.nonce,
	};
	const types: any =
		editType === "ADD_COLLATERAL" ? ADD_COLLATERAL : REMOVE_COLLATERAL;
	const verify = await verifyTypedData({
		address: gasLess.owner as any,
		domain,
		types,
		primaryType:
			editType === "ADD_COLLATERAL" ? "AddCollateral" : "RemoveCollateral",
		message: values,
		signature: gasLess.signature as any,
	});
	return verify;
};

export { verifySignatureEditCollateralGasLess };
