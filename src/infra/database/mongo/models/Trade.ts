import { Decimal128, IndexDescription } from "mongodb";
import { ETriggerAction } from "../../../price_observer/PriceObservers";
import { TOrderRequired } from "./Order";

type TTrade = TOrderRequired & {
	traderId: string;
	isActive: boolean;
	orderAt: Date;
	pnl?: Decimal128;
	originAmount: Decimal128;
	closeFee?: Decimal128;
	openFee?: Decimal128;
	executionFeeOpen?: Decimal128;
	executionFeeClose?: Decimal128;
	updateAt?: Date;
	openTx: string;
	isCopy?: boolean;
	linkTrade?: string;
	unlinkTxid?: string;
	masterAddress?: string;
	masterShareAmount?: Decimal128;
	editTxs?: [string];
	closeTx?: string;
	entryPrice: Decimal128;
	closePrice?: Decimal128;
	fundingTracker: Decimal128;
	liquidationPrice: Decimal128;
	editFee?: Decimal128;
	executionFeeEdit?: Decimal128;
	triggerAction?: ETriggerAction; //Sử dụng để biết trigger vì hành động gì
	triggerCloseTxid?: string; //Sử dụng để lưu lại txid lúc trigger + là điều kiện cần để trigger nếu không tồn tại
	triggerError?: any;
	closeType?: number;
} & TTriggerTracker;

type TTriggerTracker = {
	triggerStatus: "NONE" | "PENDING" | "SUCCESS" | "FAIL";
	triggerId?: string;
};

const TradeIndexes: IndexDescription[] = [
	{ key: { traderId: 1 }, unique: true, background: true },
	{ key: { triggerAction: 1 }, background: true },
	{ key: { triggerCloseTxid: 1 }, background: true },
];

export { TTrade, TTriggerTracker, TradeIndexes };
