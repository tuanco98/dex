import { getBalanceToken } from "../../../../infra/blockchain/viem/viem.helper";
import { collections } from "../../../../infra/database/mongo/mongo";
import { timeSystem } from "../../../../lib/time_sys";
import { request_validator } from "../../../../lib/validate";
import { DAO } from "../../../../infra/database/mongo/methods";
import { Decimal128 } from "mongodb";
import { GetAuthorization, VerifyAuthorization } from "../../helper";
import { EtimeFilterBy } from "../../input/activityInput";

export const handleTimeFilter = (timeFilter: EtimeFilterBy) => {
	const dataTime: { from?: Date; to: Date } = { to: new Date() };
	switch (timeFilter) {
		case "D7":
			dataTime.from = timeSystem.getDateInFuture(dataTime.to, { days: -7 });
			break;
		case "D30":
			dataTime.from = timeSystem.getDateInFuture(dataTime.to, { days: -30 });
			break;
		default:
			dataTime.from = new Date(0);
			break;
	}
	return dataTime as { from: Date; to: Date };
};

const handlerRankRoi = (dataRoi: any, address: string) => {
	let rank_roi: number | null = null;
	dataRoi.forEach((data, index) => {
		if (data.address === address) rank_roi = index + 1;
		return;
	});
	return rank_roi;
}

type DataUserDetails = {
	address: string;
	createAt: Date;
	profit_sharing: number;
	copiers: number;
	pnl: Decimal128;
	roi: Decimal128;
	total_trades: number;
	win_rate: number;
	total_pnl_copiers: Decimal128;
};

export const dex_user_details = async (_, args: any, ctx: any) => {
	try {
		const { timeFilterBy = "All" } = args;
		const address = args.address.toLowerCase();
		request_validator.ValidateMissing(address);
		const authorization = GetAuthorization(ctx);
		const user_address = await VerifyAuthorization(authorization);
		let signature: string | null = null;
		if (user_address && address !== user_address.address) {
			const dataCopy = await collections.copy_proofs.findOne(
				{
					lowerMaster: address,
					lowerOwner: user_address.address,
					isActive: true,
				},
				{ projection: { _id: 0, signature: 1 } },
			);
			signature = !dataCopy ? signature : dataCopy.signature;
		}
		const getTime = handleTimeFilter(timeFilterBy);
		const getUserDetails = (await DAO.users.GetUserDetails({
			from: getTime.from,
			to: getTime.to,
			address,
		})) as DataUserDetails;
		const total_balance = await getBalanceToken(address);
		const currentTimeTrade = await collections.trades.findOne(
			{
				owner: address,
			},
			{ sort: { _id: -1 } },
		);
		const lastTimeTrade = await collections.trades.findOne(
			{
				owner: address,
			},
			{ sort: { _id: 1 } },
		);
		const last_trade_at = currentTimeTrade?.orderAt || new Date()
		const first_trade_at = lastTimeTrade?.orderAt || new Date()
		const trade_days = Math.round((last_trade_at.getTime() - first_trade_at.getTime()) / 86400000)
		const dataRoi = await DAO.trades.GetDataRoi();
		const rank_roi = handlerRankRoi(dataRoi, address)
		const resultDataPerformance = {
			...getUserDetails,
			pnl: getUserDetails.pnl.toString(),
			roi: getUserDetails.roi.toString(),
			copiers_pnl: getUserDetails.total_pnl_copiers.toString(),
			signature,
			total_balance,
			trade_days,
			last_trade_at: currentTimeTrade?.orderAt,
			rank_roi,
		};
		return resultDataPerformance;
	} catch (e) {
		throw e;
	}
};
