import { Decimal128, IndexDescription } from "mongodb";

type TMasterShareEpoch = {
	master: string;
	epoch: Decimal128;
	totalMasterShare: Decimal128;
	createAt: Date;
	updateAt: Date;
	isWithdraw?: boolean;
	withdrawTxid?: string | null;
	endAt: Date
};

const MasterShareEpochIndexes: IndexDescription[] = [
	{ key: { master: 1 }, background: true },
	{ key: { copier: 1 }, background: true },
];

export { TMasterShareEpoch, MasterShareEpochIndexes };
