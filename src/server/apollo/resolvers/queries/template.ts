import { ClientSession } from "mongodb";
import { ErrorHandler } from "../../../../lib/error_handler";
/**
 * this is template api
 * @param parent
 * @param {TemplateInput} args
 * @param ctx
 * @return {TemplateOutput}
 */


type TApiCallBack = (_, args: any, ctx: any) => Promise<any>;
type TErrCallBack = (
	_,
	args: any,
	ctx: any,
	err: any,
	payload: any,
) => Promise<any>;

const ApiHandlerWrapper = (
	api_name: string,
	call_back: TApiCallBack,
	payload?: any & { session?: ClientSession },
	err_callback?: TErrCallBack,
) => {
	return async (_, args: any, ctx: any) => {
		try {
			if (call_back) {
				return call_back(parent, args, ctx);
			}
			return null;
		} catch (e) {
			if (err_callback) {
				err_callback(parent, args, ctx, e, payload);
				if (payload && "session" in payload) {
					if ((payload.session as ClientSession).inTransaction()) {
						await (payload.session as ClientSession).abortTransaction();
					}
				}
			}
			ErrorHandler(e, { args }, api_name).throwErr();
		} finally {
			if (payload && "session" in payload) {
				await (payload.session as ClientSession).endSession();
			}
		}
	};
};

export { TApiCallBack, TErrCallBack, ApiHandlerWrapper };
