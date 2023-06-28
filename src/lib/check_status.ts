import { NODE_ENV, PRIVATE_KEYS_BOT_TRIGGER_TRADING_CONTRACT } from "../config";
import { cronService } from "../cron";
import { connectInfra } from "../infra";
import { viemPublicClient } from "../infra/blockchain/viem";
import { createMongoIndex } from "../infra/database/mongo/mongo";
import { InitBotTrigger } from "../infra/queue_trigger/BotHandle";
import { initWorkerTriggerTransaction } from "../infra/queue_trigger/QueueTransaction";
import { initServer } from "../init";
import { startApolloServer } from "../server/apollo/apollo";
import { successConsoleLog } from "./color-log";
import { sleep } from "./utils";

let SERVER_READY = NODE_ENV !== "local" ? false : true;
export let CHAIN_ID: number;
export const SetServerReady = () => {
	if (!SERVER_READY) {
		console.log("Server ready!!!");
		SERVER_READY = true;
		console.log({ SERVER_READY });
	}
};

const RunServer = async (is_main = true) => {
	try {
		console.log({ is_main });
		console.log("========================");
		successConsoleLog("SERVER STARTING");
		await connectInfra();
		await initServer();
		if (!is_main) {
			successConsoleLog("🍴Run Fork Cluster Job ...");
		} else {
			successConsoleLog("👑 Run Main Cluster Job ...");
			if (NODE_ENV !== "local") {
				cronService.updatePrice();
				await Promise.all([
					cronService.blockChain(),
					cronService.system(),
					createMongoIndex(),
				]);
			} else {
				// cronService.blockChain()
				// cronService.updatePrice();
				// cronService.system();
			}
			console.log({ SERVER_READY });
			while (!SERVER_READY) {
				await sleep(1000);
				console.log({ SERVER_READY });
			}
			await InitBotTrigger(PRIVATE_KEYS_BOT_TRIGGER_TRADING_CONTRACT);
			CHAIN_ID = await viemPublicClient.getChainId();
			Promise.all([initWorkerTriggerTransaction(), startApolloServer()]);
		}
	} catch (e) {
		console.log(e);
		process.exit(1);
	}
};
// const IntervalCheckHealth = async () => {};
export const Main = async (first_run = true, is_main = true) => {
	try {
		first_run && RunServer(is_main);
		// !first_run && IntervalCheckHealth()
	} catch (e) {
		console.log(e);
	} finally {
		// setTimeout(() => Main(false, is_main), 60000)
	}
};
