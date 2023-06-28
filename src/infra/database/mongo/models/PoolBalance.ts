import { Decimal128, IndexDescription } from "mongodb";

export type TPoolBalance = {
	value: Decimal128;
	createAt: Date;
};

export const PoolBalanceIndexes: IndexDescription[] = [
	{ key: { createAt: 1 }, background: true },
];
