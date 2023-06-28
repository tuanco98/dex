import { CONTRACT_ERROR } from "../../../../infra/blockchain/viem/viem.helper";
import { ERROR_CODE } from "../../../../lib/error_handler";

export const get_error_code = () => {
	return { ...ERROR_CODE, ...CONTRACT_ERROR };
};
