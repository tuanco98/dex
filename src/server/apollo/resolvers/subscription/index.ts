import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";
import { REDIS_DB_NUMBER, REDIS_URI } from "../../../../config";
import { TNotification } from "../../../../infra/database/mongo/models/Notification";
import { TTrade } from "../../../../infra/database/mongo/models/Trade";
import { GetJSONStringify } from "../../../../lib/utils";
import { calculateAtomicPrice } from "../../helper";
import { WithId } from "mongodb";
import { convertTOrderRequiredToOutput } from "../queries/dex_user_orders";

const pubsub = new RedisPubSub({
	publisher: new Redis(REDIS_URI, { db: REDIS_DB_NUMBER }),
	subscriber: new Redis(REDIS_URI, { db: REDIS_DB_NUMBER }),
});

type TPairSub = {
	pair_id: number;
	price: string;
	chainlink_price: string;
	timestamp: number;
};
type TNotificationSub = TNotification & {
	action: "DELETE" | "ADD";
};
enum ESubEventName {
	UPDATE_PRICE = "UPDATE_PRICE",
	NEW_SYSTEM_STATUS = "NEW_SYSTEM_STATUS",
	USER_NOTIFICATION = "USER_NOTIFICATION",
	USER_ACTIVE_ORDER = "USER_ACTIVE_ORDER",
}
const PublishNewPrice = (
	pair_id: number,
	price: number,
	chainlink_price: number,
) => {
	const dex_current_price_sub: TPairSub = {
		pair_id,
		price: calculateAtomicPrice(price),
		chainlink_price: calculateAtomicPrice(chainlink_price),
		timestamp: new Date().getTime(),
	};
	// console.log({dex_current_price_sub})
	pubsub.publish(ESubEventName.UPDATE_PRICE, { dex_current_price_sub });
};

const PublishNewSystemStatus = (
	latest_block_number: number,
	latest_block_consumed: number,
	chainlink_contract_status: boolean,
	base_fee: string,
	L1GasFee: string,
) => {
	pubsub.publish(ESubEventName.NEW_SYSTEM_STATUS, {
		dex_system_status: {
			latest_block_number,
			latest_block_consumed,
			chainlink_contract_status,
			base_fee,
			l1_gas_fee: L1GasFee,
			update_at: new Date().getTime(),
		},
	});
};
const PublishNewNotification = (notifications: TNotificationSub[]) => {
	notifications.map((notification) => {
		const notification_convert = { ...notification, id: notification._id };
		const remove_bigint_notification_convert = JSON.parse(
			GetJSONStringify(notification_convert),
		);
		pubsub.publish(ESubEventName.USER_NOTIFICATION, {
			dex_user_notification_sub: remove_bigint_notification_convert,
		});
	});
};
const PublishNewTrade = (trade: WithId<TTrade>) => {
	pubsub.publish(ESubEventName.USER_ACTIVE_ORDER, {
		dex_user_active_order_sub: convertTOrderRequiredToOutput(trade),
	});
};

export {
	pubsub,
	TNotificationSub,
	PublishNewSystemStatus,
	PublishNewPrice,
	PublishNewNotification,
	PublishNewTrade,
	ESubEventName,
};
