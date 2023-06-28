type ETriggeredAction = "Open" | "Close";

interface ITriggeredTradeController {
	current_triggered_ids: Map<string, boolean>;
	setTriggeredId: (id: string, action: ETriggeredAction) => void;
	setTriggeredIds: (params: { id: string; action: ETriggeredAction }[]) => void;
	isTriggeredId: (id: string, action: ETriggeredAction) => boolean;
	delTriggeredId: (id: string, action: ETriggeredAction) => void;
	delTriggeredIds: (params: { id: string; action: ETriggeredAction }[]) => void;
}

export { ITriggeredTradeController, ETriggeredAction };
