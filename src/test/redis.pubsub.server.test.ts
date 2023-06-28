import { connectInfra } from "../infra";
import { ioredis } from "../infra/cache/redis";

const test = async () => {
	await connectInfra("cron");
	await ioredis.publish("test", "hello");
};

test();
