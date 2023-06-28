import { verifyTypedData } from "viem";
import { OPEN_POSITION_CONTRACT_ADDRESS } from "../../config";
import { TCopyRequest } from "../../infra/database/mongo/models/CopyProof";
import { GetDomain } from "./helper";

const COPY_REQUEST = {
	CopyRequest: [
		{ name: "owner", type: "address" },
		{ name: "master", type: "address" },
		{ name: "maxAmount", type: "uint256" },
		{ name: "sharePercent", type: "uint32" },
		{ name: "fixedAmount", type: "uint256" },
		{ name: "percentAmount", type: "uint32" },
		{ name: "percentTp", type: "uint32" },
		{ name: "percentSl", type: "uint32" },
	],
};
const verifySignatureCopyRequest = async (copy_request: TCopyRequest) => {
	const {
		owner,
		master,
		maxAmount,
		sharePercent,
		fixedAmount,
		percentAmount,
		percentTp,
		percentSl,
	} = copy_request;
	const domain: any = GetDomain({
		verifyingContract: OPEN_POSITION_CONTRACT_ADDRESS,
	});
	const values = {
		owner,
		master,
		maxAmount,
		sharePercent,
		fixedAmount,
		percentAmount,
		percentTp,
		percentSl,
	};
	const verify = await verifyTypedData({
		address: copy_request.owner as any,
		domain,
		types: COPY_REQUEST,
		primaryType: "CopyRequest",
		message: values,
		signature: copy_request.signature as any,
	});
	return verify;
};

export { verifySignatureCopyRequest };
