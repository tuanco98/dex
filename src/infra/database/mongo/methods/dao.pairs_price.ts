import { collections } from "../mongo";

const getDAO = () => ({
	common: collections.pairs_price,
});

type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getPairsPriceDAO, DAOType as PairsPriceType };
