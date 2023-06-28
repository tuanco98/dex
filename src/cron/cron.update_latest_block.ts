import { AVG_BLOCK_TIME_SEC, NODE_ENV } from "../config";
import { viemPublicClient } from "../infra/blockchain/viem";
import {
	getLatestBlockNumber,
	setLatestBlockNumber,
} from "../infra/cache/cache.latest_block_number";
import { MILLISECOND_PER_ONE_SEC } from "../lib/constants";
import { ErrorHandler } from "../lib/error_handler";
let last_notification_update_block = 0;

const cron_update_latest_block = async (first_run = false) => {
	const args: any = [];
	args.push({ first_run });
	try {
		const latest_block = Number(await viemPublicClient.getBlockNumber());
		args.push({ latest_block });
		const latest_block_in_cache = await getLatestBlockNumber();
		args.push({ latest_block_in_cache });
		const is_latest_block_change = latest_block > (latest_block_in_cache || 0);
		args.push({ is_latest_block_change });
		if (is_latest_block_change) {
			await setLatestBlockNumber(latest_block);
			if (isLogging() || first_run) {
				console.log(
					`Latest block update from ${
						last_notification_update_block || latest_block_in_cache
					} -> ${latest_block}`,
				);
				last_notification_update_block = latest_block;
			}
		}
	} catch (e) {
		console.log(`cron_update_latest_block error: `, e);
		ErrorHandler(e, args, "cron_update_latest_block").throwErr();
	} finally {
		setTimeout(
			cron_update_latest_block,
			(AVG_BLOCK_TIME_SEC * MILLISECOND_PER_ONE_SEC) / 2,
		);
	}
};

export { cron_update_latest_block };

export const isLogging = (interval_minute = NODE_ENV === "dev" ? 2 : 10) => {
	return (
		new Date().getUTCSeconds() < 10 &&
		new Date().getUTCMinutes() % interval_minute === 0 &&
		new Date().getUTCSeconds() < AVG_BLOCK_TIME_SEC * 2
	);
};
