// noinspection DuplicatedCode

import {describe, expect, it} from 'vitest';
import {ERO, reactive, ValueChangedEvent} from '../src';
import {isReactiveObject, isReactiveRoot} from './type-check';

describe('Array index access and modification', () => {
	it('should emit event when array element is modified', () => {
		const obj = reactive({
			items: [1, 2, 3, 4, 5]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items.[0]', listener);

		const items = obj.items;
		items[0] = 10;

		expect(capturedEvent).not.toBeNull();
		expect(isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(items);
		expect(capturedEvent!.pathToRoot).toBe('items.[0]');
		expect(capturedEvent!.pathToParent).toBe('[0]');
		expect(capturedEvent!.oldValue).toBe(1);
		expect(capturedEvent!.newValue).toBe(10);
	});

	it('should emit event when multiple array elements are modified', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvents: ValueChangedEvent[] = [];

		const listener = (event: ValueChangedEvent) => {
			capturedEvents.push(event);
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items[0] = 10;
		items[1] = 20;
		items[2] = 30;

		expect(capturedEvents.length).toBe(3);
		expect(isReactiveRoot(capturedEvents[0].root)).toBe(true);
		expect(isReactiveObject(capturedEvents[0].parent)).toBe(true);
		expect(capturedEvents[0]!.root).toBe(obj);
		expect(capturedEvents[0]!.parent).toBe(items);
		expect(capturedEvents[0]!.pathToRoot).toBe('items.[0]');
		expect(capturedEvents[0]!.pathToParent).toBe('[0]');
		expect(capturedEvents[0].oldValue).toBe(1);
		expect(capturedEvents[0].newValue).toBe(10);

		expect(capturedEvents[1].pathToRoot).toBe('items.[1]');
		expect(capturedEvents[1].oldValue).toBe(2);
		expect(capturedEvents[1].newValue).toBe(20);

		expect(capturedEvents[2].pathToRoot).toBe('items.[2]');
		expect(capturedEvents[2].oldValue).toBe(3);
		expect(capturedEvents[2].newValue).toBe(30);
	});

	it('should not emit event when array element value does not change', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let callCount = 0;

		const listener = (_event: ValueChangedEvent) => {
			callCount++;
		};

		ERO.on(obj, 'items.[1]', listener);

		obj.items[1] = 2;

		expect(callCount).toBe(0);
	});

	it('should emit event when array element is set to null', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items.[0]', listener);

		obj.items[0] = null;

		expect(capturedEvent).not.toBeNull();
		expect(capturedEvent!.pathToRoot).toBe('items.[0]');
		expect(capturedEvent!.oldValue).toBe(1);
		expect(capturedEvent!.newValue).toBe(null);
	});

	it('should emit event when array element is set to undefined', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items.[1]', listener);

		obj.items[1] = undefined;

		expect(capturedEvent).not.toBeNull();
		expect(capturedEvent!.pathToRoot).toBe('items.[1]');
		expect(capturedEvent!.oldValue).toBe(2);
		expect(capturedEvent!.newValue).toBe(undefined);
	});

	it('should emit event when array element is deleted', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items.[1]', listener);

		delete obj.items[1];

		expect(capturedEvent).not.toBeNull();
		expect(capturedEvent!.pathToRoot).toBe('items.[1]');
		expect(capturedEvent!.oldValue).toBe(2);
		expect(capturedEvent!.newValue).toBe(undefined);
	});

	it('should manually emit event for array element', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items.[2]', listener);

		const items = obj.items;
		ERO.emit(items, '2', 3, 30);

		expect(capturedEvent).not.toBeNull();
		expect(capturedEvent!.pathToRoot).toBe('items.[2]');
		expect(capturedEvent!.pathToParent).toBe('[2]');
		expect(capturedEvent!.oldValue).toBe(3);
		expect(capturedEvent!.newValue).toBe(30);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(items);
	});

	it('should not capture changes to different array index', () => {
		const obj = reactive({
			items: [1, 2, 3, 4, 5]
		});
		let callCount = 0;

		const listener = (_event: ValueChangedEvent) => {
			callCount++;
		};

		ERO.on(obj, 'items.[0]', listener);

		obj.items[1] = 20;

		expect(callCount).toBe(0);
	});

	it('should monitor all array elements when monitoring parent path', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvents: ValueChangedEvent[] = [];

		const listener = (event: ValueChangedEvent) => {
			capturedEvents.push(event);
		};

		ERO.on(obj, 'items', listener);

		obj.items[0] = 10;
		obj.items[1] = 20;

		expect(capturedEvents.length).toBe(2);
	});

	it('should read array elements correctly', () => {
		const obj = reactive({
			items: [1, 2, 3, 4, 5]
		});

		expect(obj.items[0]).toBe(1);
		expect(obj.items[1]).toBe(2);
		expect(obj.items[2]).toBe(3);
		expect(obj.items[3]).toBe(4);
		expect(obj.items[4]).toBe(5);
	});

	it('should read array elements after modification', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});

		obj.items[0] = 10;
		obj.items[1] = 20;
		obj.items[2] = 30;

		expect(obj.items[0]).toBe(10);
		expect(obj.items[1]).toBe(20);
		expect(obj.items[2]).toBe(30);
	});

	it('should have correct path format for nested array in object', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items.[0]', listener);

		const items = obj.items;
		items[0] = 10;

		expect(capturedEvent).not.toBeNull();
		expect(capturedEvent!.pathToRoot).toBe('items.[0]');
		expect(capturedEvent!.pathToParent).toBe('[0]');
		expect(capturedEvent!.oldValue).toBe(1);
		expect(capturedEvent!.newValue).toBe(10);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(items);
	});

	it('should monitor parent array when monitoring specific index', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvents: ValueChangedEvent[] = [];

		const listener = (event: ValueChangedEvent) => {
			capturedEvents.push(event);
		};

		ERO.on(obj, 'items.[0]', listener);

		obj.items[0] = 10;
		obj.items[1] = 20;

		expect(capturedEvents.length).toBe(1);
		expect(capturedEvents[0].pathToRoot).toBe('items.[0]');
		expect(capturedEvents[0].newValue).toBe(10);
	});
});
