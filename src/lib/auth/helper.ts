import { CHAIN_ID } from "../check_status";

export const GetDomain = (params: {
	name?: string;
	version?: string;
	chainId?: string;
	verifyingContract: string;
}) => {
	if (!CHAIN_ID) throw new Error('do not connect RPC')
	return {
		name: params.name || "Smurfi",
		version: params.version || "1",
		chainId: params.chainId || CHAIN_ID,
		verifyingContract: params.verifyingContract,
	};
};
