import { IChartDataStorage } from "./IChartDataStorage"

interface IChartDataController {
    _storages: IChartDataStorage[]
    addStorage: (storage: IChartDataStorage) => void
    getStorage: (pair_id: number, time_range: number) => IChartDataStorage
    removeStorage: (storage: IChartDataStorage) => void
    
}

export {
    IChartDataController
}