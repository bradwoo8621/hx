import { describe, it, expect } from 'vitest';
import { reactive, ExposedReactiveObject, ValueChangedEvent } from '../src';

describe('First level property change events', () => {
	it('should emit event when property changes', () => {
		const obj = reactive({ name: 'John', age: 30 });
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ExposedReactiveObject.on(obj, 'name', listener);

		obj.name = 'Jane';

		expect(capturedEvent).not.toBeNull();
		expect(capturedEvent!.pathToRoot).toBe('name');
		expect(capturedEvent!.oldValue).toBe('John');
		expect(capturedEvent!.newValue).toBe('Jane');
	});

	it('should emit event with number value', () => {
		const obj = reactive({ name: 'John', age: 30 });
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ExposedReactiveObject.on(obj, 'age', listener);

		obj.age = 31;

		expect(capturedEvent).not.toBeNull();
		expect(capturedEvent!.pathToRoot).toBe('age');
		expect(capturedEvent!.oldValue).toBe(30);
		expect(capturedEvent!.newValue).toBe(31);
	});

	it('should not emit event when value does not change', () => {
		const obj = reactive({ name: 'John', age: 30 });
		let callCount = 0;

		const listener = (event: ValueChangedEvent) => {
			callCount++;
		};

		ExposedReactiveObject.on(obj, 'name', listener);

		obj.name = 'John';

		expect(callCount).toBe(0);
	});

	it('should remove event listener after off', () => {
		const obj = reactive({ name: 'John', age: 30 });
		let callCount = 0;

		const listener = (event: ValueChangedEvent) => {
			callCount++;
		};

		ExposedReactiveObject.on(obj, 'name', listener);
		ExposedReactiveObject.off(obj, 'name', listener);

		obj.name = 'Jane';

		expect(callCount).toBe(0);
	});

	it('should not capture changes to different property', () => {
		const obj = reactive({ a: 'value-a', b: 'value-b' });
		let callCount = 0;

		const listener = (event: ValueChangedEvent) => {
			callCount++;
		};

		ExposedReactiveObject.on(obj, 'a', listener);

		obj.b = 'new-value-b';

		expect(callCount).toBe(0);
	});
});
