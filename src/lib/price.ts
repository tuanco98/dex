import { Decimal128 } from "mongodb";
import { PRICE_ATOMIC } from "../config";


export const getAtomicPriceFromPrice = (price: number) =>
	BigInt(price) * PRICE_ATOMIC;
