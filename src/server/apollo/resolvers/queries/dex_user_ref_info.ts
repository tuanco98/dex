import { Decimal128 } from "mongodb";
import { BPS, SYSTEM_REF_PROFIT_SHARE_RATE } from "../../../../config";
import { DAO } from "../../../../infra/database/mongo/methods";
import { collections } from "../../../../infra/database/mongo/mongo";
import {
	ErrMsg,
	ErrorHandler,
	ERROR_CODE,
} from "../../../../lib/error_handler";
import { request_validator } from "../../../../lib/validate";
import { getPositionSize } from "../../../../infra/database/mongo/methods/helper";

/**
 * dex_get_signature
 * @param parent
 * @param {UserRefInfoInput} args
 * @param ctx
 * @return {UserRefInfoOutput}
 */

type TGetAmountOrders = {
	amount: Decimal128;
	leverage: number;
	openFee: Decimal128;
};

export const dex_user_ref_info = async (_, args: any) => {
	try {
		const address = args.address.toLowerCase();
		request_validator.ValidateMissing({ address });
		const getDataRef = await DAO.users.GetUserByAddress(address);
		if (!getDataRef.ref_code) throw ErrMsg(ERROR_CODE.USER_NOT_HAVE_REF_CODE);
		const getDataFollowRef = await collections.users
			.find({ sponsor: getDataRef.ref_code })
			.project({ _id: 0, address: 1 })
			.toArray();
		const dataAddressFollowRef = getDataFollowRef.map((data) => data.address);
		const getAmountOrders = (await collections.trades
			.find({
				owner: { $in: dataAddressFollowRef },
				openTx: { $exists: true },
			})
			.project({ _id: 0, amount: 1, leverage: 1, openFee: 1 })
			.toArray()) as TGetAmountOrders[];
		let total_open_volume = "0";
		let total_open_fee = "0";
		getAmountOrders.forEach((data) => {
			const positionSize = getPositionSize(BigInt(data.amount.toString()), data.leverage)
			total_open_volume = (positionSize + BigInt(total_open_volume)).toString();
			total_open_fee = (BigInt(data.openFee?.toString() || "0") + BigInt(total_open_fee)).toString();
		});
		const total_usdc_profits = (BigInt(total_open_fee) * SYSTEM_REF_PROFIT_SHARE_RATE) / BPS;
		const resultDataRefInfo = {
			ref_code: getDataRef.ref_code,
			total_users: getDataFollowRef.length,
			total_open_volume,
			total_usdc_profits: total_usdc_profits.toString(),
			unclaimed_usdc_rewards: getDataRef?.unclaim_commission?.toString() || 0,
		};
		return resultDataRefInfo;
	} catch (error) {
		ErrorHandler(error, args, dex_user_ref_info.name).throwErr();
	}
};
