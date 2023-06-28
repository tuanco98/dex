import { ClientSession, Filter, ObjectId, Sort } from "mongodb";
import { MILLISECOND_PER_ONE_SEC } from "../../../../lib/constants";
import { ErrMsg, ERROR_CODE } from "../../../../lib/error_handler";
import { TOrder } from "../models/Order";
import { collections } from "../mongo";
import { getErrMsg } from "./helper";
const common = () => collections.orders;
const getMany = async (
	query: Filter<TOrder>,
	page: number,
	pageSize: number,
	skip_get_total = false,
	sort?: Sort,
	session?: ClientSession,
) => {
	if (!skip_get_total) {
		const [data, total] = await Promise.all([
			collections.orders
				.find(query, { session })
				.skip(page * pageSize)
				.sort(sort ? sort : {})
				.limit(pageSize)
				.toArray(),
			collections.orders.countDocuments(query, { session }),
		]);
		return {
			data,
			total,
		};
	} else {
		const data = await collections.orders
			.find(query, { session })
			.skip(page * pageSize)
			.limit(pageSize)
			.toArray();
		return {
			data,
		};
	}
};
const getDAO = () => ({
	common: common(),
	OpenOrder: async (
		order: Omit<TOrder, "createdAt" | "updatedAt">,
		session?: ClientSession,
	) => {
		if (order.orderId) {
			const order_info = await collections.orders.findOne(
				{ orderId: order.orderId },
				{ session },
			);
			if (order_info) return;
		}
		const date_now = new Date();
		return collections.orders.insertOne(
			{
				...order,
				owner: order.owner.toLowerCase(),
				createdAt: date_now,
				updatedAt: date_now,
			},
			{ session },
		);
	},
	getMany,
	GetOrderById: async (
		filters: { orderId?: string; _id?: string, isActive?: boolean},
		session?: ClientSession,
	) => {
		const filter: Filter<TOrder> = {
			orderId: filters.orderId,
			_id: new ObjectId(filters._id),
			isActive: filters.isActive
		};
		const order = await collections.orders.findOne(filter, { session });
		return order;
	},
	GetActiveOrders: async (
		address: string,
		pair_id: number | null | undefined,
		page: number,
		pageSize: number,
	) => {
		let filter: Filter<TOrder>;
		if (pair_id == null) {
			filter = {
				owner: address,
				isActive: true,
				limitExpire: {
					$gte: Math.round(new Date().getTime() / MILLISECOND_PER_ONE_SEC),
				},
			};
		} else {
			filter = {
				owner: address,
				pairId: pair_id,
				isActive: true,
				limitExpire: {
					$gte: Math.round(new Date().getTime() / MILLISECOND_PER_ONE_SEC),
				},
			};
		}
		return getMany(filter, page, pageSize, false, { createAt: -1 });
	},
	CancelLimitOrderActive: async (_id: string, session?: ClientSession) => {
		const date_now = new Date();
		const { value } = await collections.orders.findOneAndUpdate(
			{ _id: new ObjectId(_id), isActive: true },
			{ $set: { isActive: false, updatedAt: date_now, cancelAt: date_now } },
			{ session },
		);
		if (!value) throw ErrMsg(ERROR_CODE.ORDER_NOT_FOUND);
		return value;
	},
	GetAllActiveOrdersByPair: async (pair_id: number) => {
		const filter: Filter<TOrder> = {
			pairId: pair_id,
			isActive: true,
			triggerStatus: "NONE",
			limitExpire: {
				$gte: Math.round(new Date().getTime() / MILLISECOND_PER_ONE_SEC),
			},
		};
		return getMany(filter, 0, Infinity, true);
	},
	InactiveOrder: async (
		id: ObjectId,
		isForceUpdate: boolean,
		order_id?: string,
		txid?: string,
		session?: ClientSession,
	) => {
		if (!(txid || order_id || isForceUpdate)) return;
		await collections.orders.updateOne(
			{ _id: id },
			{ $set: { isActive: false, orderId: order_id, txId: txid } },
			{ session },
		);
	},
	MarkTriggerOrder: async (
		id: ObjectId,
		trigger_id: string,
		session?: ClientSession,
	) => {
		await collections.orders.updateOne(
			{ _id: id },
			{ $set: { triggerStatus: "PENDING", triggerId: trigger_id } },
			{ session },
		);
	},
	InactiveOrderBySignature: async (
		owner: string,
		signature: string,
		txid: string,
		session?: ClientSession,
	) => {
		const { value } = await collections.orders.findOneAndUpdate(
			{ owner: owner.toLowerCase(), signature },
			{ $set: { isActive: false, updatedAt: new Date(), cancelTxId: txid } },
			{ session },
		);
		return value;
	},
	CheckSignatureIsExist: async (signature: string, session?: ClientSession) => {
		const order = await collections.orders.findOne({ signature }, { session });
		if (order) throw ErrMsg(ERROR_CODE.SIGNATURE_EXISTS);
	},
	UpdateExpireOrder: async () => {
		return collections.orders.updateOne(
			{
				limitExpire: {
					$lt: Math.round(new Date().getTime() / MILLISECOND_PER_ONE_SEC),
				},
				isActive: true,
			},
			{ $set: { isActive: false } },
		);
	},
	MarkTriggerError: async (id: ObjectId, err: any) => {
		const err_msg = getErrMsg(err);
		await collections.orders.updateOne(
			{ _id: id },
			{ $set: { triggerLimitError: err_msg } },
		);
	},
});

type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getOrderDAO, DAOType as OrderType };
