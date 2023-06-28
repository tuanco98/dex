import {
	MILLISECOND_PER_ONE_DAY,
	MILLISECOND_PER_ONE_SEC,
	SECOND_OF_ONE_DAY,
	SECOND_OF_ONE_HOUR,
} from "./constants";

class TimeSystem {
	private _msOfOneDay: number;
	private _msOfOneWeek: number;
	constructor(options?: { msOfOneDay?: number; msOfOneWeek?: number }) {
		this._msOfOneDay = options?.msOfOneDay || 86400000;
		this._msOfOneWeek = options?.msOfOneWeek || 86400000 * 7;
	}

	getNowInMs() {
		const now = +new Date();
		return now;
	}

	getTimeToDayInMs() {
		const now = new Date();
		return {
			start: now.setUTCHours(0, 0, 0, 0),
			end: now.setUTCHours(23, 59, 59, 999),
		};
	}

	checkInTime(fromMs: number, toMs: number) {
		const now = new Date().getTime();
		if (now >= fromMs && now <= toMs) {
			return true;
		}
		return false;
	}

	getDayNo() {
		return ~~(new Date().getTime() / this._msOfOneDay);
	}

	getStartAndEndOfHour() {
		const now = new Date();
		return {
			start: now.setUTCMinutes(0, 0, 0),
			end: now.setUTCMinutes(59, 59, 999),
		};
	}

	getDateInFuture(
		_current: Date,
		options?: {
			seconds?: number;
			minutes?: number;
			hours?: number;
			days?: number;
		},
	) {
		const current = _current || new Date();
		const next_seconds = options?.seconds || 0;
		const next_minutes = options?.minutes || 0;
		const next_hours = options?.hours || 0;
		const next_days = options?.days || 0;
		return new Date(
			current.getTime() +
				next_seconds * MILLISECOND_PER_ONE_SEC +
				next_minutes * MILLISECOND_PER_ONE_SEC * 60 +
				next_hours * MILLISECOND_PER_ONE_SEC * SECOND_OF_ONE_HOUR +
				next_days * MILLISECOND_PER_ONE_DAY,
		);
	}
}

export const timeSystem = new TimeSystem({
	msOfOneDay: SECOND_OF_ONE_DAY * 1000,
});
