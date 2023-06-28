import { InitCron } from ".";
import { system_status } from "../infra";
import { TFundingUpdatedEvent } from "../infra/blockchain/viem/contract/funding_contract/event";
import { getFundingTracker } from "../infra/blockchain/viem/contract/funding_contract/method/FundingContract";
import { DAO } from "../infra/database/mongo/methods";
import { ErrorHandler } from "../lib/error_handler";

const handle_update_funding_factor = async () => {
	try {
		const pairs = system_status.getAllPair();
		for (const pair of pairs) {
			const funding_tracker = await getFundingTracker(
				pair.pair_id,
			);
			const local_pair = system_status.getPair(pair.pair_id);
			console.log(
				`Pair ${pair.pair_id} funding tracker update from ${local_pair?.fundingTracker} to ${funding_tracker}`,
			);
			if (local_pair && local_pair.fundingTracker !== Number(funding_tracker)) {
				const funding_tracker_updated_event_fake: TFundingUpdatedEvent = {
					pairId: pair.pair_id,
					fundingTracker: Number(funding_tracker),
					fundingIncrement: 0,
				};

				await DAO.pairs.updateFundingTracker(
					funding_tracker_updated_event_fake,
					"AutoUpdate",
				);
				await DAO.trades.UpdateAllLiquidationPrice(
					funding_tracker_updated_event_fake,
				);
			}
		}
	} catch (error) {
		ErrorHandler(error, {}, cron_update_funding_factor.name);
	}
};

export const cron_update_funding_factor = () =>
	InitCron("*/5 * * * *", handle_update_funding_factor);
