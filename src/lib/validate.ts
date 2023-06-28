import { ErrMsg, ERROR_CODE } from "./error_handler";

export class RequestValidator {
	MISSING_ERR: Error = new Error("MISSING_PARAMS");
	INVALID_PAGE: Error = new Error("INVALID_PAGE");
	INVALID_PAGESIZE: Error = new Error("INVALID_PAGESIZE");
	constructor(params: {
		errors?: {
			missing_err?: Error;
			invalid_page?: Error;
			invalid_pagesize?: Error;
		};
	}) {
		const { errors } = params;
		this.MISSING_ERR = errors?.missing_err || this.MISSING_ERR;
		this.INVALID_PAGE = errors?.invalid_page || this.INVALID_PAGE;
		this.INVALID_PAGESIZE = errors?.invalid_pagesize || this.INVALID_PAGESIZE;
	}

	ValidatePagination(params: { page: number; pageSize: number }) {
		const { page, pageSize } = params;
		if (page < 0) throw this.INVALID_PAGE;
		if (pageSize <= 0 || pageSize >= 1000) throw this.INVALID_PAGESIZE;
	}

	ValidateMissing(object: any) {
		const arr = Object.keys(object);
		for (const el of arr) {
			const isNullOrUndefined = object[el] == null;
			const isEmptyString = object[el] === "";
			if (isNullOrUndefined || isEmptyString) throw this.MISSING_ERR;
		}
	}

	ValidateString(
		text: string,
		options?: { min: number; max: number; regex?: RegExp; err_msg?: string },
	) {
		if (options) {
			const { min, max, regex, err_msg } = options;
			if (regex && !regex.test(text))
				throw ErrMsg(
					ERROR_CODE.INVALID_PARAMS,
					err_msg || `string invalid with regex=${regex}`,
				);
			if ((min && text.length < min) || (max && text.length > max))
				throw ErrMsg(
					ERROR_CODE.INVALID_PARAMS,
					err_msg || `string must be in [${min || 0},${max || Infinity}]`,
				);
		}
	}
}

export const request_validator = new RequestValidator({
	errors: {
		missing_err: ErrMsg(ERROR_CODE.MISSING_PARAMS),
		invalid_page: ErrMsg(ERROR_CODE.INVALID_PAGE),
		invalid_pagesize: ErrMsg(ERROR_CODE.INVALID_PAGESIZE),
	},
});
