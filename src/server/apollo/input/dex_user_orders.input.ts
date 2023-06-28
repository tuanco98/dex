type Input = {
	order_type: "position" | "order" | "history";
	pair_id?: number;
	page: number;
	pageSize: number;
};

export { Input as TUserOrdersInput };
