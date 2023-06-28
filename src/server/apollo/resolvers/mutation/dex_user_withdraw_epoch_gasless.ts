import { WithdrawEpochGasLess } from "../../../../infra/blockchain/viem/contract/profit_share/method/ProfitShareContract";
import { isBaseFeeAccept } from "../../../../infra/blockchain/viem/viem.helper";
import {
	PushNewNotification
} from "../../../../infra/notification";
import { verifySignatureWithdrawEpochGasLess } from "../../../../lib/auth/signature_withdraw_epoch";
import {
	ERROR_CODE,
	ErrMsg,
	ErrorHandler,
	validateMissing,
} from "../../../../lib/error_handler";
import { WithdrawEpochGasLessInput } from "../../input/withdrawEpochGasLessInput";

const validateInput = async (params: WithdrawEpochGasLessInput) => {
	validateMissing({ ...params, ...params.gasLess });
	const verify = await verifySignatureWithdrawEpochGasLess(
		params.epochs,
		params.gasLess,
	);
	if (!verify) throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
};
export const dex_user_withdraw_epoch_gasless = async (_, args: any) => {
	try {
		const params = args as WithdrawEpochGasLessInput;
		await validateInput(params);
		await isBaseFeeAccept();
		const jobId = await WithdrawEpochGasLess(params.epochs, params.gasLess);
		await PushNewNotification({
			address: params.gasLess.owner,
			type: "WithdrawEpoch",
			payload: { jobId },
			jobId,
		});
		return "Success";
	} catch (e) {
		ErrorHandler(e, { args }, dex_user_withdraw_epoch_gasless.name).throwErr();
	}
};
