import { PRICE_ATOMIC } from "../../../../config";
import { GetPoolBalance } from "../../../../infra/blockchain/viem/contract/pool_contract/method/PoolContract";
import { ClosePositionGasLess } from "../../../../infra/blockchain/viem/contract/processor_contract/method/ProcessorContract";
import {
	isBaseFeeAccept,
	isMatchAddress,
} from "../../../../infra/blockchain/viem/viem.helper";
import { DAO } from "../../../../infra/database/mongo/methods";
import { getPNL } from "../../../../infra/database/mongo/methods/helper";
import { PushNewNotification } from "../../../../infra/notification";
import { verifySignatureClosePositionGasLess } from "../../../../lib/auth/signature_close_order";
import { ErrorHandler } from "../../../../lib/error_handler";
import { getPrice } from "../../helper";
import { ClosePosition } from "../../input/closePosition";
import {
	ERROR_CODE,
	ErrMsg,
	validateMissing,
} from "./../../../../lib/error_handler";

/**
 * Example
 * @param parent
 * @param {ClosePosition} args
 * @param ctx
 * @return {String}
 */
export const dex_user_close_gasless_order = async (_, args: any) => {
	try {
		const { orderId, gasLess } = args as ClosePosition;

		validateMissing({
			orderId,
			owner: gasLess.owner,
			signature: gasLess.signature,
		});
		const verify_sign = await verifySignatureClosePositionGasLess(
			orderId,
			gasLess,
		);
		if (!verify_sign) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
		const trade = await DAO.trades.GetTradeById(orderId);
		if (!trade) throw ErrMsg(ERROR_CODE.TRADE_NOT_EXIST);
		if (!isMatchAddress(trade.owner, gasLess.owner))
			throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID, "owner not match");
		if (trade.closeTx) throw ErrMsg(ERROR_CODE.TRADE_CLOSED);

		await isBaseFeeAccept();
		const current_price = getPrice(trade.pairId);
		const pnl = getPNL(
			trade.isLong,
			(BigInt(Math.floor(current_price * 1e8)) * PRICE_ATOMIC) / BigInt(1e8),
			BigInt(trade.entryPrice.toString()),
			BigInt(trade.amount.toString()),
			trade.leverage,
			BigInt(trade.fundingTracker?.toString() || "0"),
			BigInt(trade.fundingTracker?.toString() || "0"),
		).toString();
		const pool_balance = await GetPoolBalance();
		if (pool_balance < BigInt(pnl)) throw ErrMsg(ERROR_CODE.POOL_NOT_ENOUGH);
		const jobId = await ClosePositionGasLess(orderId, gasLess);
		await PushNewNotification({
			address: gasLess.owner,
			type: 'ClosePosition',
			payload: { jobId },
			jobId,
		});
		return "success";
	} catch (e) {
		ErrorHandler(e, { args }, dex_user_close_gasless_order.name).throwErr();
	}
};
