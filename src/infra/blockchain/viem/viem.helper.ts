import {
	Address,
	Hex,
	Log,
	decodeAbiParameters,
	encodeEventTopics,
	isAddressEqual
} from "viem";
import { contractUSDCToken, viemPublicClient } from ".";
import { system_status } from "../..";
import { BASE_FEE_ACCEPT } from "../../../config";
import { ERROR_CODE, ErrMsg } from "../../../lib/error_handler";
import { getErrMsg } from "../../database/mongo/methods/helper";
import { TCopyRequest } from "../../database/mongo/models/CopyProof";
import { TPermit } from "../../database/mongo/models/Order";
import { POOL_ABI } from "./contract/pool_contract/abi";
import { POSITION_ABI } from "./contract/position_contract/abi";
import {
	GasLessInputType,
	OrderInputType,
	OrderLimitInputType,
} from "./types/type";

const getTypesInputPositionContract = (name: string, type: string) => {
	if (!Array.isArray(POSITION_ABI)) throw new Error("ABI is not array");
	const filter = POSITION_ABI.find(
		(el) => el["name"] === name && el["type"] === type,
	);
	if (!filter?.inputs) throw new Error("Types not found");
	return filter.inputs.map((el) => {
		return { name: el.name, type: el.type };
	});
};

const getTypesInputPoolContract = (name: string, type: string) => {
	if (!Array.isArray(POOL_ABI)) throw new Error("ABI is not array");
	const filter = POOL_ABI.find(
		(el) => el["name"] === name && el["type"] === type,
	);
	if (!filter?.inputs) throw new Error("Types not found");
	return filter.inputs;
};

const isMatchAddress = (address1: any, address2: any) => {
	return isAddressEqual(address1, address2);
};
const decodeParametersOpenPosition = (data: Hex) => {
	const types = getTypesInputPositionContract("OpenPosition", "event");
	const decode = decodeAbiParameters(types, data);
	return {
		id: decode[0] as string,
		owner: decode[1] as Address,
		isLong: decode[2] as boolean,
		pairId: decode[3] as number,
		leverage: decode[4] as number,
		timestamp: decode[5] as number,
		entryPrice: decode[6] as bigint,
		amount: decode[7] as bigint,
		fundingTracker: decode[8] as bigint,
		masterId: decode[9] as string,
	}
};
const decodeReasonCopyFailed = (data: string) => {
	try {
		if (!data?.startsWith("0x")) return data;
		if (!data || data === "0x" || data.length < 68) return "!silence-revert";
		const slice_data = `0x${data.slice(10)}` as Hex;
		const decode = decodeAbiParameters(
			[{ name: "x", type: "string" }],
			slice_data,
		);
		return decode[0];
	} catch (e) {
		return getErrMsg(e);
	}
};
function getFeeExecution(_gasUsedL2: bigint, _l1Shared: bigint) {
	const baseFee = BigInt(system_status.baseFee);
	const basePrice = BigInt(2e9);
	const l1GasFee = BigInt(system_status.l1GasFee);
	const L2Fee = _gasUsedL2 * baseFee;
	const L1Fee = l1GasFee / _l1Shared;
	return ((L1Fee + L2Fee) * basePrice) / BigInt(1e18);
}
const getAllowanceToken = async (owner: string, spender: string) => {
	const allowance = (await contractUSDCToken.read.allowance([
		owner,
		spender,
	])) as unknown as bigint;
	return allowance;
};
const getBalanceToken = async (owner: string) => {
	const allowance = (await contractUSDCToken.read.balanceOf([
		owner,
	])) as unknown as bigint;
	return allowance.toString();
};
const isBaseFeeAccept = async () => {
	const base_fee = system_status.baseFee;
	if (BigInt(BASE_FEE_ACCEPT) < BigInt(base_fee))
		throw ErrMsg(ERROR_CODE.BASE_FEE_IS_TOO_HIGH);
};
const getOpenPositionLog = (logs: Log[], transactionHash: string) => {
	const event_name = "OpenPosition";
	const topics = encodeEventTopics({
		abi: POSITION_ABI as any,
		eventName: event_name,
	});
	const open_position_log = logs.find(
		(el) =>
			el.transactionHash === transactionHash && el.topics[0] === topics[0],
	);
	return open_position_log;
};
const getFeePaidLog = (logs: Log[], transactionHash: string) => {
	const event_name = "FeePaid";
	const topics = encodeEventTopics({
		abi: POOL_ABI as any,
		eventName: event_name,
	});
	const fee_paid_log = logs.find(
		(el) =>
			el.transactionHash === transactionHash && el.topics[0] === topics[0],
	);
	return fee_paid_log;
};
const getFeePaidLogs = (logs: Log[], transactionHash: string) => {
	const event_name = "FeePaid";
	const topics = encodeEventTopics({
		abi: POOL_ABI as any,
		eventName: event_name,
	});
	const fee_paid_log = logs.filter(
		(el) =>
			el.transactionHash === transactionHash && el.topics[0] === topics[0],
	);
	return fee_paid_log;
};
const decodeParametersFeePaid = (data: Hex) => {
	const types = getTypesInputPoolContract("FeePaid", "event");
	const data_decode = decodeAbiParameters(types, data);
	return {
		id: data_decode[0] as string,
		feeType: data_decode[1] as number,
		fee: data_decode[2] as bigint,
		oracle: data_decode[3] as bigint,
	};
};
const findLogFeePaidById = (logs: Log[], id: string, transactionHash: string) => {
	for(const log of logs) {
		const decode_log = decodeParametersFeePaid(log.data)
		if (decode_log.id === id && log.transactionHash === transactionHash) return decode_log
	}
	return undefined
}
const getOracleFee = async (transactionHash: Hex, id: string) => {
	const receipt = await viemPublicClient.getTransactionReceipt({ hash: transactionHash})
	const fee_paid_logs = getFeePaidLogs(receipt.logs, transactionHash)
	const fee_paid_value = findLogFeePaidById(fee_paid_logs, id, transactionHash)
	return fee_paid_value?.oracle || 0n
}
const convertGasLessToArray = (gas_less: GasLessInputType) => {
	const { owner, deadline, signature } = gas_less;
	return [owner, deadline, signature];
};
const convertPermitToArray = (permit: TPermit) => {
	const { owner, spender, value, deadline, v, r, s } = permit;
	return [owner, spender, value, deadline, v, r, s];
};
const convertOrderToArray = (order: OrderInputType) => {
	const { isLong, pairId, leverage, amount, tp, sl } = order;
	return [isLong, pairId, leverage, amount, tp, sl];
};
const convertOrderLimitToArray = (order: OrderLimitInputType) => {
	const {
		owner,
		isLong,
		orderType,
		pairId,
		leverage,
		expire,
		amount,
		limitPrice,
		tp,
		sl,
		signature,
	} = order;
	return [
		owner,
		isLong,
		orderType,
		pairId,
		leverage,
		expire,
		amount,
		limitPrice,
		tp,
		sl,
		signature,
	];
};
const convertCopyRequestToArray = (copyRequest: TCopyRequest) => {
	const {
		owner,
		master,
		maxAmount,
		sharePercent,
		fixedAmount,
		percentAmount,
		percentTp,
		percentSl,
		signature,
	} = copyRequest;
	return [
		owner,
		master,
		maxAmount,
		fixedAmount,
		percentAmount,
		sharePercent,
		percentTp,
		percentSl,
		signature,
	];
};

enum CONTRACT_ERROR {
	AMOUNT = "!amount", // require(amount > fee, "!amount");Deposit;  require(amountLP > 0, "!amount");Withdraw,   require(amount > 0, "!amount"); EditPosition
	CANT_SELF_EXECUTE = "!cant-self-execute",
	CLOSED = "!closed", // require(pair.chainlinkFeed != address(0x0) && !pair.isClosed,"!closed"); _openPosition
	COPIED = "!copied", // require(!isCopied[copyRequest.owner][masterId], "!copied"); openCopyPosition
	DEADLINE_NOT_VALID = "!deadline", // require(gasLess.deadline > block.timestamp, "!deadline"); _verifyClose; _verifyWithdraw, _verifyDeposit, _verifyCancel, _verifyUpdateLimit, _verifyGasLess, VerifyEditPosition
	EXPIRED_COPY = "!expire-copy",
	EXPIRE_INVALID = "!expire",
	FEE_NOT_ENOUGH = "!fee-not-enough",
	INSUFFICIENT_ALLOWANCE = "ERC20: insufficient allowance",
	INSUFFICIENT_BALANCE = "ERC20: insufficient balance",
	INVALID_MASTER = "!invalid-master",
	ONLY_THIS = "!only-this",
	SIGN_USED = "!sign-used",
	MIN_SIZE = "!min-size",
	MAX_COPIED = "!max-copied",
	RISK = "!risk",
	PERMIT_SENDER = "!permit-sender",
	PERMIT_OWNER = "!permit-owner",
	LEVERAGE = "!leverage",
	OWNER = "!owner",
	MAX_LEVERAGE = "!max-leverage",
	MIN_LEVERAGE = "!min-leverage",
	PNL = "!pnl",
	CHAINLINK_NOT_READY = "!chainlink-grace-not-over",
	EXECUTION_REVERT = "Returned error: execution reverted",
	INTRINSIC_GAS_TOO_LOW = "!Returned error: intrinsic gas too low",
	VALID_PERCENT = "!valid-percent",
	MAX_FEE = "!max-fee",
	POOL_EMPTY = "!empty",
	LOCK_DEPOSIT = "!lock-deposit",
	POOL_BALANCE_NOT_ENOUGH = "!pool-balance",
	NOT_HAVE = "!not-have",
	NOT_MASTER_POSITION = "!master-position",
	NOT_EXIST = "!exist",
	POSITION_NOT_EXIST = "!exist-position",
	NOT_MASTER_CLOSED = "!master-closed",
	SIGNATURE_INVALID = "!signature",
	NOT_OWNER_CALL = "!owner-call",
	ORACLE_CANT_CLOSE = "!oracle-cant-close",
	LENGTH_DIFF = "!length",
	WRONG_CLOSE_TYPE = "!wrong-closeType", // require(closeType < 5, "!wrong-closeType"); _executePosition,Processor
	WRONG_PRICE = "!price", // if (price == 0) {revert("!price")};_executePosition,Processor
	LIQUIDATE = "!liquidate",
	WRONG_TP_PRICE = "!tp",
	WRONG_SL_PRICE = "!sl",
	EPOCH_CLAIMED = "!claimed",
	EPOCH_DONE = "!epoch-done",
	SIZE_CHANGE_INVALID = '!updated-position',
}

export {
	decodeParametersOpenPosition,
	convertGasLessToArray,
	getAllowanceToken,
	convertOrderLimitToArray,
	convertPermitToArray,
	convertOrderToArray,
	getOpenPositionLog,
	getBalanceToken,
	convertCopyRequestToArray,
	decodeReasonCopyFailed,
	getTypesInputPositionContract as getTypesInputTradingContract,
	CONTRACT_ERROR,
	isBaseFeeAccept,
	isMatchAddress,
	getFeePaidLog,
	decodeParametersFeePaid,
	getFeeExecution,
	getFeePaidLogs,
	findLogFeePaidById,
	getOracleFee,
};
