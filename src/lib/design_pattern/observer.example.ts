// import { IObserver, ISubject } from "./observer";
// /**
//  * The Subject owns some important state and notifies observers when the state
//  * changes.
//  */
// class ConcreteSubject implements ISubject {
// 	/**
// 	 * @type {number} For the sake of simplicity, the Subject's state, essential
// 	 * to all subscribers, is stored in this variable.
// 	 */
// 	public state = 0;

// 	/**
// 	 * @type {IObserver[]} List of subscribers. In real life, the list of
// 	 * subscribers can be stored more comprehensively (categorized by event
// 	 * type, etc.).
// 	 */
// 	private observers: IObserver[] = [];

// 	/**
// 	 * The subscription management methods.
// 	 */
// 	public attach(observer: IObserver): void {
// 		const isExist = this.observers.includes(observer);
// 		if (isExist) {
// 			console.log("Subject: Observer has been attached already.");
// 			return;
// 		}

// 		console.log("Subject: Attached an observer.");
// 		this.observers.push(observer);
// 	}

// 	public detach(observer: IObserver): void {
// 		const observerIndex = this.observers.indexOf(observer);
// 		if (observerIndex === -1) {
// 			console.log("Subject: Nonexistent observer.");
// 			return;
// 		}

// 		this.observers.splice(observerIndex, 1);
// 		console.log("Subject: Detached an observer.");
// 	}

// 	/**
// 	 * Trigger an update in each subscriber.
// 	 */
// 	public notify(): void {
// 		console.log("Subject: Notifying observers...");
// 		for (const observer of this.observers) {
// 			observer.update(this);
// 		}
// 	}

// 	/**
// 	 * Usually, the subscription logic is only a fraction of what a Subject can
// 	 * really do. Subjects commonly hold some important business logic, that
// 	 * triggers a notification method whenever something important is about to
// 	 * happen (or after it).
// 	 */
// 	public someBusinessLogic(): void {
// 		console.log("\nSubject: I'm doing something important.");
// 		this.state = Math.floor(Math.random() * (10 + 1));

// 		console.log(`Subject: My state has just changed to: ${this.state}`);
// 		this.notify();
// 	}
// }

// /**
//  * Concrete Observers react to the updates issued by the Subject they had been
//  * attached to.
//  */
// class ConcreteObserverA implements IObserver {
// 	name = "ConcreteObserverA";
// 	public update(subject: ISubject): void {
// 		if (subject instanceof ConcreteSubject && subject.state < 3) {
// 			console.log("ConcreteObserverA: Reacted to the event.");
// 		}
// 	}
// }

// class ConcreteObserverB implements IObserver {
// 	name = "ConcreteObserverB";
// 	public update(subject: ISubject): void {
// 		if (
// 			subject instanceof ConcreteSubject &&
// 			(subject.state === 0 || subject.state >= 2)
// 		) {
// 			console.log("ConcreteObserverB: Reacted to the event.");
// 		}
// 	}
// }

// /**
//  * The client code.
//  */
// const test = () => {
// 	const subject = new ConcreteSubject();

// 	const observer1 = new ConcreteObserverA();
// 	subject.attach(observer1);

// 	const observer2 = new ConcreteObserverB();
// 	subject.attach(observer2);

// 	subject.someBusinessLogic();
// 	subject.someBusinessLogic();

// 	subject.detach(observer2);

// 	subject.someBusinessLogic();
// };

// /*
// Subject: Attached an observer.
// Subject: Attached an observer.

// Subject: I'm doing something important.
// Subject: My state has just changed to: 6
// Subject: Notifying observers...
// ConcreteObserverB: Reacted to the event.

// Subject: I'm doing something important.
// Subject: My state has just changed to: 1
// Subject: Notifying observers...
// ConcreteObserverA: Reacted to the event.
// Subject: Detached an observer.

// Subject: I'm doing something important.
// Subject: My state has just changed to: 5
// Subject: Notifying observers...
// */
