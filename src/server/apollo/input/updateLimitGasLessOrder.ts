import { GasLessInputType } from "../../../infra/blockchain/viem/types/type";

type Input = {
	orderId: string;
	tp: string;
	sl: string;
	gasLess: GasLessInputType;
};

export { Input as UpdateLimitGasLessOrder };
