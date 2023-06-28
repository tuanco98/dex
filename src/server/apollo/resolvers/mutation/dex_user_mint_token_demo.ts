import { getClientIp } from "request-ip";
import { Address, encodeFunctionData, parseEther } from "viem";
import {
	contractUSDCToken,
	viemWalletClient
} from "../../../../infra/blockchain/viem";
import { USDC_TOKEN_CONTRACT_ABI } from "../../../../infra/blockchain/viem/contract/usdcTokenContract/abi";
import { isBaseFeeAccept } from "../../../../infra/blockchain/viem/viem.helper";
import {
	CheckRateLimit,
	CreateRateLimitId,
	SetRateLimit,
} from "../../../../infra/cache/cache.rate_limit";
import { BotType, PickBotFreeTime, UnTickBotExecute } from "../../../../infra/queue_trigger/BotHandle";
import { waitTransactionReceipt } from "../../../../infra/queue_trigger/QueueTransaction";
import { VerifyRecaptcha } from "../../../../lib/auth/verify_recaptcha";
import { CHAIN_ID } from "../../../../lib/check_status";
import { ErrMsg, ErrorHandler } from "../../../../lib/error_handler";
import { GetRecaptchaToken } from "../../helper";
import {
	NODE_ENV,
	USDC_TOKEN_CONTRACT_ADDRESS
} from "./../../../../config";
import { ERROR_CODE } from "./../../../../lib/error_handler";
import { isGreaterOrEqual } from "./../../../../lib/utils";

const getRateLimitOptions = (address: string, clientIp: string) => {
	const date_now = new Date();
	const rate_limit_with_ip = {
		date_now,
		id: CreateRateLimitId(dex_user_mint_token_demo.name, clientIp),
		interval_time_in_min: 60 * 24,
		rate_limit: 5,
	};
	const rate_limit_with_address = {
		date_now,
		id: CreateRateLimitId(dex_user_mint_token_demo.name, address),
		interval_time_in_min: 60 * 24 * 7,
		rate_limit: 5,
	};
	return { rate_limit_with_ip, rate_limit_with_address };
};
export const dex_user_mint_token_demo = async (_, args: any, ctx: any) => {
	let bot_trigger: BotType | undefined = undefined
	try {
		const { address } = args as { address: string };
		const clientIp = getClientIp(ctx.req) || "";
		if (!(CHAIN_ID === 421613)) throw new Error("CHAIN NOT SUPPORT!");
		const { rate_limit_with_ip, rate_limit_with_address } = getRateLimitOptions(
			address,
			clientIp,
		);
		if (NODE_ENV !== "local" && NODE_ENV !== "dev") {
			const recaptcha_token = GetRecaptchaToken(ctx);
			await CheckRateLimit(rate_limit_with_ip);
			await CheckRateLimit(rate_limit_with_address);
			await VerifyRecaptcha(recaptcha_token);
		}
		await isBaseFeeAccept();
		const claim_amount = BigInt(1e10);
		bot_trigger = await PickBotFreeTime();
		const balance = (await contractUSDCToken.read.balanceOf([
			bot_trigger.accountInfo.address,
		])) as unknown as bigint;
		if (!isGreaterOrEqual(balance, claim_amount)) {
			const mint_balance = parseEther("10");
			const data = encodeFunctionData({
				abi: USDC_TOKEN_CONTRACT_ABI,
				functionName: "mint",
				args: [mint_balance],
			});
			const txHash = await viemWalletClient.sendTransaction({
				account: bot_trigger.accountInfo,
				to: USDC_TOKEN_CONTRACT_ADDRESS as Address,
				data,
				chain: null,
			});
			await waitTransactionReceipt(txHash);
		}
		const data = encodeFunctionData({
			abi: USDC_TOKEN_CONTRACT_ABI,
			functionName: "transfer",
			args: [address, claim_amount],
		});
		const txHash = await viemWalletClient.sendTransaction({
			account: bot_trigger.accountInfo,
			to: USDC_TOKEN_CONTRACT_ADDRESS as Address,
			data,
			chain: null,
		});
		const receipt = await waitTransactionReceipt(txHash);
		if (receipt.status === 'reverted') throw ErrMsg(ERROR_CODE.TRANSACTION_REVERT)
		if (NODE_ENV !== "local" && NODE_ENV !== "dev") {
			await SetRateLimit(rate_limit_with_ip);
			await SetRateLimit(rate_limit_with_address);
		}
		return "Success";
	} catch (e) {
		ErrorHandler(e, { args }, dex_user_mint_token_demo.name).throwErr();
	} finally {
		if (bot_trigger) UnTickBotExecute(bot_trigger.id);
	}
};
