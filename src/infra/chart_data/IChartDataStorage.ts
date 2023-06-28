interface IChartData {
    timestamp: Date
    open: string
    lowest: string
    highest: string
    close: string
}

interface IChartDataStorage {
    pair_id: number,
    time_range: number,
    from: Date,
    to: Date
    storage: IChartData[]
    addData: (new_chart_data: IChartData[]) => void
    getData: (from: Date, to: Date) => IChartData[]
    getMissingDataTime: (from: Date, to: Date) => { from: Date, to: Date } | null
    setFrom: (from: Date) => void
}

export {
    IChartData,
    IChartDataStorage
}


