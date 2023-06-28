import { privateKeyToAccount } from "viem/accounts";
import { viemWalletClient } from "../../../../infra/blockchain/viem";
import { GetSignMessage } from "../../helper";
import { ApiHandlerWrapper, TApiCallBack } from "./template";

/**
 * dex_get_signature
 * @param parent
 * @param {LoginInput} args
 * @param ctx
 * @return {string}
 */

const dex_get_signature_callback: TApiCallBack = async (_, args: any) => {
	const { private_key, timestamp } = args as {
		private_key: string;
		timestamp: number;
	};
	return viemWalletClient.signMessage({
		account: privateKeyToAccount(`0x${private_key}`),
		message: GetSignMessage(timestamp),
	});
};

const dex_get_signature = ApiHandlerWrapper(
	"dex_get_signature",
	dex_get_signature_callback,
);

export { dex_get_signature };
