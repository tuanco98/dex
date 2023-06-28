import { IndexDescription } from "mongodb";

type TSource = "CHAINLINK" | "PYTH";

type TPairPrice = {
	pair_id: number;
	timestamp: Date;
	source: TSource;
	price: number;
	chainlink_price: number | null;
	pyth_price: number | null;
};

const PairPriceIndexes: IndexDescription[] = [
	{ key: { pair_id: 1 }, background: true },
	{ key: { timestamp: 1 }, background: true },
	{ key: { price: 1 }, background: true },
	{ key: { source: 1 }, background: true },
];

export { TPairPrice, PairPriceIndexes };
