import { Address } from "viem";
import { lowerCase } from "./utils";

const getEnvString = (key: string) => {
	if (!process.env[key]) throw new Error(`${key} must be provided`);
	return process.env[key] as string;
};
const getEnvAddress = (key: string) => {
	const envString = getEnvString(key)
	return lowerCase(envString) as Address;
};
const getEnvBigInt = (key: string) => {
	if (!process.env[key]) throw new Error(`${key} must be provided`);
	const value = getEnvString(key)
	return BigInt(value);
};

const getBooleanFromEnv = (key: string) => {
	const envString = getEnvString(key);
	if (!["true", "false"].includes(envString.toLowerCase()))
		throw new Error(`${key} must be true|false|TRUE|FALSE`);
	return JSON.parse(process.env[key] as string) as boolean;
};

const getArrStringFromEnv = (key: string, split_char: string) => {
	const envString = getEnvString(key);
	return envString.split(split_char);
};

const getArrIntFromEnv = (key: string, split_char: string) => {
	const envString = getEnvString(key);
	const array = envString.split(split_char).map(Number);
	const is_valid_number_array = array.every(
		(el) => !Number.isNaN(el) && el != null,
	);
	if (!is_valid_number_array) throw new Error(`${key} must be valid number`);
	return array;
};

const getIntFromEnv = (
	key: string,
	options?: { greater_than?: number; less_than?: number },
) => {
	const envString = getEnvString(key);
	const envNumber = parseInt(envString);
	if (options) {
		if (options.greater_than) {
			if (envNumber <= options.greater_than)
				throw new Error(
					`${key} must be int number and greater than ${options.greater_than}`,
				);
		}
		if (options.less_than) {
			if (envNumber >= options.less_than)
				throw new Error(
					`${key} must be int number and less than ${options.greater_than}`,
				);
		}
	}
	return parseInt(envString);
};

const getFloatFromEnv = (
	key: string,
	options?: { greater_than?: number; less_than?: number },
) => {
	const envString = getEnvString(key);
	const envNumber = Number(envString);
	if (Number.isNaN(envNumber)) throw new Error(`${key} must be float number`);
	if (options) {
		if (options.greater_than) {
			if (envNumber <= options.greater_than)
				throw new Error(
					`${key} must be float number and greater than ${options.greater_than}`,
				);
		}
		if (options.less_than) {
			if (envNumber >= options.less_than)
				throw new Error(
					`${key} must be float number and less than ${options.greater_than}`,
				);
		}
	}
	return envNumber;
};

export {
	getEnvString,
	getBooleanFromEnv,
	getArrStringFromEnv,
	getIntFromEnv,
	getFloatFromEnv,
	getArrIntFromEnv,
	getEnvBigInt,
	getEnvAddress
};
