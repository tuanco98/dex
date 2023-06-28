import { contractChainlink } from "../../..";

export const getPriceChainlink: (pairId: number) => Promise<bigint> = async (pairId) => {
	try {
		const price = (await contractChainlink.read.getPrice([pairId])) as unknown as bigint;
		return price;
	} catch (e) {
		console.log(e);
		return BigInt(-1);
	}
};
