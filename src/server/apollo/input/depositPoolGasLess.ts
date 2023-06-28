import { GasLessInputType } from "../../../infra/blockchain/viem/types/type";

type Input = {
	amount: string;
	gasLess: GasLessInputType;
};

export { Input as DepositPoolGasLessInput };
