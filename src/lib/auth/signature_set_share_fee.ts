import { verifyTypedData } from "viem";
import { OPEN_POSITION_CONTRACT_ADDRESS } from "../../config";
import { GasLessInputType } from "../../infra/blockchain/viem/types/type";
import { GetDomain } from "./helper";

const SET_SHARE_FEE = {
	SetShareFee: [
		{ name: "owner", type: "address" },
		{ name: "newFee", type: "uint256" },
		{ name: "deadline", type: "uint256" },
	],
};
const verifySignatureSetShareFee = async (
	new_share_fee: number,
	gasLess: GasLessInputType,
) => {
	const domain: any = GetDomain({
		verifyingContract: OPEN_POSITION_CONTRACT_ADDRESS,
	});
	const values = {
		owner: gasLess.owner,
		newFee: new_share_fee,
		deadline: gasLess.deadline,
	};
	const verify = await verifyTypedData({
		address: gasLess.owner as any,
		domain,
		types: SET_SHARE_FEE,
		primaryType: "SetShareFee",
		message: values,
		signature: gasLess.signature as any,
	});
	return verify;
};

export { verifySignatureSetShareFee };
