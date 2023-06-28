import { Address } from "viem";
import { create_key_with_prefix } from ".";
import { ioredis } from "./redis";

const getCurrentBlockNumberConsume = async (address: Address) => {
	const key = create_key_with_prefix(`current_block_consumed.${address}`);
	const value = await ioredis.get(key);
	return value ? BigInt(value) : null;
};

const setCurrentBlockNumberConsume = async (
	address: Address,
	block_number: bigint,
) => {
	const key = create_key_with_prefix(`current_block_consumed.${address}`);
	const value = await ioredis.set(key, block_number.toString());
	return value;
};

const delCurrentBlockNumberConsume = async (address: Address) => {
	const key = create_key_with_prefix(`current_block_consumed.${address}`);
	const value = await ioredis.del(key);
	return value;
};

export {
	getCurrentBlockNumberConsume,
	setCurrentBlockNumberConsume,
	delCurrentBlockNumberConsume,
};
