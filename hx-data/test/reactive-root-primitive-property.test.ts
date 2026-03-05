// noinspection DuplicatedCode

import {describe, expect, it} from 'vitest';
import {
	ExposedReactiveObject,
	FUNC_GET_ROOT,
	FUNC_TRIGGER_CHANGE,
	reactive,
	ReactiveObject,
	ReactiveRoot,
	ValueChangedEvent
} from '../src';

const isReactiveRoot = (obj: any): obj is ReactiveRoot => {
	return obj != null && typeof obj === 'object' && typeof obj[FUNC_GET_ROOT] === 'function' && typeof obj[FUNC_TRIGGER_CHANGE] === 'function';
};

const isReactiveObject = (obj: any): obj is ReactiveObject => {
	return obj != null && typeof obj === 'object' && typeof obj[FUNC_GET_ROOT] === 'function';
};

describe('First level property change events', () => {
	it('should emit event when property changes', () => {
		const obj = reactive({name: 'John', age: 30});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ExposedReactiveObject.on(obj, 'name', listener);

		obj.name = 'Jane';

		expect(capturedEvent).not.toBeNull();
		expect(isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('name');
		expect(capturedEvent!.pathToParent).toBe('name');
		expect(capturedEvent!.oldValue).toBe('John');
		expect(capturedEvent!.newValue).toBe('Jane');
	});

	it('should emit event with number value', () => {
		const obj = reactive({name: 'John', age: 30});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ExposedReactiveObject.on(obj, 'age', listener);

		obj.age = 31;

		expect(capturedEvent).not.toBeNull();
		expect(isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('age');
		expect(capturedEvent!.pathToParent).toBe('age');
		expect(capturedEvent!.oldValue).toBe(30);
		expect(capturedEvent!.newValue).toBe(31);
	});

	it('should not emit event when value does not change', () => {
		const obj = reactive({name: 'John', age: 30});
		let callCount = 0;

		const listener = (_event: ValueChangedEvent) => {
			callCount++;
		};

		ExposedReactiveObject.on(obj, 'name', listener);

		obj.name = 'John';

		expect(callCount).toBe(0);
	});

	it('should remove event listener after off', () => {
		const obj = reactive({name: 'John', age: 30});
		let callCount = 0;

		const listener = (_event: ValueChangedEvent) => {
			callCount++;
		};

		ExposedReactiveObject.on(obj, 'name', listener);
		ExposedReactiveObject.off(obj, 'name', listener);

		obj.name = 'Jane';

		expect(callCount).toBe(0);
	});

	it('should not capture changes to different property', () => {
		const obj = reactive({a: 'value-a', b: 'value-b'});
		let callCount = 0;

		const listener = (_event: ValueChangedEvent) => {
			callCount++;
		};

		ExposedReactiveObject.on(obj, 'a', listener);

		obj.b = 'new-value-b';

		expect(callCount).toBe(0);
	});

	it('should emit event when property changes to null', () => {
		const obj = reactive({value: 'not-null'});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ExposedReactiveObject.on(obj, 'value', listener);

		obj.value = null;

		expect(capturedEvent).not.toBeNull();
		expect(isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('value');
		expect(capturedEvent!.pathToParent).toBe('value');
		expect(capturedEvent!.oldValue).toBe('not-null');
		expect(capturedEvent!.newValue).toBe(null);
	});

	it('should emit event when boolean property changes', () => {
		const obj = reactive({active: false});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ExposedReactiveObject.on(obj, 'active', listener);

		obj.active = true;

		expect(capturedEvent).not.toBeNull();
		expect(isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('active');
		expect(capturedEvent!.pathToParent).toBe('active');
		expect(capturedEvent!.oldValue).toBe(false);
		expect(capturedEvent!.newValue).toBe(true);
	});

	it('should emit event when property changes to undefined', () => {
		const obj = reactive({value: 'defined'});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ExposedReactiveObject.on(obj, 'value', listener);

		obj.value = undefined;

		expect(capturedEvent).not.toBeNull();
		expect(isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('value');
		expect(capturedEvent!.pathToParent).toBe('value');
		expect(capturedEvent!.oldValue).toBe('defined');
		expect(capturedEvent!.newValue).toBe(undefined);
	});

	it('should emit event when property is deleted', () => {
		const obj = reactive({value: 'to-delete'});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ExposedReactiveObject.on(obj, 'value', listener);

		delete (obj as any).value;

		expect(capturedEvent).not.toBeNull();
		expect(isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('value');
		expect(capturedEvent!.pathToParent).toBe('value');
		expect(capturedEvent!.oldValue).toBe('to-delete');
		expect(capturedEvent!.newValue).toBe(undefined);
	});
});
