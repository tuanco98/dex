import { ObjectId } from "mongodb";
import {
	BASE_FEE_ACCEPT,
	PRIVATE_KEY_REWARD_COMMISSION,
	USDC_TOKEN_CONTRACT_ADDRESS,
} from "../config";
import { system_status } from "../infra";
import { DAO } from "../infra/database/mongo/methods";
import { collections, mongo } from "../infra/database/mongo/mongo";
import { ErrorHandler } from "../lib/error_handler";
import { isGreaterThan } from "../lib/utils";
import {
	contractUSDCToken,
	viemPublicClient,
	viemWalletClient,
} from "../infra/blockchain/viem";
import { encodeFunctionData } from "viem";
import { USDC_TOKEN_CONTRACT_ABI } from "../infra/blockchain/viem/contract/usdcTokenContract/abi";
import { privateKeyToAccount } from "viem/accounts";

const handleTransferTokenUSDC = async (
	bot_address: string,
	req_address: string,
	req_amount: string,
) => {
	try {
		const bot_balance = (await contractUSDCToken.read.balanceOf([
			bot_address,
		])) as unknown as bigint;
		if (isGreaterThan(req_amount, bot_balance))
			throw new Error("BOT_NOT_ENOUGH_MONEY");
		const data = encodeFunctionData({
			abi: USDC_TOKEN_CONTRACT_ABI,
			functionName: "transfer",
			args: [req_address, req_amount],
		});
		const account = privateKeyToAccount(`0x${PRIVATE_KEY_REWARD_COMMISSION}`);
		const gas = await viemPublicClient.estimateGas({
			account: account,
			to: USDC_TOKEN_CONTRACT_ADDRESS,
			data,
		});
		const gasPrice = system_status.baseFee;
		if (BigInt(BASE_FEE_ACCEPT) < BigInt(gasPrice))
			throw new Error("BASE_FEE_IS_TOO_HIGH");
		const txHash = await viemWalletClient.sendTransaction({
			to: USDC_TOKEN_CONTRACT_ADDRESS,
			data,
			gas,
			chain: null,
			account,
		});

		return txHash;
	} catch (error) {
		throw error;
	}
};

const cron_reward_commission = async () => {
	const session = mongo.startSession();
	let id: ObjectId | null = null;
	try {
		const dataRequestCommissions =
			await DAO.request_commissions.getRequestCommission();
		if (dataRequestCommissions) {
			const { address } = dataRequestCommissions;
			id = dataRequestCommissions._id;
			const requestAmount = dataRequestCommissions.requestAmount.toString();
			const bot_address = privateKeyToAccount(
				`0x${PRIVATE_KEY_REWARD_COMMISSION}`,
			).address;
			session.startTransaction();
			const userAmountCommission = await collections.users.findOne(
				{ address },
				{ session },
			);
			if (!userAmountCommission) throw new Error("USER_NOT_FOUND");
			const { unclaim_commission } = userAmountCommission;
			const remainAmount =
				BigInt(unclaim_commission.toString()) - BigInt(requestAmount);
			if (remainAmount < 0) throw new Error("USER_NOT_ENOUGH_COMMISSION");
			await DAO.users.updateCommission(
				address,
				remainAmount.toString(),
				session,
			);
			const transactionHash = await handleTransferTokenUSDC(
				bot_address,
				address,
				requestAmount,
			);
			//TODO: using cache to make sure server was handled this request
			await DAO.request_commissions.updateRequestCommission(
				id,
				transactionHash,
				remainAmount.toString(),
				session,
			);
			await session.commitTransaction();
		}
	} catch (error: any) {
		if (session.inTransaction()) {
			await session.abortTransaction();
		}
		if (error && id)
			await DAO.request_commissions.updateError(id, error.message);
		ErrorHandler(error, {}, "cron_reward_commission");
	} finally {
		await session.endSession();
		setTimeout(() => cron_reward_commission(), 1000);
	}
};

export { cron_reward_commission, handleTransferTokenUSDC };
