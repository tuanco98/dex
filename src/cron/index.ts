import { CronJob } from "cron";
import { LIST_CONTRACT } from "../config";
import { cron_bots_balance_tracking } from "./cron.\bbots_balance_tracking";
import { cron_update_event } from "./cron.consume_event";
import { consume_price } from "./cron.consume_price";
import { cron_reward_commission } from "./cron.reward_commission";
import { cron_system_status_update as cron_update_system_status } from "./cron.system_status_update";
import { cron_update_commission } from "./cron.update_commission";
import { cron_update_funding_factor } from "./cron.update_funding_tracker";
import { cron_update_handle_trigger } from "./cron.update_handle_trigger";
import { cron_update_latest_block } from "./cron.update_latest_block";
import { cron_update_pool_balance } from "./cron.update_pool_balance";
import { sleep } from "../lib/utils";

const cronService = {
	blockChain: () => {
		cron_update_latest_block();
		cron_update_event(LIST_CONTRACT);
	},
	start_telegram_job: () => {},
	updatePrice: async () => {
		while (true) {
			await sleep(100);
			await consume_price();
		}
	},
	system: () => {
		cron_update_system_status();
		cron_update_handle_trigger();
		cron_update_funding_factor();
		cron_bots_balance_tracking();
		cron_reward_commission();
	},
	alone_job: () => {
		console.log(`cron_update_commission running`)
		cron_update_commission();
		console.log(`cron_update_pool_balance running`)
		cron_update_pool_balance();
	},
};

// rome-ignore lint/nursery/noBannedTypes: <explanation>
export const InitCron = (cron_time: string, call_back: Function) => {
	return new CronJob(
		cron_time,
		async () => {
			try {
				console.log(`Start ${call_back.name || "TestCron"}:`, new Date());
				await call_back();
			} catch (error) {
				console.log(`${call_back.name || "TestCron"}`, error);
			} finally {
				console.log(
					`${call_back.name || "TestCron"} running complete:`,
					new Date(),
				);
			}
		},
		null,
		true,
		"UTC",
	);
};

export { cronService };
