import { IndexDescription } from "mongodb";

type TCopyRequest = {
	owner: string; //address of copier
	master: string; //address of master
	maxAmount: string; //max allowance amount for all copy trade
	fixedAmount: string | number; //=0 if follow percent
	percentAmount: number; //=0 if follow fixed
	sharePercent: number; //% profit share for aster
	percentTp: number; //=0 if copier want copy TP of master
	percentSl: number; //=0 if copier want copy SL of master
	signature: string;
};

type TCopyProof = TCopyRequest & {
	lowerOwner: string;
	lowerMaster: string;
	updateAt: Date;
	createAt: Date;
	isActive: boolean;
	signature: string;
};

const CopyProofIndexes: IndexDescription[] = [
	{
		key: { lowerOwner: 1, lowerMaster: 1 },
		partialFilterExpression: { isActive: true },
		unique: true,
		background: true,
	},
	{ key: { lowerOwner: 1 }, background: true },
	{ key: { lowerMaster: 1 }, background: true },
	{ key: { isActive: 1 }, background: true },
];

export { TCopyRequest, TCopyProof, CopyProofIndexes };
