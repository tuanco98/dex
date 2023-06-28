import { DAO } from "../../../../infra/database/mongo/methods"
import { mongo } from "../../../../infra/database/mongo/mongo"
import { ErrMsg, ErrorHandler, ERROR_CODE } from "../../../../lib/error_handler"
import { request_validator } from "../../../../lib/validate"
import { GetAuthorization, VerifyAuthorization } from "../../helper"

/**
 * dex_user_set_permit
 * @param parent
 * @param {LoginInput} args
 * @param ctx
 * @return {string}
 */

export const dex_user_set_ref_code = async (_, args: any, ctx: any) => {
    const session = mongo.startSession()
    try {
        const ref_code = args.ref_code.toLowerCase()
        const authorization = GetAuthorization(ctx)
        const { address } = await VerifyAuthorization(authorization)
        request_validator.ValidateString(ref_code, { min: 1, max: 16 })
        const checkRefCode = ref_code.match(/[^A-Za-z0-9]/g)
        if (checkRefCode !== null) throw ErrMsg(ERROR_CODE.REF_CODE_INVALID)
        await session.withTransaction(async () => {
            const isRefCodeExist = await DAO.users.GetUserByRefCode(ref_code, session)
            if (isRefCodeExist) throw ErrMsg(ERROR_CODE.REF_CODE_ALREADY_EXIST)
            await DAO.users.SetRefCode(address, ref_code, session)
            await DAO.users.SetSponsor(address, session)
        })
        return "Success"
    } catch (e) {
        if (session.inTransaction()) await session.abortTransaction()
        ErrorHandler(e, { args }, dex_user_set_ref_code.name).throwErr()
    } finally {
        await session.endSession()
    }
}
