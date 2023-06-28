import { IObserver, ISubject } from "../../lib/design_pattern/observer";
import { DAO } from "../database/mongo/methods";

export class PriceSubject implements ISubject {
	private observers: IObserver[] = [];
	public moving_direction: "up" | "down" | "none" = "none";
	public chainlink_price = 0;
	constructor(public type: string, public pair_id: number, public price = 0) {}
	attach(observer: IObserver): void {
		const isExist = this.observers.includes(observer);
		if (isExist) {
			console.log(
				`PriceSubject ${this.pair_id}: ${observer.name} has been attached already.`,
			);
			return;
		}

		console.log(`PriceSubject ${this.pair_id}: Attached an ${observer.name}.`);
		this.observers.push(observer);
	}
	detach(observer: IObserver): void {
		const observerIndex = this.observers.indexOf(observer);
		if (observerIndex === -1) {
			console.log(
				`PriceSubject ${this.type} ${this.pair_id}: Nonexistent ${observer.name}.`,
			);
			return;
		}

		this.observers.splice(observerIndex, 1);
		console.log(
			`PriceSubject ${this.type} ${this.pair_id}: Detached an ${observer.name}.`,
		);
	}
	notify(): void {
		// console.log(`PriceSubject ${this.pair_id}: Notifying observers...`);
		for (const observer of this.observers) {
			observer.update(this);
		}
	}

	updatePrice(price: number, chainlink_price = 0): void {
		if (price === this.price && chainlink_price === this.chainlink_price) {
			this.moving_direction = "none";
			// console.log(`PriceSubject ${this.pair_id}: Price not change ${this.price}`);
			return;
		}
		if (price > this.price) {
			this.moving_direction = "up";
		} else {
			this.moving_direction = "down";
		}

		// console.log(`PriceSubject ${this.type} ${this.pair_id}: Price update from ${this.price} to ${price}`);
		this.price = price;
		if (chainlink_price) {
			this.chainlink_price = chainlink_price;
		}
		this.notify();
	}
}
interface IPriceSubjectsController {
	init: () => void;
	getPair: (pair_id: number) => PriceSubject;
}
class PriceSubjectsController implements IPriceSubjectsController {
	private _price_subjects: PriceSubject[] = [];
	constructor(private _type: string, private _observers: IObserver[]) {}
	_createNewPriceSubject: (pair_id: number, price?: number) => PriceSubject = (
		pair_id,
		price,
	) => {
		const new_price_subject = new PriceSubject(this._type, pair_id, price);
		this._observers.forEach((observer) => {
			new_price_subject.attach(observer);
		});
		this._price_subjects.push(new_price_subject);
		return new_price_subject;
	};
	init: () => Promise<void> = async () => {
		const all_pairs = await DAO.pairs.getMany({}, 0, 200, true);
		console.table(
			all_pairs.data.map((el) => ({ pair_id: el.pair_id, name: el.pair_name })),
		);
		for (const pair of all_pairs.data) {
			this._createNewPriceSubject(pair.pair_id);
		}
	};
	getPair: (pair_id: number) => PriceSubject = (pair_id) => {
		const found_subject = this._price_subjects.find(
			(el) => el.pair_id === pair_id,
		);
		if (!found_subject) {
			return this._createNewPriceSubject(pair_id);
		}
		return found_subject;
	};
}
export { PriceSubjectsController };
