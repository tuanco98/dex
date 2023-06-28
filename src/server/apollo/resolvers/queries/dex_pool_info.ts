import { BPS } from "../../../../config";
import { LiquidityShare } from "../../../../infra/blockchain/viem/contract/pool_contract/method/PoolContract";
import { DAO } from "../../../../infra/database/mongo/methods";
import { MILLISECOND_PER_ONE_DAY, PERCENT } from "../../../../lib/constants";
import { ErrorHandler } from "../../../../lib/error_handler";

const liquidityShare = async () => {
	const liquidity_share = await LiquidityShare();
	return BigInt(liquidity_share) / BPS;
};

let firstTimeDeposit: Date;
let getLiquidityShare: bigint;
export const dex_pool_info = async (_, args: any) => {
	try {
		if (!firstTimeDeposit)
			firstTimeDeposit = await DAO.pool_events.getFirstDepositTime();
		const from = firstTimeDeposit;
		const to = new Date();
		const totalUserPnl = await DAO.trades.GetTotalPNL(from, to);
		const totalFee = await DAO.fee_paid_events.totalFee(from, to);
		if (!getLiquidityShare) {
			getLiquidityShare = await liquidityShare();
		}
		const pnlPool =
			BigInt(totalUserPnl.toString()) * -1n +
			BigInt(totalFee.toString()) * getLiquidityShare;
		const avgBalancePool = await DAO.pool_balances.getAvgPoolBalance();
		if (
			avgBalancePool.length === 0 ||
			BigInt(Math.floor(avgBalancePool[0].avg_pool_balance.toString())) === 0n
		)
			return {
				apr: 0,
			};

		const round_up_to_decimal = 2;
		const round_up_to_decimal_factor = 10 ** round_up_to_decimal;
		const apr =
			(pnlPool *
				BigInt(
					Math.floor(
						(365 * MILLISECOND_PER_ONE_DAY) / (to.getTime() - from.getTime()),
					),
				) *
				BigInt(round_up_to_decimal_factor) *
				BigInt(PERCENT)) /
			BigInt(Math.floor(avgBalancePool[0].avg_pool_balance.toString()));
		return {
			apr: Number(apr) / round_up_to_decimal_factor,
		};
	} catch (e) {
		ErrorHandler(e, args, dex_pool_info.name).throwErr();
	}
};
