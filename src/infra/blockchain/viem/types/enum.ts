enum EOrderType {
	MARKET = 0,
	LIMIT = 1,
	STOP = 2,
}
enum EPriorityTrigger {
	LIQUIDATION = 1,
	STOP_LOSS = 2,
	TAKE_PROFIT = 3,
	OPEN_POSITION = 4,
	EDIT_POSITION = 5,
	CLOSE = 6,
}
export { EOrderType, EPriorityTrigger };
