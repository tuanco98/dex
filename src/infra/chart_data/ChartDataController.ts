import { ChartDataStorage } from "./ChartDataStorage";
import { IChartDataController } from "./IChartDataController";
import { IChartDataStorage } from "./IChartDataStorage";

class ChartDataController implements IChartDataController {
	_storages: IChartDataStorage[] = [];
	addStorage: (storage: IChartDataStorage) => void = (storage) => {
		const isExist = this._storages.includes(storage);
		if (isExist) {
			return console.log(
				"ChartDataController: storage has been added already.",
			);
		}

		console.log("ChartDataController: added an storage.");
		this._storages.push(storage);
	};
	getStorage: (pair_id: number, time_range: number) => IChartDataStorage = (
		pair_id,
		time_range,
	) => {
		const index = this._storages.findIndex(
			(el) => el.pair_id === pair_id && el.time_range === time_range,
		);
		if (index < 0) {
			const new_storage = new ChartDataStorage(pair_id, time_range);
			this.addStorage(new_storage);
			return new_storage;
		}
		return this._storages[index];
	};
	removeStorage: (storage: IChartDataStorage) => void = (storage) => {
		const observerIndex = this._storages.indexOf(storage);
		if (observerIndex === -1) {
			return console.log("ChartDataController: Nonexistent storage.");
		}

		this._storages.splice(observerIndex, 1);
		console.log("ChartDataController: Detached an storage.");
	};
}

export { ChartDataController };
