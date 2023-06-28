import { ClientSession, ObjectId } from "mongodb";
import { TLogTrigger } from "../models/LogTrigger";
import { collections } from "../mongo";

const getDAO = () => ({
	common: collections.logs_trigger,
	NewLogTrigger: (logTrigger: TLogTrigger, session?: ClientSession) => {
		return collections.logs_trigger.insertOne(logTrigger, { session });
	},
	GetUnhandledDoneTrigger: (session?: ClientSession) => {
		return collections.logs_trigger
			.find({ handleAt: { $exists: false } }, { session })
			.toArray();
	},
	MarkHandledDoneTrigger: (ids: ObjectId[], session?: ClientSession) => {
		return collections.logs_trigger.updateMany(
			{ _id: { $in: ids } },
			{ $set: { handleAt: new Date() } },
			{ session },
		);
	},
});

type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getLogTriggerDAO, DAOType as LogTriggerType };
