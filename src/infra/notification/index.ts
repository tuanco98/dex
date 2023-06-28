import { ClientSession, ObjectId } from "mongodb";
import { DAO } from "../database/mongo/methods";
import {
	ENotificationStatusType,
	ENotificationType,
	TNotification,
	TNotificationPayload,
} from "../database/mongo/models/Notification";
import {
	PublishNewNotification,
	TNotificationSub,
} from "../../server/apollo/resolvers/subscription";
import { lowerCase } from "../../lib/utils";

export const PushNewNotification = async (params: {
	address: string;
	type: ENotificationType;
	payload: TNotificationPayload;
	jobId?: string;
	status?: ENotificationStatusType;
	session?: ClientSession;
}) => {
	const { address, type, payload, jobId, session, status } = params;
	const new_notification: TNotification = {
		_id: new ObjectId(),
		address: lowerCase(address),
		status: status || "Pending",
		type,
		jobId,
		payload,
		createAt: new Date(),
		updateAt: new Date(),
	};
	if (type === "EditPosition") {
		const txid = payload.txid;
		const notify_open_position = await DAO.notifications.common.findOne({
			"payload.txid": txid,
			address,
			$or: [{ type: "OpenPosition" }, { type: "Copy" }],
		});
		if (notify_open_position) return;
	}
	await DAO.notifications.AddNewNotification(new_notification, session);
	PublishNewNotification([{ ...new_notification, action: "ADD" }]);
};
export const UpdateNotification = async (params: {
	jobId: string;
	status?: ENotificationStatusType;
	payload?: TNotificationPayload;
	session?: ClientSession;
}) => {
	const { jobId, session, status, payload } = params;
	const get_notifications = await DAO.notifications.GetNotificationsByJobId(
		jobId,
		session,
	);
	if (get_notifications.length > 0) {
		const notifications: TNotificationSub[] = get_notifications.map((el) => {
			return {
				...el,
				action: "DELETE",
			};
		});
		await DAO.notifications.RemoveNotifications(jobId, session);
		PublishNewNotification(notifications);
		if (status && status === "Failed") {
			const notifications: TNotification[] = [];
			for (const notification of notifications) {
				notifications.push({
					address: notification.address.toLowerCase(),
					type: notification.type,
					payload: payload || { jobId: notification.jobId },
					jobId,
					status,
					createAt: new Date(),
					updateAt: new Date(),
				});
			}
			await DAO.notifications.NewNotifications(notifications);
			PublishNewNotification(
				notifications.map((el) => {
					return { ...el, action: "ADD" };
				}),
			);
		}
	}
};
