import { create_key_with_prefix } from ".";
import { MILLISECOND_PER_ONE_SEC } from "../../lib/constants";
import { ErrMsg, ERROR_CODE } from "../../lib/error_handler";
import { ioredis } from "./redis";

const create_rate_limit_id = (api_name: string, id: string) => {
	return `${api_name}.${id}`;
};
const getTimeFrame = (date_now: Date, interval_time_in_min: number) => {
	return Math.floor(
		date_now.getTime() / (interval_time_in_min * 60 * MILLISECOND_PER_ONE_SEC),
	);
};
/**
 * @param id string
 * @param interval_time_in_min example: 1 day= 60*24 min
 * @param rate_limit number
 * @returns
 */
const inc = async (options: {
	date_now: Date;
	id: string;
	interval_time_in_min: number;
	rate_limit: number;
}) => {
	try {
		const time_frame = getTimeFrame(
			options.date_now,
			options.interval_time_in_min,
		);
		const key = create_key_with_prefix(
			`rate_limit.${options.id}.${time_frame}`,
		);
		const value = await ioredis.get(key);
		const current_rate = Number(value || "0") + 1;
		if (current_rate > options.rate_limit)
			throw ErrMsg(ERROR_CODE.RATE_LIMIT_REACHED);
	} catch (e) {
		throw e;
	}
};
const set = async (options: {
	date_now: Date;
	id: string;
	interval_time_in_min: number;
	rate_limit: number;
}) => {
	try {
		const time_frame = getTimeFrame(
			options.date_now,
			options.interval_time_in_min,
		);
		const key = create_key_with_prefix(
			`rate_limit.${options.id}.${time_frame}`,
		);
		const multi = ioredis.multi();
		multi.incr(key);
		multi.expire(key, options.interval_time_in_min * 60);
		await multi.exec();
		return "Success";
	} catch (e) {
		throw e;
	}
};
export {
	inc as CheckRateLimit,
	set as SetRateLimit,
	getTimeFrame as GetTimeFrame,
	create_rate_limit_id as CreateRateLimitId,
};
