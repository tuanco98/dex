import { PriceFeed } from "@pythnetwork/pyth-evm-js";
import { DAO } from "../database/mongo/methods";
import { TSourcePair } from "../database/mongo/models/Pair";
import { collections } from "../database/mongo/mongo";
import { pyth } from "../pyth";
import { IPriceFeeder } from "./IPriceFeeder";

interface IPythPriceFeeder extends IPriceFeeder {
	SubPrice: (pair_id: number) => void;
	GetCurrentPrices: (pair_ids: number[]) => Promise<number[] | null>;
}

class PythPriceFeeder implements IPythPriceFeeder {
	GetCurrentPrices: (pair_ids: number[]) => Promise<number[] | null> = async (
		pair_ids,
	) => {
		const getDataPair = await collections.pairs
			.find({ pair_id: { $in: pair_ids } })
			.sort({ pair_id: 1 })
			.toArray();
		if (getDataPair.length === 0) return null;
		const getDataPairId: string[] = [];
		for (const dataPair of getDataPair) {
			const { source } = dataPair;
			source.forEach((dataSource: TSourcePair) => {
				if (dataSource.name === "Pyth")
					return getDataPairId.push(dataSource.value);
			});
		}
		const latestPriceFeed = await pyth.getLatestPriceFeeds(getDataPairId);
		if (!latestPriceFeed) return null;
		const resultPrices = latestPriceFeed.map((dataPriceFeed: PriceFeed) => {
			const getPrice = dataPriceFeed.getPriceNoOlderThan(60);
			// rome-ignore lint/style/noNonNullAssertion: <explanation>
			const calculatePrice = Number(getPrice!.price) * 10 ** getPrice!.expo;

			// const calculatePrice = BigInt(getPrice!.price) * 10 ** dataPrice!.expo;
			return parseFloat(calculatePrice.toString());
		});
		return resultPrices;
	};
	GetCurrentPrice: (pair_id: number) => Promise<number | null> = async (
		pair_id,
	) => {
		//Find pyth id from db by pair_id
		const dataPair = await DAO.pairs.get_pair_by_id(pair_id);
		if (!dataPair) return null;
		//Fetch API to get price
		const getPriceId: string[] = [];
		dataPair.source.forEach((dataSource: TSourcePair) => {
			if (dataSource.name === "Pyth") return getPriceId.push(dataSource.value);
		});
		const latestPriceFeed = await pyth.getLatestPriceFeeds(getPriceId);
		if (!latestPriceFeed) return null;
		const dataPrice = latestPriceFeed[0].getPriceNoOlderThan(60);
		if (dataPrice !== undefined) {
			const calculatePrice = Number(dataPrice.price) * 10 ** dataPrice.expo;
			const resultPrice = parseFloat(calculatePrice.toString());
			return resultPrice;
		} else {
			return null;
		}
	};
	GetPastPrice: (pair_id: number, timestamp: number) => Promise<number> =
		async (
			// pair_id, timestamp
		) => {
			//Find pyth id from db by pair_id

			//Fetch API to get price by pair_id and timestamp in past
			return 1 as any;
		};
	SubPrice: (pair_id: number) => void = async (pair_id) => {
		//Find pyth id from db by pair_id
		const dataPair = await DAO.pairs.get_pair_by_id(pair_id);
		if (!dataPair) return;
		const getPriceId: string[] = [];
		dataPair.source.forEach((dataSource: TSourcePair) => {
			if (dataSource.name === "Pyth") return getPriceId.push(dataSource.value);
		});
		pyth.subscribePriceFeedUpdates(getPriceId, (priceFeed) => {
			const dataPrice = priceFeed.getPriceNoOlderThan(60);
			// rome-ignore lint/style/noNonNullAssertion: <explanation>
			const calculatePrice = Number(dataPrice!.price) * 10 ** dataPrice!.expo;
			const resultPrice = parseFloat(calculatePrice.toString());
			return resultPrice;
		});
		//Subs to get price
	};
}
export { PythPriceFeeder };
