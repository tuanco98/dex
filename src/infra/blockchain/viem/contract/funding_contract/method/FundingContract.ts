import { contractFunding } from "../../..";

export const getFundingTracker: (pair_id: number) => Promise<bigint> = async (pair_id) => {
	return (await contractFunding.read.getFundingTracker([pair_id])) as unknown as bigint;
};
