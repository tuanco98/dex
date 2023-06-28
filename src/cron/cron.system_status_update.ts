import { system_status } from "../infra";

const cron = async () => {
	try {
		if (system_status) {
			await system_status.UpdateAndGetSystemStatus();
		}
		// if (true) {
        //     const used = process.memoryUsage();
        //     for (const key in used) {
        //         console.log(
        //             `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`,
        //         );
        //     }
        // }
	} catch (e) {
		console.log(e);
	} finally {
		setTimeout(cron, 3000);
	}
};

export { cron as cron_system_status_update };
