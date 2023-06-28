import { create_key_with_prefix } from ".";
import { ioredis } from "./redis";

const get = async (pair_id: number) => {
	const key = create_key_with_prefix(`latest_time_consumed.${pair_id}`);
	const value = await ioredis.get(key);
	return value ? (JSON.parse(value) as number) : null;
};

const set = async (pair_id: number, latest_consumed_time: Date) => {
	const key = create_key_with_prefix(`latest_time_consumed.${pair_id}`);
	const value = await ioredis.set(key, latest_consumed_time.getTime());
	return value;
};

export { get as getLatestTimeConsumed, set as setLatestTimeConsumed };
