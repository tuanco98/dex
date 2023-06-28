import { MILLISECOND_PER_ONE_SEC } from "../../lib/constants";
import { IChartData, IChartDataStorage } from "./IChartDataStorage";

class ChartDataStorage implements IChartDataStorage {
	from: Date;
	to: Date;
	storage: IChartData[];
	constructor(public pair_id: number, public time_range: number) {
		this.from = new Date();
		this.to = new Date(0);
		this.storage = [];
	}
	addData: (new_chart_data: IChartData[]) => void = (new_chart_data) => {
		const _new_chart_data = [...new_chart_data];
		_new_chart_data.pop();
		const _from = _new_chart_data[0]?.timestamp;
		const _to = _new_chart_data[_new_chart_data.length - 1]?.timestamp;
		if (!_from) return;
		if (_from < this.from) {
			this.storage = [
				..._new_chart_data.filter(
					(el) => el.timestamp >= _from && el.timestamp < this.from,
				),
				...this.storage,
			];
			this.from = new Date(_from);
			this.to = new Date(Math.max(_to.getTime(), this.to.getTime()));
		}
		if (_to > this.to) {
			this.storage = [
				...this.storage,
				..._new_chart_data.filter(
					(el) => el.timestamp > this.to && el.timestamp <= _to,
				),
			];
			this.to = new Date(_to);
			this.from = new Date(Math.min(_from.getTime(), this.from.getTime()));
		}
		return;
	};
	getData: (from: Date, to: Date) => IChartData[] = (from, to) => {
		return this.storage.filter(
			(el) => el.timestamp >= from && el.timestamp <= to,
		);
	};
	getMissingDataTime: (
		from: Date,
		to: Date,
	) => { from: Date; to: Date } | null = (from, to) => {
		const isInRangeData = from >= this.from && to <= this.to;
		const isOutRangeData = from < this.from && to > this.to;
		if (isInRangeData) return null;
		if (isOutRangeData) return { from, to };
		if (from < this.from)
			return {
				from,
				to: new Date(
					Math.min(this.from.getTime(), to.getTime()) +
						this.time_range * 60 * MILLISECOND_PER_ONE_SEC,
				),
			};
		if (to > this.to)
			return {
				from: new Date(
					Math.max(this.to.getTime(), from.getTime()) -
						this.time_range * 60 * MILLISECOND_PER_ONE_SEC,
				),
				to,
			};
		return null;
	};
	setFrom: (from: Date) => void = (from) => {
		if (from < this.from) {
			this.from = from;
		}
	};
}

export { ChartDataStorage };
