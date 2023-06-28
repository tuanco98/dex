import { BPS, MIN_SIZE } from "../../../../config";
import { GasUsedL2Config } from "../../../../infra/blockchain/viem/contract/constants";
import {
	AddCollateralGasLess,
	DecreasePositionGasLess,
	IncreasePositionGasLess,
	RemoveCollateralGasLess,
} from "../../../../infra/blockchain/viem/contract/edit_position/method/EditPositionContract";
import {
	getFeeExecution,
	isBaseFeeAccept,
	isMatchAddress,
} from "../../../../infra/blockchain/viem/viem.helper";
import { DAO } from "../../../../infra/database/mongo/methods";
import { PushNewNotification } from "../../../../infra/notification";
import { verifySignatureEditCollateralGasLess } from "../../../../lib/auth/signature_edit_collateral";
import { verifySignatureEditPositionSizeGasLess } from "../../../../lib/auth/signature_edit_position_size";
import { ErrorHandler } from "../../../../lib/error_handler";
import { EditPositionInput } from "../../input/editPosition";
import {
	ERROR_CODE,
	ErrMsg,
	validateMissing,
} from "./../../../../lib/error_handler";

/**
 * Example
 * @param parent
 * @param {EditPositionInput} args
 * @param ctx
 * @return {String}
 */
export const dex_user_edit_position_gasless = async (_, args: any) => {
	try {
		const params = args as EditPositionInput;
		validateMissing({ ...params });
		const oracleFee =
			params.editType === "ADD_COLLATERAL" ||
			params.editType === "REMOVE_COLLATERAL"
				? getFeeExecution(
						BigInt(GasUsedL2Config.AddAndRemoveCollateralPosition),
						1n,
				  )
				: getFeeExecution(BigInt(GasUsedL2Config.IncAndDecPosition), 1n);
		if (BigInt(params.amount) <= BigInt(oracleFee))
			throw ErrMsg(ERROR_CODE.FEE_NOT_ENOUGH);
		const amount_after_minus_oracle_fee = BigInt(params.amount) - oracleFee;
		if (amount_after_minus_oracle_fee <= 0n)
			throw ErrMsg(
				ERROR_CODE.INVALID_PARAMS,
				"amount minus oracleFee must be greater than 0",
			);
		const trade = await DAO.trades.GetTradeById(params.id);
		if (!trade) throw ErrMsg(ERROR_CODE.TRADE_NOT_EXIST);
		if (!trade.isActive) throw ErrMsg(ERROR_CODE.TRADE_CLOSED);
		if (!isMatchAddress(trade.owner, params.gasLess.owner))
			throw ErrMsg(ERROR_CODE.NOT_OWNER);
		const pair = await DAO.pairs.get_pair_by_id(trade.pairId);
		if (!pair) throw ErrMsg(ERROR_CODE.PAIR_NOT_SUPPORT);
		const position_size =
			BigInt(trade.leverage) * BigInt(trade.amount.toString());
		await isBaseFeeAccept();
		let jobId: string | undefined = undefined;
		switch (params.editType) {
			case "ADD_COLLATERAL": {
				const verify_add_collateral =
					await verifySignatureEditCollateralGasLess(
						params.id,
						params.amount,
						params.editType,
						params.gasLess,
					);
				if (!verify_add_collateral) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
				const add_leverage =
					position_size /
					(BigInt(trade.amount.toString()) + amount_after_minus_oracle_fee);
				if (add_leverage < BigInt(pair.min_leverage.toString()))
					throw ErrMsg(ERROR_CODE.LESS_THAN_MIN_LEVERAGE, "!min-leverage");
				jobId = await AddCollateralGasLess(
					params.id,
					params.amount,
					params.gasLess,
				);
				break;
			}
			case "REMOVE_COLLATERAL": {
				const verify_remove_collateral =
					await verifySignatureEditCollateralGasLess(
						params.id,
						params.amount,
						params.editType,
						params.gasLess,
					);
				if (!verify_remove_collateral)
					throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
				const remaining_collateral =
					BigInt(trade.amount.toString()) - amount_after_minus_oracle_fee;
				const remove_leverage = position_size / remaining_collateral;
				if (remove_leverage > BigInt(pair.max_leverage))
					throw ErrMsg(ERROR_CODE.GREATER_THAN_MAX_LEVERAGE, "!max-leverage");
				const remaining_amount =
					BigInt(trade.amount.toString()) - amount_after_minus_oracle_fee;
				const remaining_position_size =
					(BigInt(trade.leverage.toString()) * remaining_amount) / BPS;
				if (remaining_position_size < MIN_SIZE)
					throw ErrMsg(ERROR_CODE.INVALID_POSITION_SIZE, "!min-size");
				jobId = await RemoveCollateralGasLess(
					params.id,
					params.amount,
					params.gasLess,
				);
				break;
			}
			case "INC_POSITION": {
				const verify_inc_position =
					await verifySignatureEditPositionSizeGasLess(
						params.id,
						params.amount,
						params.editType,
						params.gasLess,
					);
				if (!verify_inc_position) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
				jobId = await IncreasePositionGasLess(
					params.id,
					params.amount,
					params.gasLess,
				);
				break;
			}
			case "DEC_POSITION": {
				const verify_dec_position =
					await verifySignatureEditPositionSizeGasLess(
						params.id,
						params.amount,
						params.editType,
						params.gasLess,
					);
				if (!verify_dec_position) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
				if (BigInt(trade.amount.toString()) <= amount_after_minus_oracle_fee)
					throw ErrMsg(ERROR_CODE.INVALID_PARAMS, "!amount-dec");
				jobId = await DecreasePositionGasLess(
					params.id,
					params.amount,
					params.gasLess,
				);
				break;
			}
			default:
				throw ErrMsg(ERROR_CODE.INVALID_PARAMS, "Invalid editType");
		}
		if (jobId) {
			await PushNewNotification({
				address: params.gasLess.owner,
				type: 'EditPosition',
				payload: { jobId },
				jobId,
			});
		}
		return "success";
	} catch (e) {
		ErrorHandler(e, { args }, dex_user_edit_position_gasless.name).throwErr();
	}
};
