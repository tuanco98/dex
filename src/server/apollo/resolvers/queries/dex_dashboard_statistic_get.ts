import { DAO } from "../../../../infra/database/mongo/methods";
import { ErrorHandler } from "../../../../lib/error_handler";

export const dex_dashboard_statistic_get = async (_, args: any, ctx: any) => {
	try {
		const { filter } = args as {
			filter: "Daily" | "Weekly" | "Monthly" | "All";
		};
		const totalUniqueUser = await DAO.users.common.countDocuments()
		return {
			totalUniqueUser,
			totalUniqueUserOpenPosition: 0,
			totalOpenPosition: 0,
			totalQueueTransactionPending: 0,
			totalTriggerGasLess: 0,
			totalTriggerGasLessFail: 0,
			totalTriggerGasLessSuccess: 0,
			totalFeeTriggerGasLess: "10000000",
			totalFeeTriggerGasLessFail: "10000000",
			totalFeeTriggerGasLessSuccess: "10000000",
			totalOracleFeeTriggerGasLess: "10000000",
		}
	} catch (e: any) {
		ErrorHandler(e, { args }, dex_dashboard_statistic_get.name).throwErr();
	}
};
