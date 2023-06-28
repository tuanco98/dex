import { getContract } from "viem";
import { LIST_CONTRACT } from "../../config";
import { PublishNewSystemStatus } from "../../server/apollo/resolvers/subscription";
import { viemPublicClient } from "../blockchain/viem";
import { ARBITRUM_GAS_INFO_CONTRACT } from "../blockchain/viem/contract/arbitrum_gas_info_contract/abi";
import { getPriceChainlink } from "../blockchain/viem/contract/chainlink_contract/methods/ChainLinkContract";
import { getCurrentBlockNumberConsume } from "../cache/cache.current_block_number_consume";
import { getLatestBlockNumber } from "../cache/cache.latest_block_number";
import { DAO } from "../database/mongo/methods";
import { TPair } from "../database/mongo/models/Pair";

type TLatestBlockConsumed = {
	value: bigint;
	update_at: Date;
};
type TLatestBlockNumber = {
	value: bigint;
	update_at: Date;
};

type TChainlinkContractStatus = {
	value: boolean;
	update_at: Date;
};

class SystemStatus {
	private _arbitrum_gas_info_contract: any;
	private _current_trading_pair: number[] = [];
	private _pairs: TPair[] = [];
	public baseFee = "";
	public l1GasFee = "";
	constructor() {
		this._arbitrum_gas_info_contract = getContract({
			abi: ARBITRUM_GAS_INFO_CONTRACT,
			address: "0x000000000000000000000000000000000000006c",
			publicClient: viemPublicClient,
		});
	}
	latest_block_number: TLatestBlockConsumed = {
		value: 0n,
		update_at: new Date(0),
	};
	latest_block_consumed: TLatestBlockNumber = {
		value: 0n,
		update_at: new Date(0),
	};
	chainlink_contract_status: TChainlinkContractStatus = {
		value: true,
		update_at: new Date(),
	};
	_INTERVAL_UPDATE_TIME = 5000;

	_isUpdate(last_update_at: Date) {
		return (
			new Date().getTime() - last_update_at.getTime() >
			this._INTERVAL_UPDATE_TIME
		);
	}

	UpdateAndGetSystemStatus = async () => {
		if (this._isUpdate(this.latest_block_consumed.update_at))
			await this._updateLatestBlockConsumed();
		if (this._isUpdate(this.chainlink_contract_status.update_at))
			await this._updateChainlinkContractStatus();
		if (this._isUpdate(this.latest_block_number.update_at))
			await this._updateLatestBlockNumber();
		const gasPrice = await viemPublicClient.getGasPrice();
		const L1GasFee =
			await this._arbitrum_gas_info_contract.read.getCurrentTxL1GasFees();
		if (gasPrice) this.baseFee = gasPrice.toString();
		if (L1GasFee) this.l1GasFee = L1GasFee.toString();
		this.update();
		return {
			latest_block_number: this.latest_block_number.value,
			latest_block_consumed: this.latest_block_consumed.value,
			chainlink_contract_status: this.chainlink_contract_status.value,
		};
	};
	private _updateLatestBlockConsumed = async () => {
		const list_contract = LIST_CONTRACT;
		let latest_block_consumed = BigInt(9e10);
		for (const contract_address of list_contract) {
			const contract_latest_block_consumed = await getCurrentBlockNumberConsume(
				contract_address,
			);
			if (contract_latest_block_consumed) {
				latest_block_consumed =
					latest_block_consumed < contract_latest_block_consumed
						? latest_block_consumed
						: contract_latest_block_consumed;
			}
		}
		this.latest_block_consumed.value =
			BigInt(latest_block_consumed) || this.latest_block_consumed.value;
		this.latest_block_consumed.update_at = new Date();
	};
	private _updateLatestBlockNumber = async () => {
		const latest_block_number = await getLatestBlockNumber();
		if (latest_block_number) {
			this.latest_block_number.value = latest_block_number;
			this.latest_block_number.update_at = new Date();
		}
	};
	private _updateChainlinkContractStatus = async () => {
		if (!this._current_trading_pair.length) {
			const pairs = await DAO.pairs.getMany({}, 0, Infinity);
			this._current_trading_pair = pairs.data.map((el) => el.pair_id);
		}
		for (const pair_id of this._current_trading_pair) {
			const price = await getPriceChainlink(pair_id);
			if (price === -1n) {
				this.chainlink_contract_status.value = false;
				this.chainlink_contract_status.update_at = new Date();
				return;
			}
		}
		this.chainlink_contract_status.value = true;
		this.chainlink_contract_status.update_at = new Date();
	};
	update() {
		PublishNewSystemStatus(
			Number(this.latest_block_number.value),
			Number(this.latest_block_consumed.value),
			this.chainlink_contract_status.value,
			this.baseFee,
			this.l1GasFee,
		);
	}
	async init() {
		const all_pairs = await DAO.pairs.getMany({}, 0, Infinity);
		console.log(`Init Pairs`);
		console.table(
			all_pairs.data.map((el) => ({
				pair_id: el.pair_id,
				pair_name: el.pair_name,
				closeFee: el.closeFee,
				openFee: el.openFee,
				max_leverage: el.max_leverage,
				min_leverage: el.min_leverage,
			})),
		);
		this._pairs = all_pairs.data;
	}
	updatePair(pair: TPair) {
		console.log(`update Pair`);
		console.table(pair);
		const pair_index = this._pairs.findIndex(
			(el) => el.pair_id === pair.pair_id,
		);
		if (pair_index > -1) {
			this._pairs[pair_index] = pair;
		} else {
			this._pairs.push(pair);
		}
	}
	getPair(pair_id: number) {
		return this._pairs.find((el) => el.pair_id === pair_id);
	}
	getAllPair() {
		return this._pairs;
	}
}

export { SystemStatus };
