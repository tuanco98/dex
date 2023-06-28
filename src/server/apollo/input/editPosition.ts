import { GasLessInputType } from "../../../infra/blockchain/viem/types/type";

type EditPositionType =
	| "ADD_COLLATERAL"
	| "REMOVE_COLLATERAL"
	| "DEC_POSITION"
	| "INC_POSITION";
type Input = {
	id: string;
	editType: EditPositionType;
	amount: string;
	gasLess: GasLessInputType;
};

export { Input as EditPositionInput, EditPositionType };
