import {
	FallbackTransport,
	HttpTransport,
	WebSocketTransport,
	createPublicClient,
	createWalletClient,
	fallback,
	getContract,
	http,
	webSocket,
} from "viem";
import {
	BATCH_CALL_CONTRACT_ADDRESS,
	CHAINLINK_CONTRACT_ADDRESS,
	EDIT_POSITION_CONTRACT_ADDRESS,
	FUNDING_CONTRACT_ADDRESS,
	OPEN_POSITION_CONTRACT_ADDRESS,
	POOL_CONTRACT_ADDRESS,
	PROFIT_SHARE_CONTRACT_ADDRESS,
	USDC_TOKEN_CONTRACT_ADDRESS,
	VIEM_PROVIDERS,
} from "../../../config";
import { USDC_TOKEN_CONTRACT_ABI } from "./contract/usdcTokenContract/abi";
import { BATCH_CALL_ABI } from "./contract/batch_call_contract/abi";
import { FUNDING_ABI } from "./contract/funding_contract/abi";
import { OPEN_POSITION_ABI } from "./contract/open_position_contract/abi";
import { POOL_ABI } from "./contract/pool_contract/abi";
import { CHAINLINK_ABI } from "./contract/chainlink_contract/abi";
import { PROFIT_SHARE_ABI } from "./contract/profit_share/abi";
import { EDIT_POSITION_ABI } from "./contract/edit_position/abi";

export const getTransport = (): FallbackTransport => {
	const transports: (WebSocketTransport | HttpTransport)[] = [];
	VIEM_PROVIDERS.forEach((el: string) => {
		if (el.startsWith("ws")) {
			transports.push(webSocket(el));
		} else {
			transports.push(http(el));
		}
	});
	return fallback(transports);
};
export const viemPublicClient = createPublicClient({
	batch: {
		multicall: {
			wait: 10,
		},
	},
	transport: getTransport(),
});
export const viemWalletClient = createWalletClient({
	transport: getTransport(),
});
export const contractUSDCToken = getContract({
	address: USDC_TOKEN_CONTRACT_ADDRESS,
	abi: USDC_TOKEN_CONTRACT_ABI,
	publicClient: viemPublicClient,
});
export const contractPool = getContract({
	address: POOL_CONTRACT_ADDRESS,
	abi: POOL_ABI,
	publicClient: viemPublicClient,
});
export const contractBathCall = getContract({
	address: BATCH_CALL_CONTRACT_ADDRESS,
	abi: BATCH_CALL_ABI,
	publicClient: viemPublicClient,
});
export const contractFunding = getContract({
	address: FUNDING_CONTRACT_ADDRESS,
	abi: FUNDING_ABI,
	publicClient: viemPublicClient,
});
export const contractOpenPosition = getContract({
	address: OPEN_POSITION_CONTRACT_ADDRESS,
	abi: OPEN_POSITION_ABI,
	publicClient: viemPublicClient,
});
export const contractChainlink = getContract({
	address: CHAINLINK_CONTRACT_ADDRESS,
	abi: CHAINLINK_ABI,
	publicClient: viemPublicClient,
});
export const contractProfitShare = getContract({
	address: PROFIT_SHARE_CONTRACT_ADDRESS,
	abi: PROFIT_SHARE_ABI,
	publicClient: viemPublicClient,
});
export const contractEditPosition = getContract({
	address: EDIT_POSITION_CONTRACT_ADDRESS,
	abi: EDIT_POSITION_ABI,
	publicClient: viemPublicClient,
});
