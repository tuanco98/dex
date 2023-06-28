import { GasLessInputType } from "../../../infra/blockchain/viem/types/type";

type Input = {
	epochs: number[];
	gasLess: GasLessInputType;
};

export { Input as WithdrawEpochGasLessInput };
