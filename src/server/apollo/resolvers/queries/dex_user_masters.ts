import { Decimal128 } from "mongodb";
import { collections } from "../../../../infra/database/mongo/mongo";
import { request_validator } from "../../../../lib/validate";
import { handleTimeFilter } from "./dex_user_details";

type DataCopyPosition = {
	pairId: number;
	isLong: boolean;
	amount: Decimal128;
	leverage: number;
	entryPrice: Decimal128;
	fundingTracker: Decimal128;
};

type DataListCopier = {
	address: string;
	data_copy_position: DataCopyPosition[];
	percent_share: number;
	total_current_position: number;
	total_copy_position: number;
	max_amount_copy: string;
	collateral: string | number;
	stop_loss_copy: number;
	take_loss_copy: number;
};

export const dex_user_masters = async (_, args: any) => {
	try {
		const { page = 0, pageSize = 10, timeFilterBy = "All" } = args;
		const address = args.address.toLowerCase();
		request_validator.ValidateMissing(address);
		const getTime = handleTimeFilter(timeFilterBy);
		const aggregateUserCopier = [
			{
				$match: {
					lowerOwner: address,
					isActive: true,
					createAt: {
						$gte: getTime.from,
						$lte: getTime.to,
					},
				},
			},
			{
				$lookup: {
					from: "trades",
					localField: "lowerMaster",
					foreignField: "owner",
					pipeline: [
						{
							$match: {
								orderAt: {
									$gte: getTime.from,
									$lte: getTime.to,
								},
								isActive: true,
							},
						},
						{
							$count: "total",
						},
					],
					as: "result_current_pst",
				},
			},
			{
				$unwind: {
					path: "$result_current_pst",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: "trades",
					localField: "lowerMaster",
					foreignField: "masterAddress",
					pipeline: [
						{
							$match: {
								isActive: false,
								isCopy: true,
								orderAt: {
									$gte: getTime.from,
									$lte: getTime.to,
								},
								owner: address,
							},
						},
						{
							$group: {
								_id: null,
								totalPnlCopy: {
									$sum: "$pnl",
								},
							},
						},
						{
							$project: {
								_id: 0,
								totalPnlCopy: 1,
							},
						},
					],
					as: "result_total_pnl_trade_copy",
				},
			},
			{
				$unwind: {
					path: "$result_total_pnl_trade_copy",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: "trades",
					localField: "lowerMaster",
					foreignField: "masterAddress",
					pipeline: [
						{
							$match: {
								isCopy: true,
								orderAt: {
									$gte: getTime.from,
									$lte: getTime.to,
								},
								owner: address,
							},
						},
						{
							$count: "totalCopyPst",
						},
					],
					as: "result_total_copy_pst",
				},
			},
			{
				$unwind: {
					path: "$result_total_copy_pst",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					_id: 0,
					address: "$lowerMaster",
					signature: 1,
					max_amount_copy: "$maxAmount",
					fixed_amount: "$fixedAmount",
					percent_amount: "$percentAmount",
					stop_loss_copy: "$percentSl",
					take_profit_copy: "$percentTp",
					percent_share: {
						$divide: ["$sharePercent", 1e6],
					},
					total_current_position: {
						$ifNull: ["$result_current_pst.total", 0],
					},
					total_copy_position: {
						$ifNull: ["$result_total_copy_pst.totalCopyPst", 0],
					},
					total_pnl_copy_trade: {
						$ifNull: ["$result_total_pnl_trade_copy.totalPnlCopy", 0],
					},
				},
			},
			{
				$skip: page * pageSize,
			},
			{
				$limit: pageSize,
			},
		];
		const dataUserCopiers = (await collections.copy_proofs
			.aggregate(aggregateUserCopier)
			.toArray()) as DataListCopier[];
		const totalUserMaster = await collections.copy_proofs.countDocuments({
			lowerOwner: address,
			isActive: true,
			createAt: {
				$gte: getTime.from,
				$lte: getTime.to,
			},
		});
		const convertDataUserMaster = dataUserCopiers.map((dataCopier: any) => {
			return {
				...dataCopier,
				pnl: dataCopier.total_pnl_copy_trade.toString(),
			};
		});
		const resultDataUserMasters = {
			total: totalUserMaster,
			data: convertDataUserMaster,
		};
		return resultDataUserMasters;
	} catch (e) {
		throw e;
	}
};
