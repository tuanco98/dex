import { REDIS_PREFIX } from "../../config";
import { ioredis } from "./redis";

export const create_key_with_prefix = (key: string) => `${REDIS_PREFIX}.${key}`;
export const ClearRedis = (key: string) => {
	console.log(`Start cleaning key start with ${REDIS_PREFIX}.${key}`);
	const stream = ioredis.scanStream({
		match: `${REDIS_PREFIX}.${key}*`,
	});
	stream.on("data", (keys) => {
		if (keys.length) {
			const pipeline = ioredis.pipeline();
			keys.forEach((key) => {
				pipeline.del(key);
			});
			return pipeline.exec();
		}
		console.log("data", keys);
		stream.pause();
		console.log(`Stop key start with ${REDIS_PREFIX}.${key}`);
	});
};
