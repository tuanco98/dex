import { Address, getContract } from "viem";
import { PRICE_ATOMIC } from "../../config";
import { MILLISECOND_PER_ONE_SEC } from "../../lib/constants";
import { viemPublicClient } from "../blockchain/viem";
import { ABI_CHAIN_LINK } from "../blockchain/viem/abi/chainlink";
import {
	getCacheLatestChainlinkRound,
	setCacheLatestChainlinkRound,
} from "../cache/cache.latest_chainlink_round_consumed";
import { DAO } from "../database/mongo/methods";
import { TSourcePair } from "../database/mongo/models/Pair";
import { TPairPrice } from "../database/mongo/models/PairPrice";
import { IPriceFeeder } from "./IPriceFeeder";

// rome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface IChainlinkPriceFeeder extends IPriceFeeder {}

class ChainlinkPriceFeeder implements IChainlinkPriceFeeder {
	_contract_map: Map<string, any> = new Map();
	_pair_info_list: Map<number, string> = new Map();
	_latest_chainlink_round_list: Map<number, string> = new Map();
	GetCurrentPrice: (pair_id: number) => Promise<number | null> = async (
		pair_id,
	) => {
		//Find chainlink contract from db by pair_id
		const contract_address = await this._GetPairChainlinkAddress(pair_id);
		if (!contract_address) return null;
		const contract = this._GetContract(contract_address);
		//Call contract to get current price
		const currentDataPrice = (await contract.read.latestRoundData()) as {
			roundId: string;
			answer: string;
			startedAt: string;
			updatedAt: string;
			answeredInRound: string;
		};
		// console.log({ currentDataPrice });
		const latest_round_id_consumed = await this._GetLatestChainlinkRound(
			pair_id,
			currentDataPrice.roundId,
		);
		if (latest_round_id_consumed) {
			const diff_btw_current_and_latest_round_id = Number(
				BigInt(currentDataPrice.roundId) - BigInt(latest_round_id_consumed),
			);
			if (diff_btw_current_and_latest_round_id > 1) {
				console.log({ diff_btw_current_and_latest_round_id });
				const missing_price_data: TPairPrice[] = [];
				for (
					let index = 1;
					index < diff_btw_current_and_latest_round_id;
					index++
				) {
					const round_id = (
						BigInt(currentDataPrice.roundId) - BigInt(index)
					).toString();
					console.log({ round_id });
					const past_price = await this.GetPastPriceById(pair_id, round_id);
					if (past_price) {
						missing_price_data.push(past_price);
					}
				}
				if (missing_price_data.length)
					await DAO.pairs_price.common.insertMany(missing_price_data);
			}
		}
		const calculatePrice =
			Number((BigInt(currentDataPrice.answer) * 1000n) / BigInt(1e8)) / 1000;
		await this._SetLatestChainlinkRound(pair_id, currentDataPrice.roundId);
		return calculatePrice;
	};
	GetPastPrice: (pair_id: number, timestamp: number) => Promise<number> = (
		// pair_id,
		// round_id,
	) => {
		//Find chainlink contract from db by pair_id
		//Call contract to get past price
		return 1 as any;
	};

	GetPastPriceById: (
		pair_id: number,
		round_id: string,
	) => Promise<TPairPrice | null> = async (pair_id, round_id) => {
		const contract_address = await this._GetPairChainlinkAddress(pair_id);
		if (!contract_address) return null;
		const contract = this._GetContract(contract_address);
		const pastDataPrice = (await contract.read.getRoundData([round_id])) as {
			roundId: string;
			answer: string;
			startedAt: string;
			updatedAt: string;
			answeredInRound: string;
		};
		const calculatePrice =
			Number((BigInt(pastDataPrice.answer) * 1000n) / PRICE_ATOMIC) / 1000;
		return {
			pair_id,
			price: calculatePrice,
			source: "CHAINLINK",
			timestamp: new Date(
				(
					BigInt(pastDataPrice.startedAt) * BigInt(MILLISECOND_PER_ONE_SEC)
				).toString(),
			),
			chainlink_price: calculatePrice,
			pyth_price: null,
		};
	};
	GetLatestRoundData: (pair_id: number) => Promise<string | null> = async (
		pair_id,
	) => {
		const contract_address = await this._GetPairChainlinkAddress(pair_id);
		if (!contract_address) return null;
		const contract = this._GetContract(contract_address);
		const latest_round: string = await contract.methods.latestRound().call();
		return latest_round;
	};
	private _GetContract: (contract_address: string) => any = (
		contract_address,
	) => {
		let contract = this._contract_map.get(contract_address);
		if (!contract)
			contract = getContract({
				address: contract_address as Address,
				abi: ABI_CHAIN_LINK,
				publicClient: viemPublicClient,
			});
		return contract;
	};
	private _GetPairChainlinkAddress: (
		pair_id: number,
	) => Promise<string | null> = async (pair_id) => {
		const contract_address = this._pair_info_list.get(pair_id);
		if (!contract_address) {
			const dataPair = await DAO.pairs.get_pair_by_id(pair_id);
			if (!dataPair) return null;
			const chainlink_source = dataPair.source.find(
				(dataSource: TSourcePair) => {
					if (dataSource.name === "Chainlink") return dataSource;
				},
			);
			return chainlink_source?.value || null;
		}
		return contract_address || null;
	};
	private _GetLatestChainlinkRound: (
		pair_id: number,
		latest_round_id?: string,
	) => Promise<string | null> = async (pair_id, latest_round_id) => {
		const latest_chainlink_round =
			this._latest_chainlink_round_list.get(pair_id);
		if (!latest_chainlink_round) {
			const latest_chainlink_round_in_cache =
				await getCacheLatestChainlinkRound(pair_id);
			if (latest_round_id && !latest_chainlink_round_in_cache) {
				this._SetLatestChainlinkRound(pair_id, latest_round_id);
				return latest_round_id;
			}
			return latest_chainlink_round_in_cache;
		}
		return latest_chainlink_round;
	};
	private _SetLatestChainlinkRound: (
		pair_id: number,
		value: string,
	) => Promise<void> = async (pair_id, value) => {
		this._latest_chainlink_round_list.set(pair_id, value);
		await setCacheLatestChainlinkRound(pair_id, value);
	};
}

export { ChainlinkPriceFeeder };
