import {
	GasLessInputType,
	OrderInputType,
} from "../../../infra/blockchain/viem/types/type";

type Input = {
	order: OrderInputType;
	gas_less: GasLessInputType;
	limitPrice?: string;
	limitExpire?: number;
};

export { Input as CreateOrderGasLess };
