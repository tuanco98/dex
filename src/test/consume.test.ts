import { EDIT_POSITION_CONTRACT_ADDRESS } from "../config";
import { cron_update_event } from "../cron/cron.consume_event";
import { cron_update_latest_block } from "../cron/cron.update_latest_block";
import { connectInfra } from "../infra";

const test = async () => {
	await connectInfra("cron");
	cron_update_latest_block();
	cron_update_event([EDIT_POSITION_CONTRACT_ADDRESS]);
};

test();
