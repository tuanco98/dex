import { MIN_BALANCE_BOT_ACCEPT_TRIGGER } from "../config";
import { BatchEthBalances } from "../infra/blockchain/viem/contract/batch_call_contract/method/BatchCallContract";
import {
	BOTS_TRIGGER,
	UpdateBalanceBots
} from "../infra/queue_trigger/BotHandle";
import { queueTransaction } from "../infra/queue_trigger/QueueTransaction";
import { isGreaterOrEqual } from "./../lib/utils";

export const cron_bots_balance_tracking = async () => {
	try {
		const bot_addresses = BOTS_TRIGGER.map((el) => el.accountInfo.address);
		const balances = await BatchEthBalances(bot_addresses);
		const one_of_all_ready = balances.some((balance) =>
			isGreaterOrEqual(balance, MIN_BALANCE_BOT_ACCEPT_TRIGGER),
		);
		if (!one_of_all_ready) {
			const is_pause = await queueTransaction.isPaused();
			if (!is_pause) {
				await queueTransaction.pause();
			}
		} else {
			const is_pause = await queueTransaction.isPaused();
			if (is_pause) {
				await queueTransaction.resume();
			}
		}
		UpdateBalanceBots(balances);
	} catch (e) {
		throw e;
	} finally {
		setTimeout(cron_bots_balance_tracking, 1000);
	}
};
