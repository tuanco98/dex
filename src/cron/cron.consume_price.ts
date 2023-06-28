import { PRICE_RANGE_PERCENT } from "../config";
import {
	chainlink_price_feeder,
	pair_controller,
	pyth_price_feeder,
	trigger_pair_controller,
} from "../infra";
import { TPairPrice } from "../infra/database/mongo/models/PairPrice";
import { collections } from "../infra/database/mongo/mongo";
import { SetServerReady } from "../lib/check_status";
import { ErrorHandler } from "../lib/error_handler";
import { sleep } from "../lib/utils";

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
	if (price_ratio < MIN_RATIO)
		return (
			Math.ceil(
				chainlink_price * MIN_RATIO * round_up_to_decimal_factor,
			)
			/ round_up_to_decimal_factor
		);

	if (price_ratio > MAX_RATIO)
		return (
			Math.floor(chainlink_price * MAX_RATIO * round_up_to_decimal_factor)
			/ round_up_to_decimal_factor
		);
	return pyth_price;
};

const consume_price = async () => {
	try {
		const newDate = new Date();
		const getDataPair = await collections.pairs.find().toArray();
		const dataPairPrices: TPairPrice[] = [];
		const dataChainlinkPairPrices: TPairPrice[] = [];
		for (const dataPair of getDataPair) {
			const { pair_id } = dataPair;
			const currentPriceInPyth = await pyth_price_feeder.GetCurrentPrice(
				pair_id,
			);
			const currentPriceInChainlink =
				await chainlink_price_feeder.GetCurrentPrice(pair_id);
			// const currentPriceInPyth = 100
			// const currentPriceInChainlink = 100
			const markPrice = getMarkPrice({
				pyth_price: currentPriceInPyth,
				chainlink_price: currentPriceInChainlink,
			});
			if (!markPrice) continue;
			const saveDataPrice: TPairPrice = {
				pair_id,
				timestamp: newDate,
				source: markPrice === currentPriceInPyth ? "PYTH" : "CHAINLINK",
				price: parseFloat(markPrice.toFixed(2)),
				chainlink_price: currentPriceInChainlink,
				pyth_price: currentPriceInPyth,
			};
			dataPairPrices.push(saveDataPrice);
			if (currentPriceInChainlink) {
				dataChainlinkPairPrices.push({
					pair_id,
					timestamp: newDate,
					source: "CHAINLINK",
					price: parseFloat(currentPriceInChainlink.toFixed(2)),
					chainlink_price: currentPriceInChainlink,
					pyth_price: currentPriceInPyth,
				});
			}
		}
		if (dataPairPrices.length > 0) {
			await collections.pairs_price.insertMany(dataPairPrices);
			dataPairPrices.forEach((dataPairPrice) => {
				const chainlink_price = dataChainlinkPairPrices.find(
					(el) => el.pair_id === dataPairPrice.pair_id,
				);
				pair_controller
					.getPair(dataPairPrice.pair_id)
					.updatePrice(dataPairPrice.price, chainlink_price?.price);
			});
			dataChainlinkPairPrices.forEach((dataChainlinkPairPrice) => {
				trigger_pair_controller
					.getPair(dataChainlinkPairPrice.pair_id)
					.updatePrice(dataChainlinkPairPrice.price);
			});
		}
		SetServerReady();
	} catch (error: any) {
		await sleep(2000);
		if ("message" in error && "timeout of 5000ms exceeded" === error.message) {
			console.log("Err:timeout of 5000ms exceeded");
		} else {
			ErrorHandler(error, {}, consume_price.name);
		}
	}
};

export { consume_price };
