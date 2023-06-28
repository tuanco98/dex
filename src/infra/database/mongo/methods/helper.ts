import { Decimal128 } from "mongodb";
import { system_status } from "../../..";
import {
	BPS,
	CLOSE_FEE_RATE,
	EXECUTION_FEE,
	OPEN_FEE_RATE,
	PRICE_ATOMIC,
} from "../../../../config";
import { GetJSONStringify } from "../../../../lib/utils";

export type EUnitDateTrunc = 'year' | 'quarter' | 'week' | 'month' | 'day' | 'hour' | 'minute' | 'second'
export const toDecimal128 = (bn: bigint | number | string) =>
	new Decimal128(bn.toString() || '0');
const getDisplayLeverage = (leverage: number) => leverage / Number(BPS);
const getPositionSize = (amount: bigint, leverage: number) =>
	(amount * BigInt(leverage)) / BPS;

const getEntryFee = (
	amount: bigint,
	leverage: number,
	pair_id: number,
	isSelf = false,
) => {
	const open_fee_rate = BigInt(
		system_status?.getPair(pair_id)?.openFee || OPEN_FEE_RATE,
	);
	return (
		(getPositionSize(amount, leverage) * open_fee_rate) / BPS +
		BigInt(isSelf ? 0 : EXECUTION_FEE)
	);
};
const getCloseFee = (
	amount: bigint,
	leverage: number,
	pair_id: number,
	isSelf = false,
) => {
	const close_fee_rate = BigInt(
		system_status?.getPair(pair_id)?.closeFee || CLOSE_FEE_RATE,
	);
	return (
		(getPositionSize(amount, leverage) * close_fee_rate) / BPS +
		BigInt(isSelf ? 0 : EXECUTION_FEE)
	);
};

const getFundingFee = (
	positionSize: bigint,
	fundingTracker: bigint,
	currentFundingTracker: bigint,
) => (positionSize * (currentFundingTracker - fundingTracker)) / BPS;

const getPNL = (
	isLong: boolean,
	currentPrice: bigint,
	entryPrice: bigint,
	amount: bigint,
	leverage: number,
	fundingTracker: bigint,
	currentFundingTracker: bigint,
) => {
	const positionSize = getPositionSize(amount, leverage);
	const _is_long = BigInt(isLong ? 1 : -1);
	let pnl =
		(_is_long * positionSize * (currentPrice - entryPrice)) / entryPrice;
	pnl =
		pnl +
		_is_long *
			getFundingFee(positionSize, fundingTracker, currentFundingTracker);
	return pnl;
};

const getLiquidationPrice = (params: {
	entryPrice: bigint;
	liquidationRate: bigint;
	amount: bigint;
	leverage: number;
	fundingTracker: bigint;
	currentFundingTracker: bigint;
	isLong: boolean;
	pair_id: number;
}) => {
	const {
		entryPrice,
		isLong,
		liquidationRate,
		amount,
		leverage,
		fundingTracker,
		currentFundingTracker,
		pair_id,
	} = params;
	const position_size = getPositionSize(amount, leverage);
	const _is_long = BigInt(isLong ? 1 : -1);

	return roundUpLiquidationPrice(
		(
			entryPrice +
			(_is_long *
				((amount * BigInt(-liquidationRate)) / BPS +
					getCloseFee(amount, leverage, pair_id, false) +
					BigInt(_is_long) *
						getFundingFee(
							position_size,
							fundingTracker,
							currentFundingTracker,
						)) *
				entryPrice) /
				position_size
		).toString(),
		isLong,
	);
};
const ABS = (n: bigint) => (n > 0 ? n : -n);
const roundUpLiquidationPrice = (
	liquidation_price: string,
	isLong: boolean,
) => {
	const bn_liquid_price = BigInt(liquidation_price);
	if (ABS(bn_liquid_price) > 1000n * PRICE_ATOMIC) {
		return (
			(bn_liquid_price / (PRICE_ATOMIC / BigInt(1e2)) +
				BigInt(isLong ? (bn_liquid_price > 0 ? 1 : -1) : 0)) *
			(PRICE_ATOMIC / BigInt(1e2))
		).toString();
	}
	if (ABS(bn_liquid_price) > 10n * PRICE_ATOMIC)
		return (
			(bn_liquid_price / (PRICE_ATOMIC / BigInt(1e3)) +
				BigInt(isLong ? (bn_liquid_price > 0 ? 1 : -1) : 0)) *
			BigInt(PRICE_ATOMIC / BigInt(1e3))
		).toString();
	if (ABS(bn_liquid_price) > 1n * PRICE_ATOMIC)
		return (
			(bn_liquid_price / (PRICE_ATOMIC / BigInt(1e4)) +
				BigInt(isLong ? (bn_liquid_price > 0 ? 1 : -1) : 0)) *
			(PRICE_ATOMIC / BigInt(1e4))
		).toString();
	if (ABS(bn_liquid_price) > PRICE_ATOMIC / 100n) {
		return (
			(bn_liquid_price / (PRICE_ATOMIC / BigInt(1e7)) +
				BigInt(isLong ? (bn_liquid_price > 0 ? 1 : -1) : 0)) *
			(PRICE_ATOMIC / BigInt(1e7))
		).toString();
	}
	return liquidation_price;
};

const getErrMsg = (e: any) => {
	if (typeof e === "string") return e;
	return "message" in e ? e.message : GetJSONStringify(e);
};
const getOriginAmount = (
	amount: Decimal128,
	leverage: number,
	pair_id: number,
	isSelf: boolean,
) => {
	const open_fee_rate = Number(
		BigInt(system_status?.getPair(pair_id)?.openFee || OPEN_FEE_RATE) /
			BigInt(1e6),
	);

	const useGasLess = isSelf ? 0 : EXECUTION_FEE;
	const originAmount =
		(BigInt(amount.toString()) + BigInt(useGasLess)) /
		BigInt(1 - (leverage * open_fee_rate) / Number(BPS));
	return originAmount;
};

export {
	getEntryFee,
	getCloseFee,
	getFundingFee,
	getPNL,
	getLiquidationPrice,
	getOriginAmount,
	getErrMsg,
	getPositionSize,
	getDisplayLeverage,
	roundUpLiquidationPrice,
};
