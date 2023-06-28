import { DAO } from "../../../../infra/database/mongo/methods";
import { EUnitDateTrunc } from "../../../../infra/database/mongo/methods/helper";
import { ErrorHandler } from "../../../../lib/error_handler";

type FilterType = {
    from: number,
    to: number,
    unit: EUnitDateTrunc,
    binSize: number
}
type InputType = { filter?: FilterType }
type PoolEventReturnType = {
    id: string
    totalDeposit: string
    totalWithdraw: string
}

export const dex_dashboard_pool_event_chart_get = async (_, args: any) => {
    try {
        const input = args as InputType;
        const filter = input.filter ? input.filter : {
            from: 0,
            to: new Date().getTime(),
            unit: 'hour' as EUnitDateTrunc,
            binSize: 1
        }
        const get_data = await DAO.pool_events.GetPoolEventsChart(filter) as PoolEventReturnType[]
        console.log(get_data)
        const result = get_data.map(el => {
            return {
                id: new Date(el.id).getTime(),
                totalDeposit: el.totalDeposit.toString(),
                totalWithdraw: el.totalWithdraw.toString()
            }
        })
        return {
            totalItem: result.length,
            data: result
        }
    } catch (e) {
        ErrorHandler(e, { args }, dex_dashboard_pool_event_chart_get.name).throwErr();
    }
}