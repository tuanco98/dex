import { withFilter } from "graphql-subscriptions";
import { ESubEventName, pubsub } from ".";
import { TNotification } from "../../../../infra/database/mongo/models/Notification";
import { isMatchAddress } from "../../../../infra/blockchain/viem/viem.helper";
import { isAddress } from "viem";

export const dex_user_notification_sub = {
	subscribe: withFilter(
		() => pubsub.asyncIterator([ESubEventName.USER_NOTIFICATION]),
		(payload, variables) => {
			const notification = payload as {
				dex_user_notification_sub: TNotification;
			};
			if (
				!(
					notification.dex_user_notification_sub.address &&
					variables.address &&
					isAddress(notification.dex_user_notification_sub.address) &&
					isAddress(variables.address)
				)
			) {
				return false;
			} else {
				return isMatchAddress(
					notification.dex_user_notification_sub.address,
					variables.address,
				);
			}
		},
	),
};
