import { TOrderType } from "../../../database/mongo/models/Order";
type OrderLimitInputType = {
	owner: string;
	isLong: boolean;
	orderType: number;
	pairId: number;
	leverage: number;
	expire: number;
	amount: string;
	limitPrice: string;
	tp: string;
	sl: string;
	signature: string;
};
type OrderInputType = {
	isLong: boolean;
	pairId: number;
	orderType: TOrderType;
	leverage: number;
	amount: string;
	tp: string;
	sl: string;
};
type GasLessInputType = {
	owner: string;
	deadline?: number;
	nonce?: number;
	signature: string;
};
export { OrderInputType, OrderLimitInputType, GasLessInputType };
