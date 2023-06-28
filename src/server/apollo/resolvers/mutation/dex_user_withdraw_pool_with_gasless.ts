import {
	BalanceOf,
	LastDeposit,
	WithdrawPoolGasLess,
	_LOCK_PERIOD,
} from "../../../../infra/blockchain/viem/contract/pool_contract/method/PoolContract";
import { isBaseFeeAccept } from "../../../../infra/blockchain/viem/viem.helper";
import { PushNewNotification } from "../../../../infra/notification";
import { verifySignatureWithdrawGasLess } from "../../../../lib/auth/signature_withdraw_pool";
import {
	ERROR_CODE,
	ErrMsg,
	ErrorHandler,
	validateMissing,
} from "../../../../lib/error_handler";
import { isGreaterOrEqual } from "../../../../lib/utils";
import { WithdrawPoolGasLessInput } from "../../input/withdrawPoolGasLess";
/**
 * dex_user_withdraw_with_gasless
 * @param parent
 * @param {WithdrawPoolGasLessInput} args
 * @param ctx
 * @return {string}
 */

const validateInput = async (params: WithdrawPoolGasLessInput) => {
	const sec_timestamp_now = Math.floor(new Date().getTime() / 1000);
	validateMissing({ ...params, ...params.gasLess });
	const verify = await verifySignatureWithdrawGasLess(
		params.amount,
		params.gasLess,
	);
	if (!verify) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
	const [lock_period, last_deposit, balanceOf] = await Promise.all([
		_LOCK_PERIOD(),
		LastDeposit(params.gasLess.owner),
		BalanceOf(params.gasLess.owner),
	]);
	validateMissing({ lock_period, last_deposit, balanceOf });
	const is_lock_period = isGreaterOrEqual(
		(sec_timestamp_now - Number(last_deposit)).toString(),
		lock_period.toString(),
	);
	if (!is_lock_period) throw ErrMsg(ERROR_CODE.LOCKING_PERIOD);
	if (!isGreaterOrEqual(balanceOf, params.amount))
		throw ErrMsg(ERROR_CODE.INSUFFICIENT_TOKEN);
};
export const dex_user_withdraw_pool_with_gasless = async (_, args: any) => {
	try {
		const params = args as WithdrawPoolGasLessInput;
		await validateInput(params);
		await isBaseFeeAccept();
		const jobId = await WithdrawPoolGasLess(params.amount, params.gasLess);
		await PushNewNotification({
			address: params.gasLess.owner,
			type: 'WithdrawPool',
			payload: { jobId },
			jobId,
		});
		return "Success";
	} catch (e) {
		ErrorHandler(e, { args }, dex_user_withdraw_pool_with_gasless.name).throwErr();
	}
};
