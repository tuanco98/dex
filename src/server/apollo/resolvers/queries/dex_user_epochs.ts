import { Decimal128, Filter, SortDirection } from "mongodb";
import { DAO } from "../../../../infra/database/mongo/methods";
import { GetCurrentEpoch } from "../../../../infra/system_status/share_epoc_time";
import { ErrorHandler } from "../../../../lib/error_handler";
import { lowerCase } from "../../../../lib/utils";
import { request_validator } from "../../../../lib/validate";
import { MasterShareEpochType } from "../../../../infra/database/mongo/methods/dao.master_share_epoches";
import { TMasterShareEpoch } from "../../../../infra/database/mongo/models/MasterShareEpoch";

/**
 * dex_user_epochs
 * @param parent
 * @param {LoginInput} args
 * @param ctx
 * @return {string}
 */

type EEpochFilter = "all" | "not_end" | "available_for_withdraw" | "withdrawn";
type EEpochSort = "epoch_asc" | "epoch_desc";

const handlerFilterEpoch = (
	query: Filter<TMasterShareEpoch>,
	timeEpoch: number,
	typeEpochFilter: EEpochFilter,
): Filter<TMasterShareEpoch> => {
	switch (typeEpochFilter) {
		case "not_end":
			return {
				...query,
				epoch: new Decimal128(timeEpoch.toString()),
			};
		case "available_for_withdraw":
			return {
				...query,
				epoch: { $lt: new Decimal128(timeEpoch.toString()) },
				isWithdraw: { $exists: false },
				totalMasterShare: { $gt: new Decimal128("0") },
			};
		case "withdrawn":
			return {
				...query,
				totalMasterShare: { $gt: new Decimal128("0") },
				isWithdraw: true,
			};
		default:
			return {
				...query,
				$or: [{
					totalMasterShare: { $gt: new Decimal128("0") },
				}, {
					epoch: new Decimal128(timeEpoch.toString()),
				}]

			};
	}
};

export const dex_user_epochs = async (_, args: any) => {
	try {
		const {
			address,
			filter = "all",
			sort = "epoch_desc",
			page = 0,
			pageSize = 10,
		} = args as {
			address: string;
			filter: EEpochFilter;
			sort: EEpochSort;
			page: number;
			pageSize: number;
		};
		request_validator.ValidateMissing({ address });
		const { startTime, epochTime, startEpoch } =
			await DAO.current_epoch.getCurrentEpoch();
		const currentEpoch = GetCurrentEpoch(startTime, epochTime, startEpoch);
		let queryDataUserEpoch: Filter<TMasterShareEpoch> = {
			master: lowerCase(address),
		};
		queryDataUserEpoch = handlerFilterEpoch(
			queryDataUserEpoch,
			currentEpoch,
			filter,
		);
		const sortStage = { epoch: sort === "epoch_desc" ? -1 : 1 } as {
			[key: string]: SortDirection;
		};
		const getDataUserEpoch = await DAO.master_share_epoches.common
			.find(queryDataUserEpoch)
			.skip(page * pageSize)
			.limit(pageSize)
			.sort(sortStage)
			.toArray();
		const resultAggregate = getDataUserEpoch.map((data) => {
			const epoch = Number(data.epoch.toString());
			return {
				...data,
				epoch,
				totalMasterShare: data.totalMasterShare.toString(),
				startAt: data.createAt,
				isEnd: epoch < currentEpoch,
			};
		});
		const countDocuments = await DAO.master_share_epoches.common.countDocuments(
			queryDataUserEpoch,
		);
		return { total: countDocuments, data: resultAggregate };
	} catch (e) {
		ErrorHandler(e, args, dex_user_epochs.name).throwErr();
	}
};
