import { DAO } from "../infra/database/mongo/methods"
import { mongo } from "../infra/database/mongo/mongo"
import { ErrorHandler } from "../lib/error_handler"

const cron = async () => {
    const session = mongo.startSession()
    const args: any = []
    try {
        session.startTransaction()
        const un_mapping_fee_paid_event = await DAO.fee_paid_events.GetUnMappingEvent(session)
        args.push = { un_mapping_fee_paid_event }
        //Mapping
        if (un_mapping_fee_paid_event) {
            await DAO.fee_paid_events.MappingPaidEvent(un_mapping_fee_paid_event, session)

        }
        await session.commitTransaction()
    } catch (e) {
        if (session.inTransaction()) {
            await session.abortTransaction()
        }
        ErrorHandler(e, args, "cron_update_commission").throwErr()
    } finally {
        await session.endSession()
        setTimeout(() => cron(), 1000)
    }
}

export {
    cron as cron_update_commission
}
