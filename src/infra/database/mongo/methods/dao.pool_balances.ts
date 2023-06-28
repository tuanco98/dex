import { Decimal128 } from "mongodb";
import { collections } from "../mongo";

const getDAO = () => ({
	common: collections.pool_balances,
	createNewBalance: async (value: Decimal128) => {
		await collections.pool_balances.insertOne({
			value,
			createAt: new Date(),
		});
	},
	getAvgPoolBalance: async () => {
		const aggregateAvgPoolBalance = [
			{
				$group: {
					_id: null,
					avg_pool_balance: {
						$avg: "$value",
					},
				},
			},
			{
				$project: {
					_id: 0,
				},
			},
		];
		const dataAvgBalancePool = await collections.pool_balances
			.aggregate(aggregateAvgPoolBalance)
			.toArray();
		return dataAvgBalancePool;
	},
});

type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getPoolBalanceDAO, DAOType as PoolBalanceType };
