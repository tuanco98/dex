import { collections } from "../../../../infra/database/mongo/mongo";
import { request_validator } from "../../../../lib/validate";
import { handleTimeFilter } from "./dex_user_details";

export const dex_user_copiers = async (_, args: any) => {
	try {
		const { page = 0, pageSize = 10, timeFilterBy = "All" } = args;
		const address = args.address.toLowerCase();
		request_validator.ValidateMissing(address);
		const getTime = handleTimeFilter(timeFilterBy);
		const aggregateUserCopier = [
			{
				$match: {
					lowerMaster: address,
					isActive: true,
					updateAt: {
						$gte: getTime.from,
						$lte: getTime.to,
					},
				},
			},
			{
				$lookup: {
					from: "trades",
					localField: "lowerOwner",
					foreignField: "owner",
					pipeline: [
						{
							$match: {
								updateAt: {
									$gte: getTime.from,
									$lte: getTime.to,
								},
								isActive: false,
								isCopy: true,
								masterAddress: address,
							},
						},
						{
							$group: {
								_id: "$owner",
								pnl: {
									$sum: "$pnl",
								},
								total_collateral: {
									$sum: "$amount",
								},
							},
						},
						{
							$project: {
								_id: 0,
								pnl: 1,
								roi: {
									$round: [
										{
											$multiply: [
												{
													$divide: ["$pnl", "$total_collateral"],
												},
												100,
											],
										},
										2,
									],
								},
							},
						},
					],
					as: "data_trade",
				},
			},
			{
				$unwind: {
					path: "$data_trade",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					_id: 0,
					address: "$lowerOwner",
					total_pnl_copier: {
						$cond: [
							{
								$eq: [
									{
										$ifNull: ["$data_trade", 0],
									},
									0,
								],
							},
							0,
							"$data_trade.pnl",
						],
					},
					roi_copier: {
						$cond: [
							{
								$eq: [
									{
										$ifNull: ["$data_trade", 0],
									},
									0,
								],
							},
							0,
							"$data_trade.roi",
						],
					},
					updateAt: 1,
				},
			},
			{
				$skip: page * pageSize,
			},
			{
				$limit: pageSize,
			},
		];
		const dataUserCopier = await collections.copy_proofs
			.aggregate(aggregateUserCopier)
			.toArray();
		const totalUserCopier = await collections.copy_proofs.countDocuments({
			lowerMaster: address,
			isActive: true,
		});
		const convertDataUserMaster = dataUserCopier.map((data) => {
			const total_days_followed = Math.round(
				(new Date().getTime() - data.updateAt.getTime()) / 86400000,
			);
			return {
				...data,
				pnl: data.total_pnl_copier.toString(),
				roi: data.roi_copier.toString(),
				total_days_followed,
			};
		});
		const resultDataUserCopiers = {
			total: totalUserCopier,
			data: convertDataUserMaster,
		};
		return resultDataUserCopiers;
	} catch (e) {
		throw e;
	}
};
