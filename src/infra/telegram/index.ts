import { Telegraf } from "telegraf";
import { ENABLE_TELEGRAM, TELEGRAM_BOT_TOKEN } from "../../config";
import { successConsoleLog } from "../../lib/color-log";

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const initTelegramBot = async () => {
	try {
		if (ENABLE_TELEGRAM) {
			console.log(`Try to run telegram bot`);
			bot.launch();
			successConsoleLog(`🚀 Telegram bot: ready`);
		} else {
			console.log(
				`Disable Telegram Bot ... To open please change env ENABLE_TELEGRAM to true`,
			);
		}
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export { initTelegramBot, bot };
