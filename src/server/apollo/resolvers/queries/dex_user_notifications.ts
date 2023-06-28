import { DAO } from "../../../../infra/database/mongo/methods";
import { ErrorHandler } from "../../../../lib/error_handler";
import { lowerCase } from "../../../../lib/utils";

export const dex_user_notifications = async (_, args: any) => {
	try {
		const {
			address,
			page = 0,
			pageSize = 10,
		} = args as { address: string; page: number; pageSize: number };
		const query = await DAO.notifications.getMany(
			{ address: lowerCase(address) },
			page,
			pageSize,
			false,
			{ updateAt: -1 },
		);
		return {
			...query,
			data: query.data.map((el) => {
				return {
					...el,
					id: el._id,
				};
			}),
		};
	} catch (e) {
		ErrorHandler(e, args, dex_user_notifications.name).throwErr();
	}
};
