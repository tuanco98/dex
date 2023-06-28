import { Decimal128, IndexDescription } from "mongodb";
import { EFeeTypeType } from "../../../blockchain/viem/contract/pool_contract/event";

type TFeeEvent = {
	id: string; //TradeId
	fee: Decimal128;
	oracle: Decimal128;
	createAt: Date;
	txid: string;
	feeType: EFeeTypeType;
	is_open_position_event: boolean;
	is_mapping: boolean;
	try_mapping_times: number;
};

const FeePaidEventIndexes: IndexDescription[] = [
	{ key: { id: 1 }, background: true },
	{ key: { fee: 1 }, background: true },
	{ key: { oracle: 1 }, background: true },
	{ key: { createAt: 1 }, background: true },
	{ key: { is_open_position_event: 1, is_mapping: 1 }, background: true },
	{ key: { try_mapping_times: 1 }, background: true },
];

export { TFeeEvent, FeePaidEventIndexes };
