import {
	Collection,
	MongoClient,
	MongoClientOptions,
	ReadPreference,
} from "mongodb";
import { MONGO_DB_NAME, MONGO_URI } from "../../../config";
import { errorConsoleLog, successConsoleLog } from "../../../lib/color-log";
import { initDAO } from "./methods";
import {
	RequestCommissionIndexes,
	TRequestCommission,
} from "./models/CommissionRequest";
import { IContractEvent } from "./models/ContractEvent";
import { CopyProofIndexes, TCopyProof } from "./models/CopyProof";
import { TCurrentEpoch } from "./models/CurrentEpoch";
import { FeePaidEventIndexes, TFeeEvent } from "./models/FeePaidEvent";
import { LogTriggerIndexes, TLogTrigger } from "./models/LogTrigger";
import {
	MasterShareEpochIndexes,
	TMasterShareEpoch,
} from "./models/MasterShareEpoch";
import { NotificationIndexes, TNotification } from "./models/Notification";
import { OrderIndexes, TOrder } from "./models/Order";
import { PairIndexes, TPair } from "./models/Pair";
import { PairPriceIndexes, TPairPrice } from "./models/PairPrice";
import { PoolBalanceIndexes, TPoolBalance } from "./models/PoolBalance";
import { PoolEventIndexes, TPoolEvent } from "./models/PoolEvent";
import { TradeIndexes, TTrade } from "./models/Trade";
import { TUser, UserIndexes } from "./models/User";

let mongo: MongoClient;

const collections: {
	orders: Collection<TOrder>;
	users: Collection<TUser>;
	trades: Collection<TTrade>;
	pairs_price: Collection<TPairPrice>;
	pool_balances: Collection<TPoolBalance>;
	pairs: Collection<TPair>;
	contract_events: Collection<IContractEvent>;
	pool_events: Collection<TPoolEvent>;
	fee_paid_events: Collection<TFeeEvent>;
	copy_proofs: Collection<TCopyProof>;
	notifications: Collection<TNotification>;
	request_commissions: Collection<TRequestCommission>;
	logs_trigger: Collection<TLogTrigger>;
	master_share_epoches: Collection<TMasterShareEpoch>;
	current_epoch: Collection<TCurrentEpoch>;
} = new Object() as any;

const COLLECTION_NAMES = {
	orders: "orders",
	users: "users",
	trades: "trades",
	pairs: "pairs",
	pairs_price: "pairs_price",
	contract_events: "contract_events",
	pool_balances: "pool_balances",
	pool_events: "pool_events",
	fee_paid_events: "fee_paid_events",
	copy_proofs: "copy_proofs",
	notifications: "notifications",
	request_commissions: "request_commissions",
	logs_trigger: "logs_trigger",
	master_share_epoches: "master_share_epoches",
	current_epoch: "current_epoch",
};

const indexes = {
	orders: OrderIndexes,
	users: UserIndexes,
	trades: TradeIndexes,
	pairs: PairIndexes,
	pairs_price: PairPriceIndexes,
	pool_balances: PoolBalanceIndexes,
	pool_events: PoolEventIndexes,
	fee_paid_events: FeePaidEventIndexes,
	copy_proofs: CopyProofIndexes,
	notifications: NotificationIndexes,
	request_commissions: RequestCommissionIndexes,
	logs_trigger: LogTriggerIndexes,
	master_share_epoches: MasterShareEpochIndexes,
};

const checkModelInDb = async (
	params: { schema: any; collection: Collection<any> }[],
) => {
	try {
		for (const param of params) {
			const { collection, schema } = param;
			console.log(`checking in collection ${collection.collectionName} ...`);
			const notPassSchemaItems = await collection
				.find({ $nor: [{ $jsonSchema: schema }] })
				.toArray();
			if (notPassSchemaItems.length > 0)
				throw new Error(
					`${collection.collectionName} collection has ${notPassSchemaItems.length} item(s) not pass schema`,
				);
		}
	} catch (e) {
		throw e;
	}
};

const connectMongo = async (
	uri: string = MONGO_URI,
	db_name: string = MONGO_DB_NAME,
) => {
	try {
		console.log(`mongodb: connecting ...`);
		const mongo_options: MongoClientOptions = {
			ignoreUndefined: true, // find: {xxx: {$exists: false}}
			readPreference: ReadPreference.PRIMARY,
		};
		mongo = await new MongoClient(uri, mongo_options).connect();

		mongo.on("error", async (e) => {
			try {
				console.log(e);
				await mongo.close();
				await connectMongo(uri, db_name);
			} catch (e) {
				setTimeout(() => connectMongo(uri, db_name), 1000);
				throw e;
			}
		});

		mongo.on("timeout", async () => {
			try {
				await mongo.close();
				await connectMongo(uri, db_name);
			} catch (e) {
				setTimeout(() => connectMongo(uri, db_name), 1000);
				throw e;
			}
		});

		mongo.on("close", async () => {
			try {
				await connectMongo(uri, db_name);
			} catch (e) {
				setTimeout(() => connectMongo(uri, db_name), 1000);
				throw e;
			}
		});

		const db = db_name ? mongo.db(db_name) : mongo.db();
		Object.keys(COLLECTION_NAMES).forEach((name) => {
			collections[COLLECTION_NAMES[name]] = db.collection(
				COLLECTION_NAMES[name],
			);
		});

		successConsoleLog(`🚀 mongodb: connected to ${db.databaseName}`);
		initDAO();
	} catch (e) {
		errorConsoleLog(`mongodb: disconnected`);
		await mongo?.close(true);
		setTimeout(connectMongo, 1000);
		throw e;
	}
};

const createMongoIndex = async () => {
	console.log(`📇 Create indexes ...`);
	for (const name of Object.keys(COLLECTION_NAMES)) {
		if (indexes[name]) {
			await collections[COLLECTION_NAMES[name]]?.createIndexes(indexes[name]);
			console.log(`create indexes for -${name}- collection success!`);
		}
	}
	console.log(`📇 Create all indexes success!`);
};

const dropMongoIndex = async () => {
	console.log(`📇 Drop indexes ...`);
	for (const name of Object.keys(COLLECTION_NAMES)) {
		if (indexes[name]) {
			try {
				await collections[COLLECTION_NAMES[name]].dropIndexes();
			} catch (e) {
				console.log(e);
			}
			console.log(`Drop indexes for -${name}- collection success!`);
		}
	}
	console.log(`📇 Drop all indexes success!`);
};

const mongoCheckModel = async () => {
	try {
		console.log(`mongodb: checking model and document schema ...`);
		await checkModelInDb([]);
	} catch (e) {
		throw e;
	}
};

export {
	mongo,
	connectMongo,
	collections,
	indexes,
	createMongoIndex,
	dropMongoIndex,
	COLLECTION_NAMES,
	mongoCheckModel,
};
