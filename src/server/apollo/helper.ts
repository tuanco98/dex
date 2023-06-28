import { Hex, keccak256 } from "viem";
import { PRICE_ATOMIC } from "../../config";
import { pair_controller, trigger_pair_controller } from "../../infra";
import { ErrMsg, ERROR_CODE } from "../../lib/error_handler";
import { DataPrice } from "./resolvers/queries/dex_chart_data";

const GetSignMessage = (timestamp: number) => `smurfi_${timestamp}`;
const EncodeToken = (signature: string, address: string) =>
	keccak256(`${signature}_${address}` as Hex);
const VerifyAuthorization = async (authorization: string) => {
	return {
		address: authorization.toLowerCase(),
	};
	// try {
	//     const token_value = await getUserToken(authorization)
	//     if (!token_value) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID)
	//     const recover_address = web3_provider.recoverSignature(token_value.signature, GetSignMessage(token_value.timestamp))
	//     return {
	//         address: recover_address
	//     }
	// } catch {
	//     throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID)
	// }
};
const getPrice = (pairId: number) => {
	const { price } = pair_controller.getPair(pairId);
	if (!price) throw new Error("Get price error");
	return price;
};
const getPriceChainLink = (pairId: number) => {
	const { price } = trigger_pair_controller.getPair(pairId);
	if (!price) throw new Error("Get chainlink price error");
	return price;
};
const GetAuthorization = (ctx: any) => {
	const auth = ctx?.req?.headers?.authorization;
	if (!auth) throw ErrMsg(ERROR_CODE.AUTHORIZATION_REQUIRED);
	return auth;
};
const GetRecaptchaToken = (ctx: any) => {
	const auth = ctx?.req?.headers["recaptcha-token"];
	if (!auth) throw ErrMsg(ERROR_CODE.RECAPTCHA_TOKEN_REQUIRED);
	return auth;
};
const calculateAtomicPrice = (price: number | string) =>
	BigInt(Number(price) * Number(PRICE_ATOMIC)).toString();

const convertPriceToAtomic = (dataPrice: DataPrice) => {
	const _dataPrice: any = { ...dataPrice };
	for (const [key, value] of Object.entries(dataPrice)) {
		const isDate = value instanceof Date && !isNaN(value.valueOf());
		if (!isDate)
			_dataPrice[key] = calculateAtomicPrice((value || 0).toString());
	}
	return _dataPrice as {
		open: string;
		close: string;
		highest: string;
		lowest: string;
		chainlink_price: string;
		timestamp: Date;
	};
};



export {
	GetSignMessage,
	EncodeToken,
	VerifyAuthorization,
	GetAuthorization,
	GetRecaptchaToken,
	getPrice,
	calculateAtomicPrice,
	convertPriceToAtomic,
	getPriceChainLink,
};
