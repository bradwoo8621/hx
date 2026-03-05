export type Listener = (...args: any[]) => void;

export class EventEmitter {
	private events: Map<string, Listener[]> = new Map();

	on(eventName: string, listener: Listener): this {
		if (!this.events.has(eventName)) {
			this.events.set(eventName, []);
		}
		this.events.get(eventName)!.push(listener);
		return this;
	}

	off(eventName: string, listener: Listener): this {
		const listeners = this.events.get(eventName);
		if (listeners) {
			const index = listeners.indexOf(listener);
			if (index !== -1) {
				listeners.splice(index, 1);
			}
		}
		return this;
	}

	emit(eventName: string, ...args: any[]): boolean {
		const listeners = this.events.get(eventName);
		if (listeners && listeners.length > 0) {
			listeners.forEach(listener => listener(...args));
			return true;
		}
		return false;
	}

	once(eventName: string, listener: Listener): this {
		const onceListener: Listener = (...args: any[]) => {
			listener(...args);
			this.off(eventName, onceListener);
		};
		return this.on(eventName, onceListener);
	}

	offAll(eventName?: string): this {
		if (eventName) {
			this.events.delete(eventName);
		} else {
			this.events.clear();
		}
		return this;
	}
}
