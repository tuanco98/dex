import { PRICE_RANGE_PERCENT } from "../config";
import { connectInfra } from "../infra";
import { connectSubRedis } from "../infra/cache/pubsub.redis";
import { DAO } from "../infra/database/mongo/methods";
import { connectMongo } from "../infra/database/mongo/mongo";

const getMarkPrice = (params: {
	pyth_price: number | null;
	chainlink_price: number | null;
}) => {
	const { pyth_price, chainlink_price } = params;
	if (!pyth_price) return chainlink_price;
	if (!chainlink_price) return pyth_price;
	const MAX_RATIO = 1 + PRICE_RANGE_PERCENT / 100;
	const MIN_RATIO = 1 - PRICE_RANGE_PERCENT / 100;
	const price_ratio = pyth_price / chainlink_price;
	const round_up_to_decimal = 2;
	const round_up_to_decimal_factor = 10 ** round_up_to_decimal;
	console.log(chainlink_price * MIN_RATIO * round_up_to_decimal_factor)
	console.log(chainlink_price * MAX_RATIO * round_up_to_decimal_factor)
	if (price_ratio < MIN_RATIO)

		return (
			Math.ceil(chainlink_price * MIN_RATIO * round_up_to_decimal_factor) /
			round_up_to_decimal_factor
		);

	if (price_ratio > MAX_RATIO)
		return (
			Math.floor(chainlink_price * MAX_RATIO * round_up_to_decimal_factor) /
			round_up_to_decimal_factor
		);
	return pyth_price;
};

const test = async () => {
	await connectMongo()
	const data = await DAO.trades.GetTotalProfitPositionForUserChart({
		from: 0,
		to: new Date().getTime(),
		unit: 'hour',
		binSize: 2
	})
	console.log(data.map(el => {
		return {
			...el,
			id: el.id.getTime(),
		}
	}))
};

test();
