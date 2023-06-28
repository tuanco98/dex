import { Decimal128, IndexDescription } from "mongodb";
import { TTriggerTracker } from "./Trade";

type TPermit = {
	nonce: number;
	owner: string;
	spender: string;
	value: string;
	deadline: number;
	v: number;
	r: string;
	s: string;
};

type TOrderType = "MARKET" | "LIMIT" | "STOP";

type TOrderRequired = {
	owner: string;
	pairId: number;
	isLong: boolean;
	amount: Decimal128;
	leverage: number;
	sl: Decimal128;
	tp: Decimal128;
};

type TOrder = TOrderRequired & {
	orderType: TOrderType;

	//for gasless
	deadline?: number;
	nonce?: number;
	signature: string;

	//for server save
	orderId?: string;
	limitPrice?: Decimal128;
	limitExpire?: number;
	txId?: string;
	cancelTxId?: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	triggerLimitError?: any;
} & TTriggerTracker;

const OrderIndexes: IndexDescription[] = [
	{ key: { owner: 1 }, background: true },
	{ key: { pairId: 1 }, background: true },
	{ key: { isLong: 1 }, background: true },
	{ key: { orderType: 1 }, background: true },
	{ key: { deadline: 1 }, background: true },
];

export { TPermit, TOrder, TOrderRequired, TOrderType, OrderIndexes };
