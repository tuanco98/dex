import { withFilter } from "graphql-subscriptions";
import { ESubEventName, pubsub } from ".";

export const dex_current_price_sub = {
    subscribe: withFilter(
        () => pubsub.asyncIterator([ESubEventName.UPDATE_PRICE]),
        (payload, variables) => {
            const prices_update = payload as { dex_current_price_sub: { pair_id: number, price: number } }
            const { pairs } = variables as { pairs: number[] }
            if (!pairs || pairs.length === 0) throw new Error("pairs must not empty")
            return pairs.includes(prices_update.dex_current_price_sub.pair_id)
        }
    )
}
