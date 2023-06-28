import { TOrder } from "../database/mongo/models/Order";
interface IPriceTrigger {
	Limit: (order: TOrder) => Promise<string>;
	Stop: (order_id: string, pair_id: number) => Promise<string>;
	TakeProfit: (order_id: string, pair_id: number) => Promise<string>;
	StopLoss: (order_id: string, pair_id: number) => Promise<string>;
	Liquidation: (
		order_ids: string[],
		pair_ids: number[],
		prices: number[],
	) => Promise<string>;
}

export { IPriceTrigger };
