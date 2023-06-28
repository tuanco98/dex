import { DAO } from "../../../../infra/database/mongo/methods";
import { GetCurrentEpoch } from "../../../../infra/system_status/share_epoc_time";
import { ErrorHandler } from "../../../../lib/error_handler";
import { lowerCase } from "../../../../lib/utils";

/**
 * dex_user_available_epochs_withdraw
 * @param parent
 * @param {LoginInput} args
 * @param ctx
 * @return {string}
 */

export const dex_user_available_epochs_withdraw = async (_, args: any) => {
	try {
		const { address } = args as { address: string };
		const { startTime, epochTime, startEpoch} = await DAO.current_epoch.getCurrentEpoch()
		const currentEpoch = GetCurrentEpoch(startTime, epochTime, startEpoch);
		const matchStage = {
			$match: {
				master: lowerCase(address),
				isWithdraw: { $exists: false },
				epoch: { $lt: currentEpoch },
				totalMasterShare: { $gt: 0 },
			},
		};
		const groupStage = {
			$group: {
				_id: "$epoch",
				totalMasterShare: {
					$last: "$totalMasterShare",
				},
			},
		};
		const groupStage2 = {
			$group: {
				_id: null,
				available_withdraw_stages: { $push: "$_id" },
			},
		};
		const available_withdraws = (await DAO.master_share_epoches.common
			.aggregate([matchStage, groupStage, groupStage2])
			.toArray()) as [{ available_withdraw_stages: number[] }];
		if (available_withdraws[0])
			return available_withdraws[0].available_withdraw_stages.map(el => Number(el));
		return [];
	} catch (e) {
		ErrorHandler(e, args, dex_user_available_epochs_withdraw.name).throwErr();
	}
};
