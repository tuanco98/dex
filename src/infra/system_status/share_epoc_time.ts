import { MILLISECOND_PER_ONE_SEC } from "../../lib/constants";

const GetCurrentEpoch = (
	startTime: number,
	epochTime: number,
	startEpoch: number,
) => {
	return (
		Math.floor(
			(new Date().getTime() / MILLISECOND_PER_ONE_SEC - startTime) / epochTime,
		) + startEpoch
	);
};

const GetEpochEndTime = (
	current_epoch: number,
	startTime: number,
	epochTime: number,
	startEpoch: number,
) => {
	return new Date(
		(startTime + (current_epoch - startEpoch + 1) * epochTime) *
			MILLISECOND_PER_ONE_SEC,
	);
};

export { GetCurrentEpoch, GetEpochEndTime };
