import { config } from "dotenv";
import {
	getArrStringFromEnv,
	getBooleanFromEnv,
	getEnvAddress,
	getEnvBigInt,
	getEnvString,
	getFloatFromEnv,
	getIntFromEnv,
} from "./lib/config.helper";

const path = ".env";
console.table({ env_path: path });
config({ path });

export const NODE_ENV = getEnvString("NODE_ENV");
export const SERVER_NAME = getEnvString("SERVER_NAME");
export const SENTRY_DNS = getEnvString("SENTRY_DNS");
export const MONGO_URI = getEnvString("MONGO_URI");
export const MONGO_DB_NAME = getEnvString("MONGO_DB_NAME");
export const REDIS_URI = getEnvString("REDIS_URI");
export const REDIS_PREFIX = getEnvString("REDIS_PREFIX");
export const GRAPHQL_PORT = getEnvString("GRAPHQL_PORT");
export const SERVER_CODE = getEnvString("SERVER_CODE");
export const TELEGRAM_BOT_TOKEN = getEnvString("TELEGRAM_BOT_TOKEN");
export const PYTH_SERVICE_ENDPOINT = getEnvString("PYTH_SERVICE_ENDPOINT");

export const REDIS_DB_NUMBER = getIntFromEnv("REDIS_DB_NUMBER");
export const PRICE_RANGE_PERCENT = getFloatFromEnv("PRICE_RANGE_PERCENT");

export const USDC_TOKEN_CONTRACT_ADDRESS = getEnvAddress(
	"USDC_TOKEN_CONTRACT_ADDRESS",
);
export const POSITION_CONTRACT_ADDRESS = getEnvAddress(
	"POSITION_CONTRACT_ADDRESS",
);
export const POOL_CONTRACT_ADDRESS = getEnvAddress("POOL_CONTRACT_ADDRESS");
export const PROFIT_SHARE_CONTRACT_ADDRESS = getEnvAddress(
	"PROFIT_SHARE_CONTRACT_ADDRESS",
);
export const PAIR_CONTRACT_ADDRESS = getEnvAddress("PAIR_CONTRACT_ADDRESS");
export const FUNDING_CONTRACT_ADDRESS = getEnvAddress(
	"FUNDING_CONTRACT_ADDRESS",
);
export const PROCESSOR_CONTRACT_ADDRESS = getEnvAddress(
	"PROCESSOR_CONTRACT_ADDRESS",
);
export const OPEN_POSITION_CONTRACT_ADDRESS = getEnvAddress(
	"OPEN_POSITION_CONTRACT_ADDRESS",
);
export const EDIT_POSITION_CONTRACT_ADDRESS = getEnvAddress(
	"EDIT_POSITION_CONTRACT_ADDRESS",
);
export const BATCH_CALL_CONTRACT_ADDRESS = getEnvAddress(
	"BATCH_CALL_CONTRACT_ADDRESS",
);
export const CHAINLINK_CONTRACT_ADDRESS = getEnvAddress(
	"CHAINLINK_CONTRACT_ADDRESS",
);

export const RECAPTCHA_SECRET_KEY = getEnvString("RECAPTCHA_SECRET_KEY");
export const TIME_UPDATE_POOL_BALANCE = getEnvString(
	"TIME_UPDATE_POOL_BALANCE",
);
export const MASTER_KEY = getEnvString("MASTER_KEY");
export const PRIVATE_KEY_REWARD_COMMISSION = getEnvString(
	"PRIVATE_KEY_REWARD_COMMISSION",
);
export const BASE_FEE_ACCEPT = getEnvString("BASE_FEE_ACCEPT");

export const AVG_BLOCK_TIME_SEC = getIntFromEnv("AVG_BLOCK_TIME_SEC");
export const CALCULATE_APR_CIRCLE_TIME = getIntFromEnv(
	"CALCULATE_APR_CIRCLE_TIME",
);
export const EXECUTION_FEE = getIntFromEnv("EXECUTION_FEE");

export const ANTI_REORG_BLOCK_NUMBER = getEnvBigInt("ANTI_REORG_BLOCK_NUMBER");
export const TRADING_CONTRACT_START_BLOCK = getEnvBigInt(
	"TRADING_CONTRACT_START_BLOCK",
);
export const TRADING_CONTRACT_STEP_BLOCK = getEnvBigInt(
	"TRADING_CONTRACT_STEP_BLOCK",
);
export const PAIR_CONTRACT_START_BLOCK = getEnvBigInt(
	"PAIR_CONTRACT_START_BLOCK",
);
export const IS_FORK = getBooleanFromEnv("IS_FORK");
export const IS_DEBUG = getBooleanFromEnv("IS_DEBUG");
export const IS_SERVER_MAINTAINED = getBooleanFromEnv("IS_SERVER_MAINTAINED");
export const IS_USE_PLAYGROUND = getBooleanFromEnv("IS_USE_PLAYGROUND");
export const ENABLE_TELEGRAM = getBooleanFromEnv("ENABLE_TELEGRAM");

export const PRICE_ATOMIC = BigInt(1e18);
export const USDC_ATOMIC = BigInt(1e6);
export const ROUND_UP_TO_DECIMALS = 3n;
export const SYSTEM_REF_PROFIT_SHARE_RATE = BigInt(1e5);
export const OPEN_FEE_RATE = 800n;
export const CLOSE_FEE_RATE = 800n;
export const BPS = BigInt(1e6);
export const LIQUIDATION_RATE = 950000n;
export const BASE_PRICE = BigInt(2e9);

export const MIN_SIZE = getEnvBigInt("MIN_SIZE");
export const MIN_FIXED_AMOUNT_COPY = getEnvBigInt("MIN_FIXED_AMOUNT_COPY");
export const MIN_BALANCE_BOT_ACCEPT_TRIGGER = getEnvBigInt(
	"MIN_BALANCE_BOT_ACCEPT_TRIGGER",
);
export const DEBUG_LEVEL = getArrStringFromEnv("DEBUG_LEVEL", ",");
export const PRIVATE_KEYS_BOT_TRIGGER_TRADING_CONTRACT = getArrStringFromEnv(
	"PRIVATE_KEYS_BOT_TRIGGER_TRADING_CONTRACT",
	",",
);
export const VIEM_PROVIDERS = getArrStringFromEnv("VIEM_PROVIDERS", ",");

export const LIST_CONTRACT = [
	FUNDING_CONTRACT_ADDRESS,
	POOL_CONTRACT_ADDRESS,
	POSITION_CONTRACT_ADDRESS,
	OPEN_POSITION_CONTRACT_ADDRESS,
	PAIR_CONTRACT_ADDRESS,
	EDIT_POSITION_CONTRACT_ADDRESS,
	PROCESSOR_CONTRACT_ADDRESS,
	PROFIT_SHARE_CONTRACT_ADDRESS,
];
