import { ObjectId } from "mongodb";
import { pair_controller } from "..";
import { PublishNewNotification } from "../../server/apollo/resolvers/subscription";
import {
	BatchAllowance,
	BatchBalanceOf,
} from "../blockchain/viem/contract/batch_call_contract/method/BatchCallContract";
import { ExecuteEditCopy } from "../blockchain/viem/contract/edit_position/method/EditPositionContract";
import { ExecuteCopy } from "../blockchain/viem/contract/open_position_contract/method/OpenPositionContract";
import { ECloseType } from "../blockchain/viem/contract/position_contract/event";
import { ClosePositions } from "../blockchain/viem/contract/processor_contract/method/ProcessorContract";
import { CONTRACT_ERROR, isMatchAddress } from "../blockchain/viem/viem.helper";
import { DAO } from "../database/mongo/methods";
import { getPositionSize } from "../database/mongo/methods/helper";
import { TCopyProof, TCopyRequest } from "../database/mongo/models/CopyProof";
import { TNotification } from "../database/mongo/models/Notification";
import { TPermit } from "../database/mongo/models/Order";
import { TTrade } from "../database/mongo/models/Trade";
import { TriggeredTradeController } from "../triggered_trade_controller/TriggeredTradeController";
import {
	MIN_SIZE,
	POOL_CONTRACT_ADDRESS,
	USDC_TOKEN_CONTRACT_ADDRESS,
} from "./../../config";
import { isGreaterOrEqual } from "./../../lib/utils";
import { ICopyTrigger } from "./ICopyTrigger";
import { TGetAllLinkTradeWithOptions } from "../database/mongo/methods/dao.traders";

class CopyTrigger implements ICopyTrigger {
	private _BPS = BigInt(1000000);
	private _RATE_LIMIT_COPY_REQUESTS_PER_TIMES = 50;
	private _MIN_SIZE = MIN_SIZE;
	constructor(private _triggered_trade_controller: TriggeredTradeController) {}
	_handle_split_execute_edit_copy(order_ids: string[]) {
		const edit_copies: { order_ids: string[] }[] = [];
		let _order_ids: string[] = [];
		for (const order_id of order_ids) {
			if (_order_ids.length > this._RATE_LIMIT_COPY_REQUESTS_PER_TIMES) {
				edit_copies.push({
					order_ids: _order_ids,
				});
				_order_ids = [];
				continue;
			}
			_order_ids.push(order_id);
		}
		if (_order_ids.length > 0) {
			edit_copies.push({
				order_ids: _order_ids,
			});
		}
		return edit_copies;
	}
	ExecuteEditCopy: (trades: TTrade[]) => Promise<string> = async (trades) => {
		const notifications: TNotification[] = [];
		const edit_copies = this._handle_split_execute_edit_copy(
			trades.map((el) => el.traderId),
		);
		for (const split_request of edit_copies) {
			const jobId = await ExecuteEditCopy(split_request.order_ids);
			for (const tradeId of split_request.order_ids) {
				const trade = trades.find((trade) => trade.traderId === tradeId);
				if (trade) {
					notifications.push({
						address: trade.owner.toLowerCase(),
						type: "EditCopy",
						payload: {
							jobId,
							position: {
								orderId: trade.traderId,
								pairId: trade.pairId,
								isLong: trade.isLong
							}
						},
						jobId,
						status: "Pending",
						createAt: new Date(),
						updateAt: new Date(),
					});
				}
			}
		}
		await DAO.notifications.NewNotifications(notifications);
		PublishNewNotification(
			notifications.map((el) => {
				return { ...el, action: "ADD" };
			}),
		);
		return "success";
	};
	ExecuteCloseCopy: (
		trade_id: string,
		options?: TGetAllLinkTradeWithOptions,
	) => Promise<string> = async (
		trade_id,
		options?: TGetAllLinkTradeWithOptions,
	) => {
		const all_triggered_ids: string[] = [];
		try {
			const all_link_trades = await DAO.trades.GetAllLinkTradeWith(
				trade_id,
				options,
			);
			if (all_link_trades.length) {
				all_triggered_ids.push(
					...all_link_trades.map((el) => el._id.toHexString()),
				);
				this._triggered_trade_controller.setTriggeredIds(
					all_link_trades.map((el) => ({
						id: el._id.toHexString(),
						action: "Close",
					})),
				);
				const price = pair_controller.getPair(all_link_trades[0].pairId).price;
				const prices = all_link_trades.map(() => price);
				const close_types: ECloseType[] = all_link_trades.map(
					() => ECloseType.MasterCopy,
				);
				const job_id = await ClosePositions(
					all_link_trades.map((el) => el.traderId),
					prices,
					close_types,
				);
				this._triggered_trade_controller.delTriggeredIds(
					all_link_trades.map((el) => ({
						id: el._id.toHexString(),
						action: "Close",
					})),
				);
				return job_id;
			} else {
				return "";
			}
		} catch (e) {
			console.log(e);
			return "";
		} finally {
			this._triggered_trade_controller.delTriggeredIds(
				all_triggered_ids.map((el) => ({ id: el, action: "Close" })),
			);
		}
	};
	createFailedNotification: (
		id: string,
		owner: string,
		reason: string,
	) => TNotification = (id, owner, reason) => {
		return {
			address: owner.toLowerCase(),
			type: "Copy",
			payload: {
				id,
				copier: owner.toLowerCase(),
				position: {
					orderId: id,
				},
				reason,
			},
			status: "Failed",
			createAt: new Date(),
			updateAt: new Date(),
		};
	};
	async _validate(order: TTrade, copyRequests: TCopyProof[]) {
		const valid_copy_requests: TCopyProof[] = [];
		const permits: TPermit[] = [];
		const notifications: TNotification[] = [];
		const owners = copyRequests.map((el) => el.owner);
		const [balances, allowances, all_permits] = await Promise.all([
			BatchBalanceOf(USDC_TOKEN_CONTRACT_ADDRESS, owners),
			BatchAllowance(
				USDC_TOKEN_CONTRACT_ADDRESS,
				POOL_CONTRACT_ADDRESS,
				owners,
			),
			DAO.users.getPermitsByUsers(owners),
		]);
		for (const [index, copyRequest] of copyRequests.entries()) {
			const amount =
				copyRequest.fixedAmount.toString() !== "0"
					? BigInt(copyRequest.fixedAmount)
					: (BigInt(order.amount.toString()) *
							BigInt(copyRequest.percentAmount.toString())) /
					  this._BPS;
			if (!isMatchAddress(order.owner, copyRequest.master)) {
				const notify = this.createFailedNotification(
					order.traderId,
					copyRequest.owner,
					CONTRACT_ERROR.INVALID_MASTER,
				);
				notifications.push(notify);
				continue;
			}
			if (
				!isGreaterOrEqual(
					getPositionSize(amount, order.leverage).toString(),
					this._MIN_SIZE,
				)
			) {
				const notify = this.createFailedNotification(
					order.traderId,
					copyRequest.owner,
					CONTRACT_ERROR.MIN_SIZE,
				);
				notifications.push(notify);
				continue;
			}
			if (!isGreaterOrEqual(balances[index], amount)) {
				const notify = this.createFailedNotification(
					order.traderId,
					copyRequest.owner,
					CONTRACT_ERROR.INSUFFICIENT_BALANCE,
				);
				notifications.push(notify);
				continue;
			}
			if (!isGreaterOrEqual(allowances[index], amount)) {
				const permit = all_permits.find(
					(el) => el.owner.toLowerCase() === copyRequest.owner.toLowerCase(),
				);
				if (!permit) {
					const notify = this.createFailedNotification(
						order.traderId,
						copyRequest.owner,
						CONTRACT_ERROR.INSUFFICIENT_ALLOWANCE,
					);
					notifications.push(notify);
					continue;
				}
				permits.push(permit);
			}

			valid_copy_requests.push(copyRequest);
		}
		return { valid_copy_requests, permits, notifications };
	}
	_handle_split_execute_copy(copyRequests: TCopyRequest[], permits: TPermit[]) {
		const copies: { copyRequests: TCopyRequest[]; permits: TPermit[] }[] = [];
		let _copy_requests: TCopyRequest[] = [];
		let _permits: TPermit[] = [];
		for (const copy_request of copyRequests) {
			const permit = permits.find(
				(el) => !!isMatchAddress(el.owner, copy_request.owner),
			);
			if (_copy_requests.length > this._RATE_LIMIT_COPY_REQUESTS_PER_TIMES) {
				copies.push({
					copyRequests: _copy_requests,
					permits: _permits,
				});
				_copy_requests = [];
				_permits = [];
				continue;
			}
			_copy_requests.push(copy_request);
			if (permit) _permits.push(permit);
		}
		if (_copy_requests.length > 0) {
			copies.push({
				copyRequests: _copy_requests,
				permits: _permits,
			});
		}
		return copies;
	}
	ExecuteOpenCopy: (order: TTrade, copy_proofs: TCopyProof[]) => Promise<void> =
		async (order, copy_proofs) => {
			const id = order.traderId;
			const { permits, valid_copy_requests, notifications } =
				await this._validate(order, copy_proofs);
			const split_requests = this._handle_split_execute_copy(
				valid_copy_requests,
				permits,
			);
			for (const split_request of split_requests) {
				const jobId = await ExecuteCopy(
					id,
					split_request.copyRequests,
					split_request.permits,
				);
				for (const copyRequest of split_request.copyRequests) {
					notifications.push({
						_id: new ObjectId(),
						address: copyRequest.owner.toLowerCase(),
						type: "Copy",
						payload: {
							jobId,
							position: {
								orderId: order.traderId,
								pairId: order.pairId,
								isLong: order.isLong
							}
						},
						jobId,
						status: "Pending",
						createAt: new Date(),
						updateAt: new Date(),
					});
				}
			}
			await DAO.notifications.NewNotifications(notifications);
			PublishNewNotification(
				notifications.map((el) => {
					return { ...el, action: "ADD" };
				}),
			);
		};
}

export { CopyTrigger };
