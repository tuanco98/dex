import { Deposit } from "./Deposit";
import { FeePaid } from "./FeePaid";
import { Withdraw } from "./Withdraw";

const EventHandler = {
	Deposit,
	Withdraw,
	FeePaid,
};

export { EventHandler as PoolEventHandler };
