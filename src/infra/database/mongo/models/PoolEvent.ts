import { Decimal128, IndexDescription } from "mongodb";

type TPoolEvent = {
	type: "Deposit" | "Withdraw";
	owner: string;
	amount: Decimal128;
	amountLp: Decimal128;
	txid: string;
	createAt: Date;
};

const PoolEventIndexes: IndexDescription[] = [
	{ key: { txid: 1 }, background: true },
	{ key: { type: 1 }, background: true },
	{ key: { owner: 1 }, background: true },
	{ key: { amount: 1 }, background: true },
	{ key: { amountLp: 1 }, background: true },
];

export { TPoolEvent, PoolEventIndexes };
