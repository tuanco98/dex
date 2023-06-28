import { collections } from "../../../../infra/database/mongo/mongo";
import { ErrorHandler } from "../../../../lib/error_handler";
import { handleTimeFilter } from "./dex_user_details";

const handleTypeRequest = (query: any, from: Date, to: Date, typeRequestBy: 'Success' | 'Pending' | 'All') => {
    const copyQuery = query
    copyQuery.createAt = {
        $gte: from,
        $lte: to,
    }
    switch (typeRequestBy) {
        case 'Success':
            copyQuery.txid = {
                $exists: true
            }
            break;
        case 'Pending':
            copyQuery.txid = {
                $exists: false
            }
            break;
        default:
            copyQuery
            break;
    }
    return copyQuery
}

const dex_list_request_commission = async (_, args: any) => {
	try {
		const {
			page = 0,
			pageSize = 10,
			addressFilter,
			timeFilterBy = "All",
			typeRequestBy = "All",
		} = args;
		const { from, to } = handleTimeFilter(timeFilterBy);
		const queryRequestCommission = {};
		const getTypeRequest = handleTypeRequest(
			queryRequestCommission,
			from,
			to,
			typeRequestBy,
		);
		if (addressFilter) getTypeRequest.address = addressFilter.toLowerCase();
		const getDataRequestCommission = await collections.request_commissions
			.find(getTypeRequest)
			.skip(page * pageSize)
			.limit(pageSize)
			.toArray();
		const totalDataRequestCommission =
			await collections.request_commissions.countDocuments(getTypeRequest);
		const convertDataRequestCommission = getDataRequestCommission.map(
			(data) => {
				return {
					...data,
					request_amount: data.requestAmount.toString(),
					remain_amount: data.remainAmount?.toString() || null,
					create_at: data.createAt,
					update_at: data.updateAt,
				};
			},
		);
		const resultData = {
			data: convertDataRequestCommission,
			total: totalDataRequestCommission,
		};
		return resultData;
	} catch (error) {
		ErrorHandler(error, args, dex_list_request_commission.name).throwErr();
	}
};

export { dex_list_request_commission };
