import * as Sentry from "@sentry/node";
import { NODE_ENV, SENTRY_DNS, SERVER_NAME } from "../../config";
import { MY_LOGGER } from "../../lib/color-log";

const initSentry = () =>
	Sentry.init({
		dsn: SENTRY_DNS,
		serverName: SERVER_NAME,
		environment: NODE_ENV,
	});
const CaptureException = (error: any, data: any, debug = true) => {
	if (debug) {
		MY_LOGGER.error(error);
	}
	Sentry.addBreadcrumb({ data });
	Sentry.captureException(error);
};
export { initSentry, Sentry, CaptureException };
