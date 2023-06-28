import axios from "axios";
import { ErrMsg, ERROR_CODE } from "../error_handler";
import { RECAPTCHA_SECRET_KEY } from "./../../config";

export const VerifyRecaptcha = async (responseToken: string) => {
	try {
		const URL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${responseToken}`;
		const { data } = await axios.post(URL);
		if (!data?.success) throw ErrMsg(ERROR_CODE.INVALID_RECAPTCHA_TOKEN);
		return data;
	} catch (e) {
		throw e;
	}
};
