import { DAO } from "../../../../infra/database/mongo/methods";
import { mongo } from "../../../../infra/database/mongo/mongo";
import {
    ERROR_CODE,
    ErrMsg,
    ErrorHandler,
    validateMissing,
} from "../../../../lib/error_handler";
import { GetAuthorization, VerifyAuthorization } from "../../helper";
import { ReadNotifyInput } from "../../input/readNotificationInput";

export const dex_user_read_notification = async (_, args: any, ctx: any) => {
	const session = mongo.startSession();
	try {
		const { readType, id } = args as ReadNotifyInput;
		validateMissing({ readType });
		const authorization = GetAuthorization(ctx);
		const { address } = await VerifyAuthorization(authorization);
		await session.withTransaction(async () => {
			switch (readType) {
				case "ALL": {
					await DAO.notifications.ReadNotifications(address, session);
					break;
				}
				case "SINGLE": {
					validateMissing({ id });
					await DAO.notifications.ReadNotification(id, session);
					break;
				}
				default: {
					throw ErrMsg(ERROR_CODE.INVALID_PARAMS, "readType");
				}
			}
		});
        return 'Success'
	} catch (e: any) {
        if (session.inTransaction()) await session.abortTransaction()
		ErrorHandler(e, { args }, dex_user_read_notification.name).throwErr();
	} finally {
        await session.endSession()
    }
};
