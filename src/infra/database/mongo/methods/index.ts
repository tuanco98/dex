import {
	RequestCommissionType,
	getRequestCommissionDAO,
} from "./dao.request_commission";
import { ContractEventType, getContractEventDAO } from "./dao.contract_events";
import { CopyProofType, getCopyProofDAO } from "./dao.copy_proofs";
import { FeePaidEventType, getFeePaidEventDAO } from "./dao.fee_paid_events";
import { getLogTriggerDAO, LogTriggerType } from "./dao.logs_trigger";
import { getNotificationDAO, NotificationType } from "./dao.notifications";
import { getOrderDAO, OrderType } from "./dao.orders";
import { getPairDAO, PairType } from "./dao.pairs";
import { getPairsPriceDAO, PairsPriceType } from "./dao.pairs_price";
import { getPoolBalanceDAO, PoolBalanceType } from "./dao.pool_balances";
import { getPoolEventDAO, PoolEventType } from "./dao.pool_events";
import { getTraderDAO, TraderType as TradeType } from "./dao.traders";
import { getUserDAO, UserDAO, UserType } from "./dao.users";
import {
	getMasterShareEpochDAO,
	MasterShareEpochType,
} from "./dao.master_share_epoches";
import { CurrentEpochType, getCurrentEpochDAO } from "./dao.current_epoch";
type DAOType = {
	orders: OrderType;
	users: UserType;
	pairs_price: PairsPriceType;
	trades: TradeType;
	pairs: PairType;
	contract_events: ContractEventType;
	pool_events: PoolEventType;
	fee_paid_events: FeePaidEventType;
	pool_balances: PoolBalanceType;
	copy_proofs: CopyProofType;
	request_commissions: RequestCommissionType;
	notifications: NotificationType;
	logs_trigger: LogTriggerType;
	master_share_epoches: MasterShareEpochType;
	current_epoch: CurrentEpochType;
	test_dao: UserDAO;
};

const DAO: DAOType = new Object() as any;

const initDAO = () => {
	console.log(`init DAO ...`);
	DAO.orders = getOrderDAO();
	DAO.users = getUserDAO();
	DAO.pairs = getPairDAO();
	DAO.pairs_price = getPairsPriceDAO();
	DAO.trades = getTraderDAO();
	DAO.contract_events = getContractEventDAO();
	DAO.pool_events = getPoolEventDAO();
	DAO.fee_paid_events = getFeePaidEventDAO();
	DAO.pool_balances = getPoolBalanceDAO();
	DAO.copy_proofs = getCopyProofDAO();
	DAO.notifications = getNotificationDAO();
	DAO.request_commissions = getRequestCommissionDAO();
	DAO.logs_trigger = getLogTriggerDAO();
	DAO.master_share_epoches = getMasterShareEpochDAO();
	DAO.current_epoch = getCurrentEpochDAO();
	DAO.test_dao = new UserDAO();
};

export { initDAO, DAO };
