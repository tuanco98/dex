// Observer Pattern
/**
 * The Subject interface declares a set of methods for managing subscribers.
 */
interface ISubject {
	// Attach an observer to the subject.
	attach(observer: IObserver): void;

	// Detach an observer from the subject.
	detach(observer: IObserver): void;

	// Notify all observers about an event.
	notify(): void;
}

/**
 * The Observer interface declares the update method, used by subjects.
 */
interface IObserver {
	// Receive update from subject.
	name: string;
	update(subject: ISubject): void | Promise<void>;
}

export { ISubject, IObserver };
