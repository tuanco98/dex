import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import { PYTH_SERVICE_ENDPOINT } from "../../config";

export let pyth: EvmPriceServiceConnection;

export const connectionPyth = (
	service_endpoint: string = PYTH_SERVICE_ENDPOINT,
) => {
	try {
		pyth = new EvmPriceServiceConnection(service_endpoint);
	} catch (error) {
		throw error;
	}
};
