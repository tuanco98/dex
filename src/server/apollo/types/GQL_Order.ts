type Type = Partial<{
	id: string;
	owner: string;
	pairId: number;
	isLong: boolean;
	amount: string;
	leverage: number;
	sl: string;
	tp: string;
	limitPrice: string;
	limitExpire: string;
	isActive: boolean;
	orderAt: Date;
	pnl: string;
	entryPrice: string;
	orderType: string;
	liquidationPrice: string;
}>;

export { Type as GQL_Order };
