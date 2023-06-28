import { create_key_with_prefix } from ".";
import { GetJSONStringify } from "../../lib/utils";
import { ioredis } from "./redis";

type TSignature = {
	signature: string;
	timestamp: number;
};

const get = async (token: string) => {
	const key = create_key_with_prefix(`${token}`);
	const value = await ioredis.get(key);
	return value ? (JSON.parse(value) as TSignature) : null;
};

const set = async (
	token: string,
	signature: string,
	timestamp: number,
	duration: number,
) => {
	const key = create_key_with_prefix(`${token}`);
	const signature_value: TSignature = {
		signature,
		timestamp,
	};
	const value = await ioredis.setex(
		key,
		duration,
		GetJSONStringify(signature_value),
	);
	return value;
};

export { get as getUserToken, set as setUserToken };
