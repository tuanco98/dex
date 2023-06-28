import { ClientSession, Decimal128, Filter } from "mongodb";
import {
	BPS,
	POOL_CONTRACT_ADDRESS,
	SYSTEM_REF_PROFIT_SHARE_RATE,
} from "../../../../config";
import { MILLISECOND_PER_ONE_SEC } from "../../../../lib/constants";
import { ErrMsg, ERROR_CODE } from "../../../../lib/error_handler";
import { lowerCase } from "../../../../lib/utils";
import { TPermit } from "../models/Order";
import { TUser } from "../models/User";
import { collections } from "../mongo";
const common = () => collections.users;
const getMany = async (
	query: Filter<TUser>,
	page: number,
	pageSize: number,
	skip_get_total = false,
	session?: ClientSession,
) => {
	if (!skip_get_total) {
		const [data, total] = await Promise.all([
			collections.users
				.find(query, { session })
				.skip(page * pageSize)
				.limit(pageSize)
				.toArray(),
			collections.users.countDocuments(query, { session }),
		]);
		return {
			data,
			total,
		};
	} else {
		const data = await collections.users
			.find(query, { session })
			.skip(page * pageSize)
			.limit(pageSize)
			.toArray();
		return {
			data,
		};
	}
};
const GetCommission = (fee: Decimal128): Decimal128 => {
	return new Decimal128(
		((BigInt(fee.toString()) * SYSTEM_REF_PROFIT_SHARE_RATE) / BPS).toString(),
	);
};

const GetNewUser = (address: string) => {
	const new_user: TUser = {
		address: address.toLocaleLowerCase(),
		createAt: new Date(),
		updateAt: new Date(),
		unclaim_commission: new Decimal128("0"),
		copy_share_fee: 0,
	};
	return new_user;
};
const getDAO = () => ({
	common: common(),
	getMany,
	UserLogin: async (address: string, session?: ClientSession) => {
		await collections.users.updateOne(
			{ address },
			{
				$setOnInsert: GetNewUser(address),
			},
			{ session, upsert: true },
		);
	},
	GetUserByAddress: async (address: string, session?: ClientSession) => {
		const user_info = await collections.users.findOneAndUpdate(
			{ address },
			{
				$setOnInsert: GetNewUser(address),
			},
			{ upsert: true, session, returnDocument: "after" },
		);
		if (!user_info.value) throw ErrMsg(ERROR_CODE.USER_NOT_FOUND);
		return user_info.value;
	},
	GetUser: async (address: string, session?: ClientSession) => {
		return collections.users.findOne(
			{ address: address.toLowerCase() },
			{ session },
		);
	},
	GetUserByRefCode: async (ref_code: string, session?: ClientSession) => {
		const user_info = await collections.users.findOne(
			{ ref_code: { $regex: ref_code, $options: "i" } },
			{ session },
		);
		return user_info;
	},
	GetUserDetails: async (
		options: { from: Date; to: Date; address: string },
		session?: ClientSession,
	) => {
		const { address, from, to } = options;
		const aggregateUserDetails = [
			{
				$match: {
					address: address,
				},
			},
			{
				$lookup: {
					from: "copy_proofs",
					localField: "address",
					foreignField: "lowerMaster",
					pipeline: [
						{
							$match: {
								isActive: true,
							},
						},
						{
							$count: "total",
						},
					],
					as: "result_total_copiers",
				},
			},
			{
				$unwind: {
					path: "$result_total_copiers",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: "trades",
					localField: "address",
					foreignField: "owner",
					pipeline: [
						{
							$match: {
								updateAt: {
									$gte: from,
									$lte: to,
								},
								isActive: false,
								closeTx: {
									$exists: true,
								},
							},
						},
						{
							$group: {
								_id: "$owner",
								pnl: {
									$sum: "$pnl",
								},
								win: {
									$sum: {
										$cond: [
											{
												$gt: ["$pnl", 0],
											},
											1,
											0,
										],
									},
								},
								loss: {
									$sum: {
										$cond: [
											{
												$gt: ["$pnl", 0],
											},
											0,
											1,
										],
									},
								},
								total_collateral: {
									$sum: "$amount",
								},
							},
						},
						{
							$addFields: {
								total_trades: {
									$sum: ["$win", "$loss"],
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
								total_trades: 1,
								win_rate: {
									$round: [
										{
											$multiply: [
												{
													$divide: ["$win", "$total_trades"],
												},
												100,
											],
										},
										0,
									],
								},
							},
						},
					],
					as: "result_performance",
				},
			},
			{
				$unwind: {
					path: "$result_performance",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: "trades",
					localField: "address",
					foreignField: "masterAddress",
					pipeline: [
						{
							$match: {
								updateAt: {
									$gte: from,
									$lte: to,
								},
								isActive: false,
								isCopy: true,
							},
						},
						{
							$group: {
								_id: null,
								total: {
									$sum: "$pnl",
								},
							},
						},
						{
							$project: {
								_id: 0,
							},
						},
					],
					as: "result_pnl_copiers",
				},
			},
			{
				$unwind: {
					path: "$result_pnl_copiers",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					_id: 0,
					address: 1,
					description: 1,
					profit_sharing: "$copy_share_fee",
					copiers: {
						$cond: [
							{
								$eq: [
									{
										$ifNull: ["$result_total_copiers", 0],
									},
									0,
								],
							},
							0,
							"$result_total_copiers.total",
						],
					},
					pnl: {
						$cond: [
							{
								$eq: [
									{
										$ifNull: ["$result_performance", 0],
									},
									0,
								],
							},
							0,
							"$result_performance.pnl",
						],
					},
					roi: {
						$cond: [
							{
								$eq: [
									{
										$ifNull: ["$result_performance", 0],
									},
									0,
								],
							},
							0,
							"$result_performance.roi",
						],
					},
					total_trades: {
						$cond: [
							{
								$eq: [
									{
										$ifNull: ["$result_performance", 0],
									},
									0,
								],
							},
							0,
							"$result_performance.total_trades",
						],
					},
					win_rate: {
						$cond: [
							{
								$eq: [
									{
										$ifNull: ["$result_performance", 0],
									},
									0,
								],
							},
							0,
							"$result_performance.win_rate",
						],
					},
					createAt: 1,
					total_pnl_copiers: {
						$cond: [
							{
								$eq: [
									{
										$ifNull: ["$result_pnl_copiers", 0],
									},
									0,
								],
							},
							0,
							"$result_pnl_copiers.total",
						],
					},
				},
			},
		];
		const dataUserDetails = await collections.users
			.aggregate(aggregateUserDetails, { session })
			.toArray();
		if (dataUserDetails.length === 0) throw ErrMsg(ERROR_CODE.USER_NOT_FOUND);
		return dataUserDetails[0];
	},
	SetUserPendingRef: async (
		address: string,
		ref_code: string,
		session?: ClientSession,
	) => {
		await collections.users.findOneAndUpdate(
			{ address: address.toLowerCase(), sponsor: { $exists: false } },
			{
				$setOnInsert: GetNewUser(address),
				$set: { pending_ref: ref_code },
			},
			{ session },
		);
	},
	SetSponsor: async (address: string, session?: ClientSession) => {
		const user_info = await collections.users.findOne(
			{ address: address.toLowerCase() },
			{ session },
		);
		await collections.users.updateOne(
			{ address: address.toLowerCase() },
			{
				$setOnInsert: GetNewUser(address),
				$set: {
					sponsor: user_info?.sponsor
						? user_info?.sponsor
						: user_info?.pending_ref || "0x0",
				},
				$unset: { pending_ref: 1 },
			},
			{ session, upsert: true },
		);
	},
	SetRefCode: async (
		address: string,
		ref_code: string,
		session?: ClientSession,
	) => {
		const user_info = await collections.users.findOne(
			{ address: address.toLowerCase() },
			{ session },
		);
		if (!user_info) throw ErrMsg(ERROR_CODE.USER_NOT_FOUND);
		if (user_info.ref_code) throw ErrMsg(ERROR_CODE.REF_CODE_ALREADY_EXIST);
		await collections.users.updateOne(
			{ address },
			{ $set: { ref_code: ref_code } },
			{ session },
		);
	},
	SetPermit: async (permit: TPermit, session?: ClientSession) => {
		const address = permit.owner.toLowerCase();
		const { value } = await collections.users.findOneAndUpdate(
			{ address },
			{
				$setOnInsert: GetNewUser(address),
				$set: {
					permit: {
						...permit,
						owner: lowerCase(permit.owner),
						spender: lowerCase(permit.spender),
					},
				},
			},
			{ upsert: true, session, returnDocument: "after" },
		);
		if (!value) throw ErrMsg(ERROR_CODE.USER_NOT_FOUND);
	},
	UnsetPermit: async (owner: string, session?: ClientSession) => {
		const address = owner.toLowerCase();
		const { value } = await collections.users.findOneAndUpdate(
			{ address },
			{
				$setOnInsert: GetNewUser(address),
				$unset: { permit: 1 },
			},
			{ upsert: true, session, returnDocument: "after" },
		);
		if (!value) throw ErrMsg(ERROR_CODE.USER_NOT_FOUND);
	},
	AddCommissionForSponsor: async (
		ref_address: string,
		fee: Decimal128,
		session?: ClientSession,
	) => {
		const ref_user = await collections.users.findOne(
			{ address: ref_address.toLowerCase() },
			{ session },
		);
		if (ref_user?.sponsor) {
			const commission = GetCommission(fee);
			await collections.users.updateOne(
				{ ref_code: ref_user.sponsor },
				{ $inc: { unclaim_commission: commission } },
			);
			// console.log(`User have ref_code= ${ref_user.sponsor} got ${commission.toString()} USDC as commission fee`)
		}
	},
	SetCopyFee: async (
		address: string,
		copy_fee: number,
		signature: string,
		session?: ClientSession,
	) => {
		await collections.users.updateOne(
			{ address: address.toLowerCase() },
			{
				$set: {
					copy_share_fee: copy_fee,
					set_copy_share_signature: signature,
				},
			},
			{ session },
		);
	},
	getPermitsByUsers: async (addresses: string[], session?: ClientSession) => {
		const now_in_sec = Math.floor(
			new Date().getTime() / MILLISECOND_PER_ONE_SEC,
		);
		const users = await collections.users
			.find(
				{
					address: { $in: addresses.map((el) => el.toLowerCase()) },
					permit: { $exists: true },
					"permit.deadline": { $gte: now_in_sec },
					"permit.spender": POOL_CONTRACT_ADDRESS,
				},
				{ session },
			)
			.toArray();
		return users.map((el) => el.permit) as TPermit[];
	},
	updateCommission: async (
		address: string,
		amount_commission: string,
		session?: ClientSession,
	) => {
		await collections.users.updateOne(
			{
				address,
			},
			{
				$set: {
					unclaim_commission: new Decimal128(amount_commission),
				},
			},
			{
				session,
			},
		);
	},
	getPermitsByUser: async (address: string, session?: ClientSession) => {
		const now_in_sec = Math.floor(
			new Date().getTime() / MILLISECOND_PER_ONE_SEC,
		);
		const users = await collections.users.findOne(
			{
				address,
				permit: { $exists: true },
				"permit.deadline": { $gte: now_in_sec },
				"permit.spender": POOL_CONTRACT_ADDRESS,
			},
			{ session },
		);
		if (!users) return null;
		return users.permit as TPermit;
	},
});
type DAOType = ReturnType<typeof getDAO>;
class DAO {
	dao: DAOType = getDAO();
	common = this.dao.common;
}

export { getDAO as getUserDAO, DAOType as UserType, DAO as UserDAO };
