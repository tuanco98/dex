import { CancelGasLess } from "../../../../infra/blockchain/viem/contract/open_position_contract/method/OpenPositionContract";
import { isBaseFeeAccept } from "../../../../infra/blockchain/viem/viem.helper";
import { DAO } from "../../../../infra/database/mongo/methods";
import { mongo } from "../../../../infra/database/mongo/mongo";
import {
	PushNewNotification
} from "../../../../infra/notification";
import { verifySignatureCancelGasLess } from "../../../../lib/auth/signature_cancel_gasless";
import { CancelLimitOrderInput } from "../../input/cancelLimitOrderInput";
import {
	ERROR_CODE,
	ErrMsg,
	ErrorHandler,
	validateMissing,
} from "../../../../lib/error_handler";

/**
 * dex_user_cancel_limit_order
 * @param parent
 * @param {CancelLimitOrderInput} args
 * @param ctx
 * @return {String}
 */
export const dex_user_cancel_limit_order = async (_, args: any) => {
	const session = mongo.startSession();
	try {
		const { _id, gasLess } = args as CancelLimitOrderInput;

		validateMissing({ _id, gasLess, ...gasLess });
		session.startTransaction();
		const order = await DAO.orders.GetOrderById({ _id, isActive: true }, session);
		if (!order) throw ErrMsg(ERROR_CODE.ORDER_NOT_FOUND)
		const verify = await verifySignatureCancelGasLess(order.signature, gasLess);
		if (!verify) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
		await isBaseFeeAccept();
		const jobId = await CancelGasLess(order.signature, gasLess);
		await DAO.orders.CancelLimitOrderActive(_id, session);
		await PushNewNotification({
			address: gasLess.owner,
			type: "CancelLimitOrder",
			payload: { jobId },
			jobId,
			session,
		});
		await session.commitTransaction();
		return "success";
	} catch (e) {
		if (session.inTransaction()) await session.abortTransaction();
		ErrorHandler(e, { args }, dex_user_cancel_limit_order.name).throwErr();
	} finally {
		await session.endSession();
	}
};
