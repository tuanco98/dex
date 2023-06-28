import { withFilter } from "graphql-subscriptions";
import { ESubEventName, pubsub } from ".";

export const dex_system_status = {
	subscribe: withFilter(
		() => pubsub.asyncIterator([ESubEventName.NEW_SYSTEM_STATUS]),
		() => {
			return true;
		},
	),
};
