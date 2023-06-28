import {
	ETriggeredAction,
	ITriggeredTradeController,
} from "./TriggeredTradeController.i";

class TriggeredTradeController implements ITriggeredTradeController {
	current_triggered_ids: Map<string, boolean> = new Map();
	private _getKey = (id: string, action: ETriggeredAction) => `${id}_${action}`;
	setTriggeredId: (id: string, action: ETriggeredAction) => void = (
		id,
		action,
	) => {
		const key = this._getKey(id, action);
		if (!this.current_triggered_ids.get(key)) {
			this.current_triggered_ids.set(key, true);
		}
	};
	setTriggeredIds: (
		params: { id: string; action: ETriggeredAction }[],
	) => void = (params) => {
		params.map((el) => this.setTriggeredId(el.id, el.action));
	};
	isTriggeredId: (id: string, action: ETriggeredAction) => boolean = (
		id,
		action,
	) => {
		const key = this._getKey(id, action);
		return this.current_triggered_ids.get(key) ? true : false;
	};
	delTriggeredId: (id: string, action: ETriggeredAction) => void = (
		id,
		action,
	) => {
		const key = this._getKey(id, action);
		if (this.current_triggered_ids.get(key)) {
			this.current_triggered_ids.delete(key);
		}
	};
	delTriggeredIds: (
		params: { id: string; action: ETriggeredAction }[],
	) => void = (params) => {
		params.map((el) => this.delTriggeredId(el.id, el.action));
	};
}

export { TriggeredTradeController };
