import { IS_DEBUG, SERVER_CODE } from "../config";
import { CaptureException } from "../infra/logging/sentry";
import { HTTP_ERROR_CODE } from "./http-error";
import { GetJSONStringify } from "./utils";

export const genCodeName = (msg: string, add_msg?: string) =>
	`${SERVER_CODE}:${msg} ${ErrCodeMessage[SERVER_CODE + msg]} ${add_msg || ""}`;

export const ErrMsg = (msg: string, add_msg?: string) => {
	const gen = genCodeName(msg, add_msg);
	return new Error(gen);
};
export const validateMissing = (object: any) => {
	for (const el in object) {
		if (object[el] === null || object[el] === undefined || object[el] === "")
			throw ErrMsg(ERROR_CODE.MISSING_PARAMS, el);
	}
};

/**
 * Show the error and capture exception to Sentry
 * @param e error
 * @param args params of user
 * @param funcName Name of function
 */

export function ErrorHandler(e: any, args: any, funcName: string) {
	let { message } = e;
	if (!message) message = "";
	const params = args;
	params.password = undefined;
	if (message.startsWith(`${SERVER_CODE}:`)) {
		if (IS_DEBUG) {
			const errCode =
				message.substring(0, SERVER_CODE.length) +
				message.substring(SERVER_CODE.length + 1);
			console.log(
				"\n========================================================================================\n",
			);
			console.log(
				"\x1b[33m%s\x1b[0m",
				`⚠️  WARNING : EXPECTED ERROR HAPPENED!\n`,
			);
			console.log("Function:", funcName);
			console.log(`Argument:`, JSON.parse(GetJSONStringify(params)));
			console.log(
				`Message:`,
				ErrCodeMessage[errCode]
					? ErrCodeMessage[errCode]
					: message.substring(SERVER_CODE.length + 1),
			);
			console.log(`Stack:`, e.stack);
			console.log(
				"\n========================================================================================",
			);
		}
	} else {
		console.log(
			"\n========================================================================================\n",
		);
		console.log(
			"\x1b[31m%s\x1b[0m",
			`🔥  🔥  🔥  DANGER : UNEXPECTED ERROR HAPPENED!\n `,
		);
		console.log("Function:", funcName);
		console.log(`Argument:`, JSON.parse(GetJSONStringify(params)));
		console.log(`Stack:`, e?.stack);
		console.log(
			"\n========================================================================================",
		);
		CaptureException(e, { args: JSON.parse(GetJSONStringify(args)) }, false);
	}
	return {
		throwErr: () => {
			throw e;
		},
	};
}

const ErrCodeMessage = {
	DEX000: "UNEXPECTED_ERROR",

	DEX100: "SIGNATURE_INVALID",
	DEX101: "AUTHORIZATION_REQUIRED",
	DEX102: "RECAPTCHA_TOKEN_REQUIRED",
	DEX103: "INVALID_RECAPTCHA_TOKEN",

	DEX200: "USER_NOT_FOUND",
	DEX201: "PERMIT_MISSING",
	DEX202: "ORDER_NOT_FOUND",
	DEX203: "USER_NOT_HAVE_REF_CODE",
	DEX204: "TRADE_NOT_EXIST",
	DEX205: "TRADE_CLOSED",
	DEX206: "ALREADY_FOLLOW",
	DEX207: "NOT_FOLLOW",
	DEX208: "CANT_COPY_YOURSELF",
	DEX209: "INVALID_COPY_AMOUNT",
	DEX210: "MASTER_NOT_EXISTS",
	DEX211: "NOT_OWNER",
	DEX212: "USER_NOT_ENOUGH_COMMISSION",
	DEX213: "USER_REQUEST_IS_PENDING",
	DEX214: "DATA_INVALID",
	DEX215: "REQUEST_HAS_BEEN_SUCCESS",
	DEX216: "CURRENT_EPOCH_NOT_EXIST",

	DEX300: "TRANSACTION_REVERT",
	DEX301: "INVALID_PERMIT",
	DEX302: "INSUFFICIENT_TOKEN",
	DEX303: "LOCKING_PERIOD",
	DEX304: "POOL_NOT_ENOUGH",
	DEX305: "INSUFFICIENT_ALLOWANCE",
	DEX306: "BASE_FEE_IS_TOO_HIGH",
	DEX307: "FEE_NOT_ENOUGH",
	DEX308: "INVALID_NONCE",

	DEX400: "MISSING_PARAMS",
	DEX401: "INVALID_PAGE",
	DEX402: "INVALID_PAGESIZE",
	DEX403: "INVALID_PARAMS",
	DEX404: "ADDRESS_INVALID",
	DEX405: "DURATION_INVALID",
	DEX406: "SIGNATURE_OUTDATE",
	DEX407: "REF_CODE_INVALID",
	DEX408: "REF_CODE_ALREADY_EXIST",
	DEX409: "INVALID_POSITION_SIZE",
	DEX410: "INVALID_LEVERAGE",
	DEX411: "INVALID_LIMIT_PRICE",
	DEX412: "SIGNATURE_EXISTS",
	DEX413: "RATE_LIMIT_REACHED",
	DEX414: "FAST_REQUEST",
	DEX415: "INVALID_MAX_AMOUNT_COPY",
	DEX416: "INVALID_SHARE_FEE",
	DEX417: "PAIR_NOT_SUPPORT",
	DEX418: "LESS_THAN_MIN_LEVERAGE",
	DEX419: "GREATER_THAN_MAX_LEVERAGE",
	DEX420: "MASTER_KEY_INVALID",
};

export const ERROR_CODE = {
	//==========UNEXPECTED ERROR==========
	UNEXPECTED_ERROR: "000",
	//==========AUTH==============
	SIGNATURE_INVALID: "100",
	AUTHORIZATION_REQUIRED: "101",
	RECAPTCHA_TOKEN_REQUIRED: "102",
	INVALID_RECAPTCHA_TOKEN: "103",

	//==========FETCH DATA==========
	USER_NOT_FOUND: "200",
	PERMIT_MISSING: "201",
	ORDER_NOT_FOUND: "202",
	USER_NOT_HAVE_REF_CODE: "203",
	TRADE_NOT_EXIST: "204",
	TRADE_CLOSED: "205",
	ALREADY_FOLLOW: "206",
	NOT_FOLLOW: "207",
	CANT_COPY_YOURSELF: "208",
	INVALID_COPY_AMOUNT: "209",
	MASTER_NOT_EXISTS: "210",
	NOT_OWNER: "211",
	USER_NOT_ENOUGH_COMMISSION: "212",
	USER_REQUEST_IS_PENDING: "213",
	DATA_INVALID: "214",
	REQUEST_HAS_BEEN_SUCCESS: "215",
	CURRENT_EPOCH_NOT_EXIST: "216",
	//==========ON CHAIN==============
	TRANSACTION_REVERT: "300",
	INVALID_PERMIT: "301",
	INSUFFICIENT_TOKEN: "302",
	LOCKING_PERIOD: "303",
	POOL_NOT_ENOUGH: "304",
	INSUFFICIENT_ALLOWANCE: "305",
	BASE_FEE_IS_TOO_HIGH: "306",
	FEE_NOT_ENOUGH: "307",
	INVALID_NONCE: "308",
	//==========PARAMS==============
	MISSING_PARAMS: "400",
	INVALID_PAGE: "401",
	INVALID_PAGESIZE: "402",
	INVALID_PARAMS: "403",
	ADDRESS_INVALID: "404",
	DURATION_INVALID: "405",
	SIGNATURE_OUTDATE: "406",
	REF_CODE_INVALID: "407",
	REF_CODE_ALREADY_EXIST: "408",
	INVALID_POSITION_SIZE: "409",
	INVALID_LEVERAGE: "410",
	INVALID_LIMIT_PRICE: "411",
	SIGNATURE_EXISTS: "412",
	RATE_LIMIT_REACHED: "413",
	FAST_REQUEST: "414",
	INVALID_MAX_AMOUNT_COPY: "415",
	INVALID_SHARE_FEE: "416",
	PAIR_NOT_SUPPORT: "417",
	LESS_THAN_MIN_LEVERAGE: "418",
	GREATER_THAN_MAX_LEVERAGE: "419",
	MASTER_KEY_INVALID: "420",

	//==========SERVER==============
	SERVER_MAINTAINED: "501",
	//==========BUSINESS==============
};

export const getHTTPErrorCode = (e: Error) => {
	const start_message = e.message.substring(0, SERVER_CODE.length + 2);
	switch (start_message) {
		case `${SERVER_CODE}:1`:
			return HTTP_ERROR_CODE.OK_200;
		case `${SERVER_CODE}:2`:
			return HTTP_ERROR_CODE.OK_200;
		case `${SERVER_CODE}:4`:
			return HTTP_ERROR_CODE.BAD_REQUEST_400;
		default:
			return HTTP_ERROR_CODE.OK_200;
	}
};

export const getErrorMessage = (error_code: string) => {
	const code_name = `${SERVER_CODE}${error_code}`;
	return ErrCodeMessage[code_name];
};
