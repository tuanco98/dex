import { convertAbiViem } from "../../../../../lib/utils";

const CONTRACT_ABI = [
	{
		inputs: [
			{
				internalType: "contract IRoleManager",
				name: "_roles",
				type: "address",
			},
		],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint16",
				name: "pairId",
				type: "uint16",
			},
			{
				indexed: false,
				internalType: "address",
				name: "chainlinkFeed",
				type: "address",
			},
			{
				indexed: false,
				internalType: "bool",
				name: "isClosed",
				type: "bool",
			},
			{
				indexed: false,
				internalType: "bool",
				name: "allowSelfExecution",
				type: "bool",
			},
			{
				indexed: false,
				internalType: "uint32",
				name: "maxLeverage",
				type: "uint32",
			},
			{
				indexed: false,
				internalType: "uint32",
				name: "minLeverage",
				type: "uint32",
			},
			{
				indexed: false,
				internalType: "uint32",
				name: "openFee",
				type: "uint32",
			},
			{
				indexed: false,
				internalType: "uint32",
				name: "closeFee",
				type: "uint32",
			},
			{
				indexed: false,
				internalType: "uint32",
				name: "spread",
				type: "uint32",
			},
			{
				indexed: false,
				internalType: "uint32",
				name: "minAge",
				type: "uint32",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "maxDeviation",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "liqThreshold",
				type: "uint256",
			},
		],
		name: "PairUpdated",
		type: "event",
	},
	{
		inputs: [
			{
				internalType: "uint16",
				name: "pairId",
				type: "uint16",
			},
		],
		name: "get",
		outputs: [
			{
				components: [
					{
						internalType: "address",
						name: "chainlinkFeed",
						type: "address",
					},
					{
						internalType: "bool",
						name: "isClosed",
						type: "bool",
					},
					{
						internalType: "bool",
						name: "allowSelfExecution",
						type: "bool",
					},
					{
						internalType: "uint32",
						name: "maxLeverage",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "minLeverage",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "openFee",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "closeFee",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "spread",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "minAge",
						type: "uint32",
					},
					{
						internalType: "uint256",
						name: "maxDeviation",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "liqThreshold",
						type: "uint256",
					},
				],
				internalType: "struct IPair.Pair",
				name: "",
				type: "tuple",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint16",
				name: "pairId",
				type: "uint16",
			},
		],
		name: "getChainlinkFeed",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint16[]",
				name: "pairIds",
				type: "uint16[]",
			},
		],
		name: "getMany",
		outputs: [
			{
				components: [
					{
						internalType: "address",
						name: "chainlinkFeed",
						type: "address",
					},
					{
						internalType: "bool",
						name: "isClosed",
						type: "bool",
					},
					{
						internalType: "bool",
						name: "allowSelfExecution",
						type: "bool",
					},
					{
						internalType: "uint32",
						name: "maxLeverage",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "minLeverage",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "openFee",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "closeFee",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "spread",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "minAge",
						type: "uint32",
					},
					{
						internalType: "uint256",
						name: "maxDeviation",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "liqThreshold",
						type: "uint256",
					},
				],
				internalType: "struct IPair.Pair[]",
				name: "pairInfos",
				type: "tuple[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint16",
				name: "",
				type: "uint16",
			},
		],
		name: "pairList",
		outputs: [
			{
				internalType: "address",
				name: "chainlinkFeed",
				type: "address",
			},
			{
				internalType: "bool",
				name: "isClosed",
				type: "bool",
			},
			{
				internalType: "bool",
				name: "allowSelfExecution",
				type: "bool",
			},
			{
				internalType: "uint32",
				name: "maxLeverage",
				type: "uint32",
			},
			{
				internalType: "uint32",
				name: "minLeverage",
				type: "uint32",
			},
			{
				internalType: "uint32",
				name: "openFee",
				type: "uint32",
			},
			{
				internalType: "uint32",
				name: "closeFee",
				type: "uint32",
			},
			{
				internalType: "uint32",
				name: "spread",
				type: "uint32",
			},
			{
				internalType: "uint32",
				name: "minAge",
				type: "uint32",
			},
			{
				internalType: "uint256",
				name: "maxDeviation",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "liqThreshold",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "roles",
		outputs: [
			{
				internalType: "contract IRoleManager",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint16",
				name: "pairId",
				type: "uint16",
			},
			{
				components: [
					{
						internalType: "address",
						name: "chainlinkFeed",
						type: "address",
					},
					{
						internalType: "bool",
						name: "isClosed",
						type: "bool",
					},
					{
						internalType: "bool",
						name: "allowSelfExecution",
						type: "bool",
					},
					{
						internalType: "uint32",
						name: "maxLeverage",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "minLeverage",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "openFee",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "closeFee",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "spread",
						type: "uint32",
					},
					{
						internalType: "uint32",
						name: "minAge",
						type: "uint32",
					},
					{
						internalType: "uint256",
						name: "maxDeviation",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "liqThreshold",
						type: "uint256",
					},
				],
				internalType: "struct IPair.Pair",
				name: "pairInfo",
				type: "tuple",
			},
		],
		name: "set",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint16[]",
				name: "pairIds",
				type: "uint16[]",
			},
			{
				internalType: "bool[]",
				name: "isClosed",
				type: "bool[]",
			},
		],
		name: "setStatus",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
];
const CONVERT_ABI = convertAbiViem(CONTRACT_ABI);
export { CONVERT_ABI as PAIR_ABI };
