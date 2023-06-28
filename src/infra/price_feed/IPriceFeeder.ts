interface IPriceFeeder {
	GetCurrentPrice: (pair_id: number) => Promise<number | null>;

	GetPastPrice: (pair_id: number, timestamp: number) => Promise<number>;
}

export { IPriceFeeder };
