import { ChartDataController } from "../infra/chart_data/ChartDataController"
import { ChartDataStorage } from "../infra/chart_data/ChartDataStorage"

const test = () => {
    const chart_storage_controller = new ChartDataController()
    chart_storage_controller.addStorage(new ChartDataStorage(1, 60))
    const storage = chart_storage_controller.getStorage(1, 60)
    console.log(storage.getData(new Date(1677628800000), new Date()), storage.from, storage.to)
    console.log(storage.getMissingDataTime(new Date(0), new Date()))
}

export {
    test as ChartStorageControllerTest
}