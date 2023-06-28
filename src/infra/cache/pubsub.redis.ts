import { successConsoleLog } from "../../lib/color-log";
import { sub_ioredis } from "./redis";

export enum EIOREDIS_CHANNELS {
	test = "test",
}

export const connectSubRedis = async () => {
	const _channels = Object.values(EIOREDIS_CHANNELS);
	for (const channel of _channels) {
		const isSuccess = await sub_ioredis.subscribe(channel);
		if (isSuccess) {
			successConsoleLog(`ioredis - subscriber channel ${channel} successful`);
		}
	}
	console.log(`waitting for new message ...`);
	sub_ioredis.on("message", (channel, message) => {
		console.log(`recive message channel = ${channel} - msg = ${message}`);
		switch (channel) {
			case EIOREDIS_CHANNELS.test: {
				handleTestMessage(message);
			}
			break;

			default:
				break;
		}
	});
};

const handleTestMessage = async (message: string) => {
	// console.log(message);
};
