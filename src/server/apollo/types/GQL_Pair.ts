import { GQL_Source } from "./GQL_Source";

type Type = Partial<{
	source: GQL_Source[];
	pair_id: number;
	pair_name: string;
	createAt: Date;
	max_leverage: number;
	min_leverage: number;
	price_24h: string;
}>;

export { Type as GQL_Pair };
