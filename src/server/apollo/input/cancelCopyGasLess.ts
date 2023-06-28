import { GasLessInputType } from "../../../infra/blockchain/viem/types/type";

type Input = {
	master_address: string;
	sign: string;
	gasLess: GasLessInputType;
};

export { Input as CancelCopyGasLessInput };
