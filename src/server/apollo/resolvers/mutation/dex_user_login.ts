import { Address, Hex, isAddress, recoverMessageAddress } from "viem";
import { isMatchAddress } from "../../../../infra/blockchain/viem/viem.helper";
import { setUserToken } from "../../../../infra/cache/cache.user_signature";
import { DAO } from "../../../../infra/database/mongo/methods";
import { MILLISECOND_PER_ONE_SEC } from "../../../../lib/constants";
import {
	ERROR_CODE,
	ErrMsg,
	ErrorHandler,
} from "../../../../lib/error_handler";
import { EncodeToken, GetSignMessage } from "../../helper";
import { LoginInput } from "../../input/LoginInput";
/**
 * dex_user_login
 * @param parent
 * @param {LoginInput} args
 * @param ctx
 * @return {string}
 */

export const dex_user_login = async (_, args: any) => {
	const now = +new Date();
	try {
		const {
			address,
			signature,
			timestamp,
			duration_sec = 3600,
		} = args as LoginInput;
		//Validate
		if (!isAddress(address)) throw ErrMsg(ERROR_CODE.ADDRESS_INVALID);
		//duration must less than 86400
		if (duration_sec < 0 || duration_sec > 86400)
			throw ErrMsg(ERROR_CODE.DURATION_INVALID);
		//timestamp must be around 10 minute compare when with now
		if (Math.abs(timestamp - now) > 10 * 60 * MILLISECOND_PER_ONE_SEC)
			throw ErrMsg(ERROR_CODE.SIGNATURE_OUTDATE);
		//Main Function
		let recover_address: Address;
		try {
			recover_address = await recoverMessageAddress({
				signature: signature as Hex,
				message: GetSignMessage(timestamp),
			});
		} catch {
			throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
		}
		if (!isMatchAddress(address, recover_address))
			throw ErrMsg(ERROR_CODE.SIGNATURE_INVALID);
		const token = EncodeToken(signature, address.toLowerCase());
		await DAO.users.UserLogin(address.toLowerCase());
		await setUserToken(token, signature, timestamp, duration_sec);
		return token;
	} catch (e) {
		ErrorHandler(e, { args }, dex_user_login.name).throwErr();
	}
};
