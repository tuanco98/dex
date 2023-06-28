import Redis from "ioredis";
import { create_key_with_prefix } from ".";
import { REDIS_PREFIX, REDIS_URI } from "../../config";
import { successConsoleLog } from "../../lib/color-log";
export let ioredis: Redis;
export let pub_ioredis: Redis;
export let sub_ioredis: Redis;

export const initRedis = async (db_number = 0) => {
	ioredis = new Redis(REDIS_URI, {
		retryStrategy: (times) => {
			const delay = Math.min(times * 50, 2000);
			return delay;
		},
		db: db_number,
	});
	pub_ioredis = new Redis(REDIS_URI, {
		retryStrategy: (times) => {
			const delay = Math.min(times * 50, 2000);
			return delay;
		},
		db: db_number,
	});
	sub_ioredis = new Redis(REDIS_URI, {
		retryStrategy: (times) => {
			const delay = Math.min(times * 50, 2000);
			return delay;
		},
		db: db_number,
	});
	if (ioredis["connector"]["connecting"]) {
		successConsoleLog(`🚀 redis: connected`);
	}
};

export const get_redis_connection_status = () =>
	ioredis["connector"]["connecting"];

export const clearRedis = async (key: string) => {
	console.log(`*** Start clear all key start with ${REDIS_PREFIX}.${key}`);
	const match_key = `${create_key_with_prefix(key)}*`;
	const all_keys = await ioredis.keys(match_key);
	console.log(`=> found ${all_keys.length} matched`);
	if (all_keys.length) {
		const num = await ioredis.del(all_keys);
		console.log(`*** Deleted ${num}/${match_key.length} keys`);
	}
};
