import { GasLessInputType } from "../../../infra/blockchain/viem/types/type";

type Input = {
	_id: string;
	gasLess: GasLessInputType;
};

export { Input as CancelLimitOrderInput };
