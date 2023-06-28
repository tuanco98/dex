import { Decimal128, IndexDescription } from "mongodb";
import { TPermit } from "./Order";

type TUser = {
	address: string;
	permit?: TPermit;
	sponsor?: string;
	unclaim_commission: Decimal128;
	pending_ref?: string;
	ref_code?: string;
	createAt: Date;
	updateAt: Date;
	copy_share_fee: number;
	set_copy_share_signature?: string;
};

const UserIndexes: IndexDescription[] = [
	{ key: { address: 1 }, unique: true, background: true },
	{ key: { pending_ref: 1 }, background: true },
	{ key: { ref_code: 1 }, background: true },
];

export { TUser, UserIndexes };
