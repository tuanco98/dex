import { AllString } from "../helper";

enum EventsName {
	Deposit = "Deposit",
	Withdraw = "Withdraw",
	FeePaid = "FeePaid",
}

type TDepositEvent = {
	owner: string;
	amount: bigint;
	amountLp: bigint;
};

type TDepositRawEvent = AllString<TDepositEvent>;

const convertDepositRawEvent = (raw_event: TDepositRawEvent) => {
	const event: TDepositEvent = {
		owner: raw_event.owner,
		amount: BigInt(raw_event.amount),
		amountLp: BigInt(raw_event.amountLp),
	};
	return event;
};

type TWithdrawEvent = {
	owner: string;
	amount: bigint;
	amountLp: bigint;
};

type TWithdrawRawEvent = AllString<TWithdrawEvent>;

const convertWithdrawRawEvent = (raw_event: TWithdrawRawEvent) => {
	const event: TWithdrawEvent = {
		owner: raw_event.owner,
		amount: BigInt(raw_event.amount),
		amountLp: BigInt(raw_event.amountLp),
	};
	return event;
};

enum EFeeTypeType {
	OnlyOracle = 0,
	OpenPosition = 1,
	ClosePosition = 2,
}

type TFeePaidEvent = {
	id: string;
	feeType: EFeeTypeType;
	fee: bigint;
	oracle: bigint;
};

type TFeePaidRawEvent = AllString<TFeePaidEvent>;

const convertTFeePaidRawEvent = (raw_event: TFeePaidRawEvent) => {
	const event: TFeePaidEvent = {
		id: raw_event.id,
		feeType: Number(raw_event.feeType),
		fee: BigInt(raw_event.fee),
		oracle: BigInt(raw_event.oracle),
	};
	return event;
};

export {
	EventsName as PoolEventName,
	TDepositEvent,
	TDepositRawEvent,
	TWithdrawEvent,
	TWithdrawRawEvent,
	TFeePaidEvent,
	TFeePaidRawEvent,
	convertDepositRawEvent,
	convertWithdrawRawEvent,
	convertTFeePaidRawEvent,
	EFeeTypeType,
};
