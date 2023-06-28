import { create_key_with_prefix } from ".";
import { ioredis } from "./redis";

const getLatestBlockNumber = async () => {
	const key = create_key_with_prefix(`latest_block`);
	const value = await ioredis.get(key);
	return value ? BigInt(value) : null;
};

const setLatestBlockNumber = async (block_number: number) => {
	const key = create_key_with_prefix(`latest_block`);
	const value = await ioredis.set(key, block_number);
	return value;
};

export { getLatestBlockNumber, setLatestBlockNumber };
