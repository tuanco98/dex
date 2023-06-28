import { IndexDescription, ObjectId } from "mongodb";
import { TEditFailedEvent } from "../../../blockchain/viem/contract/edit_position/event";
import { TCopyFailedEvent } from "../../../blockchain/viem/contract/open_position_contract/event";
import { TCloseFailedEvent } from "../../../blockchain/viem/contract/processor_contract/event";
	
type ENotificationType =
	| "Copy"
	| "EditCopy"
	| "CloseCopy"
	| "ClosePosition"
	| "OpenPosition"
	| "OpenLimitOrder"
	| "EditPosition"
	| "CancelLimitOrder"
	| "CancelCopyMaster"
	| "CopyMaster"
	| "DepositPool"
	| "WithdrawPool"
	| "WithdrawEpoch"
	| "GasLess"
	| "Liquidation"
	| "TakeProfit"
	| "StopLoss"
	
type ENotificationStatusType = "Pending" | "Failed" | "Success";
type PayloadPositionType = {
	orderId?: string;
	pairId?: number
	isLong?: boolean;
	price?: string
	pnl?: string;
	masterId?: string;
	tp?: string;
	sl?: string;
}
type TPayLoadPosition = {
	jobId?: string;
	position?: PayloadPositionType
	amount?: string
	oracleFee?: string;
	signature?: string
	reason?: string;
};
type TNotificationPayload = (
	| TPayLoadPosition
	| TCopyFailedEvent
	| TEditFailedEvent
	| TCloseFailedEvent
) & {
	txid?: string;
};
type TNotification = {
	_id?: ObjectId
	address: string;
	status: ENotificationStatusType;
	type: ENotificationType;
	jobId?: string;
	payload: TNotificationPayload;
	createAt: Date;
	updateAt: Date;
	readAt?: Date;
};

const NotificationIndexes: IndexDescription[] = [
	{ key: { address: 1 }, background: true },
	{ key: { address: 1, jobId: 1 }, background: true },
	{ key: { jobId: 1 }, background: true },
	{ key: { type: 1 }, background: true },
	{ key: { readAt: 1 }, background: true },
	{ key: { createAt: 1 }, background: true },
];

export {
	TNotification,
	ENotificationType,
	NotificationIndexes,
	TNotificationPayload,
	ENotificationStatusType,
};
