/**
 * A listener function that can be called with any arguments
 */
export type Listener = (...args: any[]) => void;

/**
 * A simple event emitter that allows subscribing to and emitting events
 */
export class EventEmitter {
	/**
	 * Map of event names to arrays of listener functions
	 */
	private events: Map<string, Listener[]> = new Map();

	/**
	 * Register a listener for an event
	 * @param eventName - The name of the event to listen for
	 * @param listener - The function to call when the event is emitted
	 * @returns This EventEmitter instance for chaining
	 */
	on(eventName: string, listener: Listener): this {
		if (!this.events.has(eventName)) {
			this.events.set(eventName, []);
		}
		this.events.get(eventName)!.push(listener);
		return this;
	}

	/**
	 * Remove a specific listener for an event
		* @param eventName - The name of the event
	 * @param listener - The listener function to remove
	 * @returns This EventEmitter instance for chaining
	 */
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

	/**
	 * Emit an event, calling all registered listeners
	 * @param eventName - The name of the event to emit
	 * @param args - Arguments to pass to the listeners
	 * @returns True if there were listeners, false otherwise
	 */
	emit(eventName: string, ...args: any[]): boolean {
		const listeners = this.events.get(eventName);
		if (listeners && listeners.length > 0) {
			listeners.forEach(listener => listener(...args));
			return true;
		}
		return false;
	}

	/**
	 * Register a listener that will be called only once
	 * @param eventName - The name of the event to listen for
	 * @param listener - The function to call once when the event is emitted
	 * @returns This EventEmitter instance for chaining
	 */
	once(eventName: string, listener: Listener): this {
		const onceListener: Listener = (...args: any[]) => {
			listener(...args);
			this.off(eventName, onceListener);
		};
		return this.on(eventName, onceListener);
	}

	/**
	 * Remove all listeners for an event, or all listeners if no event name is provided
	 * @param eventName - Optional event name to remove listeners for. If not provided, removes all listeners.
	 * @returns This EventEmitter instance for chaining
	 */
	offAll(eventName?: string): this {
		if (eventName) {
			this.events.delete(eventName);
		} else {
			this.events.clear();
		}
		return this;
	}
}