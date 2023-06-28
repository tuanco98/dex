
import { ERROR_CODE, ErrMsg } from "../../../../lib/error_handler";
import { collections } from "../mongo";

const getDAO = () => ({
	common: collections.current_epoch,
	getCurrentEpoch: async () => {
		const currentEpoch = await collections.current_epoch.findOne()
		if (!currentEpoch) throw ErrMsg(ERROR_CODE.CURRENT_EPOCH_NOT_EXIST)
		return currentEpoch
	}
});

type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getCurrentEpochDAO, DAOType as CurrentEpochType };
