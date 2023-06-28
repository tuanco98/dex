import { ErrorHandler } from "../lib/error_handler";
import { InitCron } from ".";
import { DAO } from "../infra/database/mongo/methods";
import { TIME_UPDATE_POOL_BALANCE } from "../config";
import { toDecimal128 } from "../infra/database/mongo/methods/helper";

const handle_update_pool_balance = async () => {
	try {
		const from = new Date(0);
		const to = new Date();
		const totalUserPnl = await DAO.trades.GetTotalPNL(from, to);
		const totalFee = await DAO.fee_paid_events.totalFee(from, to);
		const totalDepositMinusTotalWithdraw =
			await DAO.pool_events.getTotalDepositMinusTotalWithdraw(from, to);
		const pnlPool = BigInt(totalUserPnl.toString()) * BigInt(-1) + BigInt(totalFee.toString());
		const poolBalance = BigInt(pnlPool) + BigInt(totalDepositMinusTotalWithdraw.toString());
		const convertPoolBalanceToDecimal = toDecimal128(poolBalance);
		await DAO.pool_balances.createNewBalance(convertPoolBalanceToDecimal);
	} catch (error) {
		ErrorHandler(error, {}, cron_update_pool_balance.name);
	}
};

export const cron_update_pool_balance = () =>
	InitCron(TIME_UPDATE_POOL_BALANCE, handle_update_pool_balance);
