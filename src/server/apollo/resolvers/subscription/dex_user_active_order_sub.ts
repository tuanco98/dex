import { withFilter } from "graphql-subscriptions";
import { ESubEventName, pubsub } from ".";


export const dex_user_active_order_sub = {
	subscribe: withFilter(
		() => pubsub.asyncIterator([ESubEventName.USER_ACTIVE_ORDER]),
		(payload, variables) => {
			return (
				payload.dex_user_active_order_sub?.owner?.toLowerCase() ===
				variables.address?.toLowerCase()
			);
		},
	),
};
