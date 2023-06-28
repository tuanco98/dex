import { IndexDescription } from "mongodb";
type ESourcePair = "Pyth" | "Chainlink";

type TSourcePair = {
	name: ESourcePair;
	value: string;
};
type TPair = {
	pair_id: number;
	pair_name: string;
	createAt: Date;
	source: TSourcePair[];
	max_leverage: number;
	min_leverage: number;
	openFee?: string;
	closeFee?: string;
	spread?: string;
	fundingTracker: number;
	liqThreshold?: string;
	last_update_txid?: string;
	minAge?: number;
	updateAt: Date;
};

const PairIndexes: IndexDescription[] = [
	{ key: { pair_id: 1 }, unique: true, background: true },
];

export { TPair, PairIndexes, ESourcePair, TSourcePair };
