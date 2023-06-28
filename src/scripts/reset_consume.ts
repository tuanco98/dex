import {
	LIST_CONTRACT,
	MONGO_URI,
	REDIS_DB_NUMBER,
} from "../config";
import { reset_consume } from "../infra/blockchain/viem/consume/consume.reset";
import { initRedis } from "../infra/cache/redis";
import { connectMongo } from "../infra/database/mongo/mongo";

const script = async () => {
	await initRedis(REDIS_DB_NUMBER);
	await connectMongo(MONGO_URI);
	reset_consume(LIST_CONTRACT);
};

script();
