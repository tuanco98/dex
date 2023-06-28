import { Address, Hex } from "viem";
import { CONTRACT_ERROR } from "../infra/blockchain/viem/viem.helper";
import { DAO } from "../infra/database/mongo/methods";
import { TLogTrigger } from "../infra/database/mongo/models/LogTrigger";
import { mongo } from "../infra/database/mongo/mongo";
import { CaptureException } from "../infra/logging/sentry";
import {
	AddNewQueueTransaction,
	TQueueTransaction,
} from "../infra/queue_trigger/QueueTransaction";
import { ErrorHandler } from "../lib/error_handler";
import { GetJSONStringify } from "../lib/utils";

type EHandledDoneTriggerAction =
	| "Retry"
	| "Refresh"
	| "None"
	| "SystemError"
	| "Success";
enum EListMethods {
	// processor contract
	closePositions = "closePositions",
	closePosition = "closePosition",
	closePositionGasLess = "closePositionGasLess",

	// open position contract
	openLimitPosition = "openLimitPosition",
	openPositionGasLess = "openPositionGasLess",
	openLimitPositionWithPermit = "openLimitPositionWithPermit",
	openPositionGasLessWithPermit = "openPositionGasLessWithPermit",
	cancelGasLess = "cancelGasLess",
	cancel = "cancel",
	updateLimitGasLess = "updateLimitGasLess",
	executeCopy = "executeCopy",

	// edit position contract
	addCollateralGasLess = "addCollateralGasLess",
	removeCollateralGasLess = "removeCollateralGasLess",
	incPositionGasLess = "incPositionGasLess",
	decPositionGasLess = "decPositionGasLess",
	executeEditCopy = "executeEditCopy",

	// pool contract
	depositGasLess = "depositGasLess",
	depositGasLessWithPermit = "depositGasLessWithPermit",
	withdrawGasLess = "withdrawGasLess",

	// contract profit share
	withdrawEpochGasLess = "withdrawEpochGasLess",
}
const getActionHandle = (
	trigger_log: TLogTrigger,
): EHandledDoneTriggerAction => {
	if (trigger_log.error) {
		switch (trigger_log.error) {
			case CONTRACT_ERROR.AMOUNT:
				return "None";
			case CONTRACT_ERROR.CANT_SELF_EXECUTE:
				return "None";
			case CONTRACT_ERROR.CLOSED:
				return "None";
			case CONTRACT_ERROR.COPIED:
				return "None";
			case CONTRACT_ERROR.DEADLINE_NOT_VALID:
				return "None";
			case CONTRACT_ERROR.EXPIRED_COPY:
				return "None";
			case CONTRACT_ERROR.EXPIRE_INVALID:
				return "None";
			case CONTRACT_ERROR.FEE_NOT_ENOUGH:
				return "None";
			case CONTRACT_ERROR.INSUFFICIENT_ALLOWANCE:
				return "None";
			case CONTRACT_ERROR.INSUFFICIENT_BALANCE:
				return "None";
			case CONTRACT_ERROR.INVALID_MASTER:
				return "None";
			case CONTRACT_ERROR.LENGTH_DIFF:
				return "None";
			case CONTRACT_ERROR.LEVERAGE:
				return "None";
			case CONTRACT_ERROR.LIQUIDATE:
				return "Refresh";
			case CONTRACT_ERROR.LOCK_DEPOSIT:
				return "None";
			case CONTRACT_ERROR.MAX_COPIED:
				return "None";
			case CONTRACT_ERROR.MAX_FEE:
				return "None";
			case CONTRACT_ERROR.MAX_LEVERAGE:
				if (trigger_log.method === EListMethods.removeCollateralGasLess) {
					return "None";
				}
				return "None";
			case CONTRACT_ERROR.MIN_LEVERAGE:
				if (trigger_log.method === EListMethods.addCollateralGasLess) {
					return "None";
				}
				return "None";
			case CONTRACT_ERROR.MIN_SIZE:
				return "None";
			case CONTRACT_ERROR.NOT_EXIST:
				return "None";
			case CONTRACT_ERROR.NOT_HAVE:
				return "None";
			case CONTRACT_ERROR.NOT_MASTER_CLOSED:
				return "None";
			case CONTRACT_ERROR.NOT_MASTER_POSITION:
				return "None";
			case CONTRACT_ERROR.NOT_OWNER_CALL:
				return "None";
			case CONTRACT_ERROR.ONLY_THIS:
				return "None";
			case CONTRACT_ERROR.ORACLE_CANT_CLOSE:
				return "None";
			case CONTRACT_ERROR.OWNER:
				return "None";
			case CONTRACT_ERROR.PERMIT_OWNER:
				return "Refresh";
			case CONTRACT_ERROR.PERMIT_SENDER:
				return "Refresh";
			case CONTRACT_ERROR.POOL_BALANCE_NOT_ENOUGH:
				return "Refresh";
			case CONTRACT_ERROR.POOL_EMPTY:
				return "Refresh";
			case CONTRACT_ERROR.PNL:
				if (trigger_log.method === EListMethods.addCollateralGasLess) {
					return "None";
				}
				return "None";
			case CONTRACT_ERROR.WRONG_CLOSE_TYPE:
				return "Refresh";
			case CONTRACT_ERROR.CHAINLINK_NOT_READY:
				return "Retry";
			case CONTRACT_ERROR.WRONG_PRICE:
				return "None";
			case CONTRACT_ERROR.WRONG_SL_PRICE:
				return "Refresh";
			case CONTRACT_ERROR.WRONG_TP_PRICE:
				return "Refresh";
			case CONTRACT_ERROR.EXECUTION_REVERT:
				return "SystemError";
			case CONTRACT_ERROR.INTRINSIC_GAS_TOO_LOW:
				return "Retry";
			default:
				break;
		}
	}
	return "Success";
};

const cron = async () => {
	const session = mongo.startSession();
	const args: any = [];
	try {
		session.startTransaction();
		const unhandled_done_trigger_logs =
			await DAO.logs_trigger.GetUnhandledDoneTrigger(session);
		args.push = unhandled_done_trigger_logs;
		if (unhandled_done_trigger_logs.length) {
			for (const trigger_log of unhandled_done_trigger_logs) {
				const action = getActionHandle(trigger_log);
				switch (action) {
					case "Retry": {
						const queue: TQueueTransaction = {
							to: trigger_log.to as Address,
							method: trigger_log.method,
							data: trigger_log.data as Hex,
							params: trigger_log.data,
						};
						await AddNewQueueTransaction(queue, trigger_log.options);
						break;
					}
					case "Refresh": {
						if (trigger_log.method === EListMethods.closePositions) {
							const { orderIds } = trigger_log.params;
							if (orderIds) {
								await DAO.trades.common.updateMany(
									{ traderId: { $in: orderIds }, triggerStatus: "PENDING" },
									{ $set: { triggerStatus: "NONE", triggerId: "" } },
								);
							}
						}
						if (trigger_log.method === "") {
							const { orderIds } = trigger_log.params;
							if (orderIds) {
								await DAO.trades.common.updateMany(
									{ traderId: { $in: orderIds }, triggerStatus: "PENDING" },
									{ $set: { triggerStatus: "NONE", triggerId: "" } },
								);
							}
						}
						break;
					}
					case "None": {
						if (trigger_log.method === "closePositions") {
							const { orderIds } = trigger_log.params;
							if (orderIds) {
								await DAO.trades.common.updateMany(
									{ traderId: { $in: orderIds }, triggerStatus: "PENDING" },
									{
										$set: {
											triggerStatus: "FAIL",
											triggerError: trigger_log.error,
										},
									},
								);
							}
							//Notify for user
						}
						break;
					}
					case "SystemError": {
						//Notify for admin
						CaptureException(
							{ message: trigger_log.error },
							{ args: JSON.parse(GetJSONStringify(trigger_log)) },
							false,
						);
						break;
					}
					case "Success": {
						const { jobId } = trigger_log;
						if (
							[
								EListMethods.openLimitPosition,
								EListMethods.openPositionGasLess,
								EListMethods.openLimitPositionWithPermit,
								EListMethods.openPositionGasLessWithPermit,
							].includes(trigger_log.method)
						) {
							await DAO.orders.common.updateMany(
								{ triggerId: jobId },
								{ $set: { triggerStatus: "SUCCESS", isActive: false } },
							);
						} else {
							await DAO.trades.common.updateMany(
								{ triggerId: jobId },
								{ $set: { triggerStatus: "SUCCESS" } },
							);
						}
					}
					default:
						break;
				}
			}
			await DAO.logs_trigger.MarkHandledDoneTrigger(
				unhandled_done_trigger_logs.map((el) => el._id),
				session,
			);
		}
		await session.commitTransaction();
	} catch (e) {
		if (session.inTransaction()) {
			await session.abortTransaction();
		}
		ErrorHandler(e, args, "cron_update_handle_trigger").throwErr();
	} finally {
		await session.endSession();
		setTimeout(() => cron(), 1000);
	}
};

export { cron as cron_update_handle_trigger, EListMethods };
