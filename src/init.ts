import { NODE_ENV } from "./config";
import { DAO } from "./infra/database/mongo/methods";

export const initServer = async () => {
	//Init pair info
	if (["dev", "local","testnet"].includes(NODE_ENV)) {
		const all_pairs = await DAO.pairs.getMany({}, 0, Infinity);
		if (!all_pairs.data.length) {
			await DAO.pairs.common.insertMany([
				{
					pair_id: 1,
					pair_name: "BTC/USD",
					source: [
						{
							name: "Pyth",
							value:
								"0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b",
						},
						{
							name: "Chainlink",
							value: "0x6550bc2301936011c1334555e62A87705A81C12C",
						},
					],
					max_leverage: 100000000,
					min_leverage: 2000000,
					createAt: new Date(),
					updateAt: new Date(),
					fundingTracker: 0,
				},
				{
					pair_id: 2,
					pair_name: "ETH/USD",
					source: [
						{
							name: "Pyth",
							value:
								"0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6",
						},
						{
							name: "Chainlink",
							value: "0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08",
						},
					],
					max_leverage: 100000000,
					min_leverage: 2000000,
					createAt: new Date(),
					updateAt: new Date(),
					fundingTracker: 0,
				},
			]);
		}
	} else {
		const all_pairs = await DAO.pairs.getMany({}, 0, Infinity);
		if (!all_pairs.data.length) {
			await DAO.pairs.common.insertMany([
				{
					pair_id: 1,
					pair_name: "BTC/USD",
					source: [
						{
							name: "Pyth",
							value:
								"0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
						},
						{
							name: "Chainlink",
							value: "0x6ce185860a4963106506C203335A2910413708e9",
						},
					],
					max_leverage: 100000000,
					min_leverage: 2000000,
					createAt: new Date(),
					updateAt: new Date(),
					fundingTracker: 0,
				},
				{
					pair_id: 2,
					pair_name: "ETH/USD",
					source: [
						{
							name: "Pyth",
							value:
								"0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
						},
						{
							name: "Chainlink",
							value: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
						},
					],
					max_leverage: 100000000,
					min_leverage: 2000000,
					createAt: new Date(),
					updateAt: new Date(),
					fundingTracker: 0,
				},
			]);
		}
	}
};
