import { REDIS_DB_NUMBER } from "../config";
import { MONGO_DB_NAME, MONGO_URI, NODE_ENV } from "./../config";
import { initRedis } from "./cache/redis";
import { ChartDataController } from "./chart_data/ChartDataController";
import { CopyTrigger } from "./copy_trigger/CopyTrigger";
import { connectMongo } from "./database/mongo/mongo";
import { initSentry } from "./logging/sentry";
import { ChainlinkPriceFeeder } from "./price_feed/IChainlinkPriceFeeder";
import { PythPriceFeeder } from "./price_feed/IPythPriceFeeder";
import {
	PublishPriceObserver,
	TriggerClosePriceObserver,
	TriggerLimitPriceObserver,
} from "./price_observer/PriceObservers";
import { PriceSubjectsController } from "./price_observer/PriceSubject";
import { PriceTrigger } from "./price_trigger/PriceTrigger";
import { connectionPyth } from "./pyth";
import { SystemStatus } from "./system_status/system_status.i";
import { TriggeredTradeController } from "./triggered_trade_controller/TriggeredTradeController";

let pair_controller: PriceSubjectsController;
let trigger_pair_controller: PriceSubjectsController;
let price_trigger: PriceTrigger;
let copy_trigger: CopyTrigger;
let chart_storage_controller: ChartDataController;
let triggered_trade_controller: TriggeredTradeController;
let system_status: SystemStatus;
const chainlink_price_feeder = new ChainlinkPriceFeeder();
const pyth_price_feeder = new PythPriceFeeder();

const connectInfra = async (service_name:'main'|'cron'='main') => {
	try {
		switch (service_name) {
			case "main":{
					await Promise.all([
						connectMongo(MONGO_URI, MONGO_DB_NAME),
						initSentry(),
						initRedis(REDIS_DB_NUMBER),
						connectionPyth(),
						// initTelegramBot(),
					]);
					
					system_status = new SystemStatus();
					const publish_sub_observer = new PublishPriceObserver();
					price_trigger = new PriceTrigger();
					triggered_trade_controller = new TriggeredTradeController();
					const trigger_limit_price_observer = new TriggerLimitPriceObserver(
						price_trigger,
						triggered_trade_controller,
					);
					const trigger_close_price_observer = new TriggerClosePriceObserver(
						price_trigger,
						triggered_trade_controller,
					);
					if (NODE_ENV !== "local") {
						copy_trigger = new CopyTrigger(triggered_trade_controller);
						pair_controller = new PriceSubjectsController("MarkPrice", [
							publish_sub_observer,
							trigger_close_price_observer,
						]);
						trigger_pair_controller = new PriceSubjectsController("Chainlink", [
							trigger_limit_price_observer,
						]);
						pair_controller.init();
						trigger_pair_controller.init();
					} else {
						pair_controller = new PriceSubjectsController("MarkPrice", [
							// publish_sub_observer,
						]);
						trigger_pair_controller = new PriceSubjectsController("Chainlink", []);
						pair_controller.init();
						trigger_pair_controller.init();
					}
					system_status.init();
					chart_storage_controller = new ChartDataController();
			}
			break;
			case "cron":{
				await Promise.all([
						connectMongo(MONGO_URI, MONGO_DB_NAME),
						initSentry(),
						initRedis(REDIS_DB_NUMBER),
					]);
			}
			default:
				break;
		}
		

	} catch (e) {
		throw e;
	}
};


export {
	connectInfra,
	pair_controller,
	price_trigger,
	copy_trigger,
	system_status,
	trigger_pair_controller,
	triggered_trade_controller,
	chart_storage_controller,
	chainlink_price_feeder,
	pyth_price_feeder,
};
