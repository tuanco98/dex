import { Decimal128, IndexDescription } from "mongodb";

type TRequestCommission = {
	address: string;
	createAt: Date;
	updateAt: Date;
	requestAmount: Decimal128;
	remainAmount?: Decimal128;
	txid?: string;
	error?: string;
};

const RequestCommissionIndexes: IndexDescription[] = [
	{ key: { address: 1 }, background: true },
	{ key: { txid: 1 }, background: true, sparse: true },
	{ key: { error: 1 }, background: true, sparse: true },
	{ key: { createAt: 1 }, background: true },
];

export { TRequestCommission, RequestCommissionIndexes };
