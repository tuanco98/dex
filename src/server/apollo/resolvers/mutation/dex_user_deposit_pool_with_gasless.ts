import { POOL_CONTRACT_ADDRESS } from "../../../../config";
import {
	CheckBalance,
	IsAllowance,
} from "../../../../infra/blockchain/viem/contract/open_position_contract/method/OpenPositionContract";
import {
	DepositPoolGasLess,
	DepositPoolGasLessWithPermit,
} from "../../../../infra/blockchain/viem/contract/pool_contract/method/PoolContract";
import {
	isBaseFeeAccept,
	isMatchAddress,
} from "../../../../infra/blockchain/viem/viem.helper";
import { DAO } from "../../../../infra/database/mongo/methods";
import { TPermit } from "../../../../infra/database/mongo/models/Order";
import { PushNewNotification } from "../../../../infra/notification";
import { verifySignatureDepositGasLess } from "../../../../lib/auth/signature_deposit_pool";
import { ERROR_CODE, ErrMsg, ErrorHandler, validateMissing } from "../../../../lib/error_handler";
import { lowerCase } from "../../../../lib/utils";
import { DepositPoolGasLessInput } from "../../input/depositPoolGasLess";
/**
 * dex_user_deposit_with_gasless
 * @param parent
 * @param {DepositPoolGasLessInput} args
 * @param ctx
 * @return {string}
 */

const validateInput = async (params: DepositPoolGasLessInput) => {
	validateMissing({ ...params, ...params.gasLess });
	await isBaseFeeAccept();
	const verify = await verifySignatureDepositGasLess(
		params.amount,
		params.gasLess,
	);
	if (!verify) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
	await CheckBalance(params.gasLess.owner, params.amount);
};
export const dex_user_deposit_pool_with_gasless = async (_, args: any) => {
	try {
		const params = args as DepositPoolGasLessInput;
		await validateInput(params);
		const is_allowance = await IsAllowance(params.gasLess.owner, params.amount);
		let jobId: string | undefined = undefined;
		if (is_allowance) {
			jobId = await DepositPoolGasLess(params.amount, params.gasLess);
		} else {
			const user = await DAO.users.GetUserByAddress(
				lowerCase(params.gasLess.owner),
			);
			if (
				!(
					user.permit &&
					isMatchAddress(user.permit.spender, POOL_CONTRACT_ADDRESS)
				)
			)
				throw ErrMsg(ERROR_CODE.PERMIT_MISSING, "please submit permit");
			if (!isMatchAddress(user.permit.owner, params.gasLess.owner))
				throw ErrMsg(ERROR_CODE.INVALID_PERMIT);
			const permit: TPermit = user.permit;
			jobId = await DepositPoolGasLessWithPermit(
				params.amount,
				params.gasLess,
				permit,
			);
		}
		if (jobId) {
			await PushNewNotification({
				address: params.gasLess.owner,
				type: 'DepositPool',
				payload: { jobId, amount: params.amount },
				jobId,
			});
		}
		return "Success";
	} catch (e) {
		ErrorHandler(e, { args }, dex_user_deposit_pool_with_gasless.name).throwErr();
	}
};
