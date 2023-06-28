import { Hex, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sleep } from "../../lib/utils";
import { MIN_BALANCE_BOT_ACCEPT_TRIGGER } from "./../../config";
import { BatchEthBalances } from "../blockchain/viem/contract/batch_call_contract/method/BatchCallContract";

export type BotType = {
	id: number;
	count: number;
	balance: bigint;
	accountInfo: PrivateKeyAccount;
	isTrigger: boolean;
};
export const BOTS_TRIGGER: BotType[] = [];
let is_init_bot = false;
export const UpdateBalanceBots = (balances: bigint[]) => {
	return balances.map((el, index) => {
		BOTS_TRIGGER[index].balance = el;
	});
};
export const InitBotTrigger = async (privateKeys: string[]) => {
	console.log("INIT BOT...");
	const accounts = privateKeys.map((el) =>
		privateKeyToAccount(`0x${el}` as Hex),
	);
	const addresses = accounts.map((el) => el.address);
	const balances = await BatchEthBalances(addresses);
	for (const [index] of privateKeys.entries()) {
		const address = addresses[index];
		const balance = balances[index];
		console.log(`- Bot ${index + 1}: ${address} - balance: ${balance}`);
		BOTS_TRIGGER.push({
			id: index,
			count: 0,
			balance: BigInt(balance),
			accountInfo: accounts[index],
			isTrigger: false,
		});
	}
	is_init_bot = true;
};

export const PickBotFreeTime = async () => {
	let bot: BotType | undefined = undefined;
	if (!is_init_bot) throw new Error("Bot has not been initialized!");
	const one_of_all_ready = BOTS_TRIGGER.some(
		(bot) => bot.balance >= MIN_BALANCE_BOT_ACCEPT_TRIGGER,
	);
	if (!one_of_all_ready) throw new Error("ALL BOT INSUFFICIENT BALANCE");
	while (!bot) {
		const all_bots = [...BOTS_TRIGGER].sort((a, b) => a.count - b.count);
		bot = all_bots.find(
			(bot) =>
				bot.isTrigger === false &&
				bot.balance >= MIN_BALANCE_BOT_ACCEPT_TRIGGER,
		);
		if (bot) {
			TickBotExecute(bot.id);
			break;
		}
		console.log('pick bot wait.....')
		await sleep(100);
	}
	return bot;
};
export const TickBotExecute = (id: number) => {
	BOTS_TRIGGER[id].isTrigger = true;
	BOTS_TRIGGER[id].count++;
};
export const UnTickBotExecute = (id: number) => {
	BOTS_TRIGGER[id].isTrigger = false;
};
