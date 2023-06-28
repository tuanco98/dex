import { DAO } from "../../../../infra/database/mongo/methods";
import { ErrorHandler } from "../../../../lib/error_handler";

export const dex_epoch_info = async (_, args: any) => {
	try {
		const result = await DAO.current_epoch.getCurrentEpoch();
		return result;
	} catch (e) {
		ErrorHandler(e, { args }, dex_epoch_info.name).throwErr();
	}
};
