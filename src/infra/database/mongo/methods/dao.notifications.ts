import { ClientSession, Filter, ObjectId, Sort, UpdateFilter, UpdateOptions } from "mongodb";
import { decodeReasonCopyFailed } from "../../../blockchain/viem/viem.helper";
import {
	ENotificationStatusType,
	ENotificationType,
	TNotification,
	TNotificationPayload,
} from "../models/Notification";
import { collections } from "../mongo";
import { lowerCase } from "../../../../lib/utils";
const getDAO = () => ({
	common: collections.notifications,
	getMany: async (
		query: Filter<TNotification>,
		page: number,
		pageSize: number,
		skip_get_total = false,
		sort?: Sort,
		session?: ClientSession,
	) => {
		if (!skip_get_total) {
			const [data, total, totalNotRead] = await Promise.all([
				collections.notifications
					.find(query, { session })
					.skip(page * pageSize)
					.sort(sort ? sort : {})
					.limit(pageSize)
					.toArray(),
				collections.notifications.countDocuments(query, { session }),
				collections.notifications.countDocuments(
					{ ...query, readAt: { $exists: false } },
					{ session },
				),
			]);
			return {
				data,
				total,
				totalNotRead,
			};
		} else {
			const data = await collections.notifications
				.find(query, { session })
				.skip(page * pageSize)
				.limit(pageSize)
				.toArray();
			return {
				data,
			};
		}
	},
	NewNotification: async (
		address: string,
		type: ENotificationType,
		payload: TNotificationPayload,
		status: ENotificationStatusType,
		jobId?: string,
		session?: ClientSession,
	) => {
		const { value } = await collections.notifications.findOneAndUpdate(
			{
				jobId,
				address: address.toLowerCase(),
			},
			{
				$setOnInsert: {
					address: address.toLowerCase(),
					type,
					createAt: new Date(),
				},
				$set: {
					status,
					updateAt: new Date(),
					payload: {
						...payload,
						reason: payload.reason
							? decodeReasonCopyFailed(payload.reason)
							: undefined,
					},
				},
			},
			{ session, upsert: true, returnDocument: "after" },
		);
		return value;
	},
	AddNewNotification: async (
		notification: TNotification,
		session?: ClientSession,
	) => {
		return collections.notifications.insertOne(notification, { session });
	},
	NewNotifications: async (notifications: TNotification[]) => {
		if (notifications.length > 0)
			await collections.notifications.insertMany(notifications);
	},
	UpdateNotification: async (filter: Filter<TNotification>, update: UpdateFilter<TNotification> | Partial<TNotification>, options?: UpdateOptions | undefined) => {
		await collections.notifications.updateOne(filter, update, options)
	},
	UpdateManyWithBulkWrite: async (
		bulk_write: any[],
		session?: ClientSession,
	) => {
		if (bulk_write.length > 0)
			await collections.notifications.bulkWrite(bulk_write, { session });
	},
	GetNotification: async (
		address: string,
		jobId: string,
		type?: ENotificationType,
		session?: ClientSession,
	) => {
		return collections.notifications.findOne(
			{ address: lowerCase(address), jobId, type },
			{ session },
		);
	},
	GetNotificationsByJobId: async (jobId: string, session?: ClientSession) => {
		return collections.notifications.find({ jobId }, { session }).toArray();
	},
	RemoveNotification: async (
		address: string,
		jobId: string,
		type?: ENotificationType,
		session?: ClientSession,
	) => {
		return collections.notifications.deleteOne(
			{
				address: lowerCase(address),
				type,
				jobId,
			},
			{ session },
		);
	},
	RemoveNotifications: async (jobId: string, session?: ClientSession) => {
		return collections.notifications.deleteMany(
			{
				jobId,
			},
			{ session },
		);
	},
	ReadNotification: async (id: string, session?: ClientSession) => {
		await collections.notifications.updateOne(
			{ _id: new ObjectId(id), readAt: { $exists: false } },
			{ $set: { readAt: new Date() } },
			{ session },
		);
	},
	ReadNotifications: async (address: string, session?: ClientSession) => {
		await collections.notifications.updateMany(
			{ address: address.toLowerCase(), readAt: { $exists: false } },
			{ $set: { readAt: new Date() } },
			{ session },
		);
	},
});

type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getNotificationDAO, DAOType as NotificationType };
