import { cronService } from "./cron";
import { connectInfra } from "./infra";
import { CaptureException } from "./infra/logging/sentry";

(async () => {
	try {
		await connectInfra("cron");
		cronService.alone_job();
	} catch (e) {
		CaptureException(e, {});
	}
})();
