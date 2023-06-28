import { GasLessInputType } from "../../../infra/blockchain/viem/types/type";

type Input = {
	orderId: string;
	gasLess: GasLessInputType;
};

export { Input as ClosePosition };
