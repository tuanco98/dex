import cluster from "cluster";
import { cpus } from "os";
import { randomBetween, sleep } from "./utils";

type ForkSystemOptions = {
	is_use_fork: boolean;
	number_of_cpu?: number;
};

const DEFAULT_FORK_OPTIONS: ForkSystemOptions = {
	is_use_fork: true,
};

const StartFork = async (options: ForkSystemOptions) => {
	const number_of_fork = options.number_of_cpu || cpus().length;
	console.log(`Starting fork ${number_of_fork} cpu(s)`);
	console.log(`Master process`, process.pid);
	cluster.on("disconnect", () => {
		console.log(`rerun fork`);
		cluster.fork({
			FORK_ID: ~randomBetween(0, 100000),
		});
	});
	for (let i = 0; i < number_of_fork; i++) {
		await sleep(1000);
		cluster.fork({
			FORK_ID: i,
		});
	}
};

export const ForkServer = (
	JobFunc: any,
	options: ForkSystemOptions = DEFAULT_FORK_OPTIONS,
) => {
	const { is_use_fork } = options;
	const is_fork = is_use_fork && cluster.isPrimary;
	console.log(`Process `, process.pid, " isMaster ", cluster.isPrimary);
	// const is_fork = false
	if (is_fork) {
		JobFunc(true, cluster.isPrimary);
		StartFork(options);
	} else JobFunc(true, cluster.isPrimary);
};
