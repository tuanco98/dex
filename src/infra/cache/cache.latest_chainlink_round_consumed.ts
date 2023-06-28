import { create_key_with_prefix } from ".";
import { ioredis } from "./redis";

const get = async (pair_id: number) => {
	const key = create_key_with_prefix(`latest_chainlink_round.${pair_id}`);
	const value = await ioredis.get(key);
	return value;
};

const set = async (pair_id: number, round_id: string) => {
	const key = create_key_with_prefix(`latest_chainlink_round.${pair_id}`);
	const value = await ioredis.set(key, round_id);
	return value;
};

export {
	get as getCacheLatestChainlinkRound,
	set as setCacheLatestChainlinkRound,
};
