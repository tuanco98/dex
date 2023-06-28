import { GasLessInputType } from "../../../infra/blockchain/viem/types/type";

type Input = {
	new_share_fee: number;
	gasLess: GasLessInputType;
};

export { Input as SetShareFeeInput };
