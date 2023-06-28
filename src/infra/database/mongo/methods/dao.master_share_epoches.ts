import { ClientSession, Decimal128 } from "mongodb";
import { lowerCase } from "../../../../lib/utils";
import {
	TMasterWithdrawEvent,
	TNewShareEvent,
} from "../../../blockchain/viem/contract/profit_share/event";
import { TMasterShareEpoch } from "../models/MasterShareEpoch";
import { collections } from "../mongo";
import { GetEpochEndTime } from "../../../system_status/share_epoc_time";
import { DAO } from ".";

const getDAO = () => ({
	common: collections.master_share_epoches,
	UpdateMasterShareEpoch: async (
		eventValue: TNewShareEvent,
		session?: ClientSession,
	) => {
		const { startTime, epochTime, startEpoch } =
			await DAO.current_epoch.getCurrentEpoch();
		const new_master_share_epoches: TMasterShareEpoch = {
			master: lowerCase(eventValue.master),
			epoch: new Decimal128(eventValue.epoch.toString()),
			totalMasterShare: new Decimal128(eventValue.totalMasterShare.toString()),
			createAt: GetEpochEndTime(
				Number(eventValue.epoch-1n),
				startTime,
				epochTime,
				startEpoch,
			),
			updateAt: new Date(),
			endAt: GetEpochEndTime(
				Number(eventValue.epoch),
				startTime,
				epochTime,
				startEpoch,
			),
		};
		await collections.master_share_epoches.updateOne(
			{
				master: new_master_share_epoches.master,
				epoch: new_master_share_epoches.epoch,
			},
			{
				$setOnInsert: {
					master: new_master_share_epoches.master,
					epoch: new_master_share_epoches.epoch,
					createAt: new_master_share_epoches.createAt,
				},
				$set: {
					totalMasterShare: new_master_share_epoches.totalMasterShare,
					updateAt: new_master_share_epoches.updateAt,
					endAt: new_master_share_epoches.endAt,
				},
			},
			{ upsert: true, session },
		);
	},
	UpdateWithdraw: async (
		eventValue: TMasterWithdrawEvent,
		txid: string | `0x${string}` | null,
		session?: ClientSession,
	) => {
		const { epoch, master } = eventValue;
		await collections.master_share_epoches.updateMany(
			{
				epoch: { $in: epoch.map((el) => new Decimal128(el.toString())) },
				master: lowerCase(master),
			},
			{
				$set: {
					isWithdraw: true,
					withdrawTxid: txid,
				},
			},
			{ session },
		);
	},
});

type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getMasterShareEpochDAO, DAOType as MasterShareEpochType };
