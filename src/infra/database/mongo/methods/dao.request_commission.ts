import { ClientSession, Decimal128, ObjectId } from "mongodb";
import { TRequestCommission } from "../models/CommissionRequest";
import { collections } from "../mongo";

const getDAO = () => ({
	common: collections.request_commissions,
	addRequestCommission: async (
		dataRequestCommission: TRequestCommission,
		session?: ClientSession,
	) => {
		await collections.request_commissions.insertOne(dataRequestCommission, {
			session,
		});
	},
	updateRequestCommission: async (
		_id: ObjectId,
		txid: string,
		remainAmount: string,
		session?: ClientSession,
	) => {
		await collections.request_commissions.updateOne(
			{ _id },
			{
				$set: {
					txid,
					updateAt: new Date(),
					remainAmount: new Decimal128(remainAmount),
				},
			},
			{ session },
		);
	},
	updateError: async (_id: ObjectId, errorMessage: string) => {
		await collections.request_commissions.updateOne(
			{ _id },
			{ $set: { error: errorMessage } },
		);
	},
	getRequestCommissionByTime: async (
		address: string,
		from: Date,
		to: Date,
		session?: ClientSession,
	) => {
		const dataRequestCommission = await collections.request_commissions.findOne(
			{
				$or: [
					{ createAt: { $gte: from, $lte: to } },
					{ txid: { $exists: false } },
				],
				address,
			},
			{ session },
		);
		return dataRequestCommission;
	},
	getRequestCommission: async () => {
		const dataRequestCommission = await collections.request_commissions.findOne(
			{ txid: { $exists: false }, error: { $exists: false } },
			{ sort: { createdAt: 1 } },
		);
		return dataRequestCommission;
	},
	getRequestCommissionById: async (_id: string, session?: ClientSession) =>
		await collections.request_commissions.findOne(
			{ _id: new ObjectId(_id) },
			{ session },
		),
});

type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getRequestCommissionDAO, DAOType as RequestCommissionType };
