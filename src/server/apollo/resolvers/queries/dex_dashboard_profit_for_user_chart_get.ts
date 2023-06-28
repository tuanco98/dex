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
type ProfitUserReturnType = {
    id: string
    totalLossPnl: string
    totalProfitPnl: string
}

export const dex_dashboard_profit_for_user_chart_get = async (_, args: any) => {
    try {
        const input = args as InputType;
        const filter = input.filter ? input.filter : {
            from: new Date(0).getTime(),
            to: new Date().getTime(),
            unit: 'hour' as EUnitDateTrunc,
            binSize: 1
        }
        const get_data = await DAO.trades.GetTotalProfitPositionForUserChart(filter) as ProfitUserReturnType[]
        const result = get_data.map(el => {
            return {
                id: new Date(el.id).getTime(),
                totalLossPnl: el.totalLossPnl.toString(),
                totalProfitPnl: el.totalProfitPnl.toString()
            }
        })
        return {
            totalItem: result.length,
            data: result
        }
    } catch (e) {
        ErrorHandler(e, { args }, dex_dashboard_profit_for_user_chart_get.name).throwErr();
    }
}