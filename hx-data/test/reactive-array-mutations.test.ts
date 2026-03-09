// noinspection DuplicatedCode

import {describe, expect, it} from 'vitest';
import {ERO, reactive, ValueChangedEvent} from '../src';

describe('Array mutation detection', () => {
	it('should emit event when array.push() is called', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items.push(4);

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3]);
		expect(capturedEvent!.newValue).toEqual([1, 2, 3, 4]);
	});

	it('should emit event when array.pop() is called', () => {
		const obj = reactive({
			items: [1, 2, 3, 4]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items.pop();

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3, 4]);
		expect(capturedEvent!.newValue).toEqual([1, 2, 3]);
	});

	it('should emit event when array.shift() is called', () => {
		const obj = reactive({
			items: [1, 2, 3, 4]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items.shift();

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3, 4]);
		expect(capturedEvent!.newValue).toEqual([2, 3, 4]);
	});

	it('should emit event when array.unshift() is called', () => {
		const obj = reactive({
			items: [2, 3, 4]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items.unshift(1);

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([2, 3, 4]);
		expect(capturedEvent!.newValue).toEqual([1, 2, 3, 4]);
	});

	it('should emit event when array.splice() removes elements', () => {
		const obj = reactive({
			items: [1, 2, 3, 4, 5]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items.splice(1, 2);

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3, 4, 5]);
		expect(capturedEvent!.newValue).toEqual([1, 4, 5]);
	});

	it('should emit event when array.splice() inserts elements', () => {
		const obj = reactive({
			items: [1, 4, 5]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items.splice(1, 0, 2, 3);

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 4, 5]);
		expect(capturedEvent!.newValue).toEqual([1, 2, 3, 4, 5]);
	});

	it('should emit event when array.splice() replaces elements', () => {
		const obj = reactive({
			items: [1, 2, 3, 4, 5]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items.splice(1, 2, 10, 20);

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3, 4, 5]);
		expect(capturedEvent!.newValue).toEqual([1, 10, 20, 4, 5]);
	});

	it('should emit event when array.sort() is called', () => {
		const obj = reactive({
			items: [3, 1, 4, 1, 5, 9, 2, 6]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items.sort();

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([3, 1, 4, 1, 5, 9, 2, 6]);
		expect(capturedEvent!.newValue).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
	});

	it('should emit event when array.reverse() is called', () => {
		const obj = reactive({
			items: [1, 2, 3, 4, 5]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items.reverse();

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3, 4, 5]);
		expect(capturedEvent!.newValue).toEqual([5, 4, 3, 2, 1]);
	});

	it('should emit event when array.fill() is called', () => {
		const obj = reactive({
			items: [1, 2, 3, 4, 5]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items.fill(0, 1, 3);

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3, 4, 5]);
		expect(capturedEvent!.newValue).toEqual([1, 0, 0, 4, 5]);
	});

	it('should emit event when array.copyWithin() is called', () => {
		const obj = reactive({
			items: [1, 2, 3, 4, 5]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		const items = obj.items;
		items.copyWithin(0, 3, 5);

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3, 4, 5]);
		expect(capturedEvent!.newValue).toEqual([4, 5, 3, 4, 5]);
	});

	it('should handle multiple mutations in sequence', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvents: ValueChangedEvent[] = [];

		const listener = (event: ValueChangedEvent) => {
			capturedEvents.push(event);
		};

		ERO.on(obj, 'items', listener);

		obj.items.push(4);
		obj.items.push(5);
		obj.items.pop();

		expect(capturedEvents.length).toBe(3);
		expect(capturedEvents[0].oldValue).toEqual([1, 2, 3]);
		expect(capturedEvents[0].newValue).toEqual([1, 2, 3, 4]);
		expect(capturedEvents[1].oldValue).toEqual([1, 2, 3, 4]);
		expect(capturedEvents[1].newValue).toEqual([1, 2, 3, 4, 5]);
		expect(capturedEvents[2].oldValue).toEqual([1, 2, 3, 4, 5]);
		expect(capturedEvents[2].newValue).toEqual([1, 2, 3, 4]);
	});

	it('should work with nested arrays', () => {
		const obj = reactive({
			matrix: [
				[1, 2],
				[3, 4]
			]
		});
		let capturedEvents: ValueChangedEvent[] = [];

		const listener = (event: ValueChangedEvent) => {
			capturedEvents.push(event);
		};

		ERO.on(obj, 'matrix', listener);

		obj.matrix.push([5, 6]);

		expect(capturedEvents.length).toBe(1);
		expect(capturedEvents[0].pathToRoot).toBe('matrix');
		expect(capturedEvents[0].oldValue).toEqual([
			[1, 2],
			[3, 4]
		]);
		expect(capturedEvents[0].newValue).toEqual([
			[1, 2],
			[3, 4],
			[5, 6]
		]);
	});

	it('should work with deeply nested arrays', () => {
		const obj = reactive({
			data: {
				items: [1, 2, 3]
			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'data.items', listener);

		obj.data.items.push(4);

		expect(capturedEvent).not.toBeNull();
		expect(capturedEvent!.pathToRoot).toBe('data.items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3]);
		expect(capturedEvent!.newValue).toEqual([1, 2, 3, 4]);
	});

	it('should not emit event for non-mutating array methods (like slice)', () => {
		const obj = reactive({
			items: [1, 2, 3, 4, 5]
		});
		let callCount = 0;

		const listener = (_event: ValueChangedEvent) => {
			callCount++;
		};

		ERO.on(obj, 'items', listener);

		const sliced = obj.items.slice(1, 3);
		expect(sliced).toEqual([2, 3]);
		expect(callCount).toBe(0);
	});

	it('should work when monitoring with empty path (all changes)', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, '*', listener);

		obj.items.push(4);

		expect(capturedEvent).not.toBeNull();
		expect(capturedEvent!.pathToRoot).toBe('items');
	});

	it('should work when monitoring parent path of array', () => {
		const obj = reactive({
			data: {
				items: [1, 2, 3]
			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'data.*', listener);

		obj.data.items.push(4);

		expect(capturedEvent).not.toBeNull();
		expect(capturedEvent!.pathToRoot).toBe('data.items');
	});

	it('should emit event when array.length is set to shorten the array', () => {
		const obj = reactive({
			items: [1, 2, 3, 4, 5]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		obj.items.length = 3;

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3, 4, 5]);
		expect(capturedEvent!.newValue).toEqual([1, 2, 3]);
	});

	it('should emit event when array.length is set to expand the array', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		obj.items.length = 5;

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3]);
		expect(capturedEvent!.newValue).toEqual([1, 2, 3, undefined, undefined]);
	});

	it('should emit event when array.length is set to 0 to clear the array', () => {
		const obj = reactive({
			items: [1, 2, 3, 4, 5]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		obj.items.length = 0;

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, 2, 3, 4, 5]);
		expect(capturedEvent!.newValue).toEqual([]);
	});

	it('should not emit event when array.length is set to same value', () => {
		const obj = reactive({
			items: [1, 2, 3]
		});
		let callCount = 0;
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			callCount++;
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		obj.items.length = 3;

		expect(callCount).toBe(0);
		expect(capturedEvent).toBeNull();
	});
});
