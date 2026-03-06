// noinspection DuplicatedCode

import { describe, expect, it } from 'vitest';
import { ERO, reactive, ValueChangedEvent } from '../src';

describe('Nested object property change events', () => {
	it('should emit event when nested property changes', () => {
		const obj = reactive({
			user: {
				name: 'John',
				age: 30
			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'user.name', listener);

		const user = obj.user;
		user.name = 'Jane';

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(user);
		expect(capturedEvent!.pathToRoot).toBe('user.name');
		expect(capturedEvent!.pathToParent).toBe('name');
		expect(capturedEvent!.oldValue).toBe('John');
		expect(capturedEvent!.newValue).toBe('Jane');
	});

	it('should emit event when nested number property changes', () => {
		const obj = reactive({
			user: {
				name: 'John',
				age: 30
			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'user.age', listener);

		const user = obj.user;
		user.age = 31;

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(user);
		expect(capturedEvent!.pathToRoot).toBe('user.age');
		expect(capturedEvent!.pathToParent).toBe('age');
		expect(capturedEvent!.oldValue).toBe(30);
		expect(capturedEvent!.newValue).toBe(31);
	});

	it('should not emit event when nested value does not change', () => {
		const obj = reactive({
			user: {
				name: 'John'
			}
		});
		let callCount = 0;

		const listener = (_event: ValueChangedEvent) => {
			callCount++;
		};

		ERO.on(obj, 'user.name', listener);

		obj.user.name = 'John';

		expect(callCount).toBe(0);
	});

	it('should emit event when nested property changes to null', () => {
		const obj = reactive({
			user: {
				value: 'not-null'
			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'user.value', listener);

		const user = obj.user;
		user.value = null;

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(user);
		expect(capturedEvent!.pathToRoot).toBe('user.value');
		expect(capturedEvent!.pathToParent).toBe('value');
		expect(capturedEvent!.oldValue).toBe('not-null');
		expect(capturedEvent!.newValue).toBe(null);
	});

	it('should emit event when nested boolean property changes', () => {
		const obj = reactive({
			config: {
				enabled: false
			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'config.enabled', listener);

		const config = obj.config;
		config.enabled = true;

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(config);
		expect(capturedEvent!.pathToRoot).toBe('config.enabled');
		expect(capturedEvent!.pathToParent).toBe('enabled');
		expect(capturedEvent!.oldValue).toBe(false);
		expect(capturedEvent!.newValue).toBe(true);
	});

	it('should emit event when nested property changes to undefined', () => {
		const obj = reactive({
			user: {
				value: 'defined'
			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'user.value', listener);

		const user = obj.user;
		user.value = undefined;

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(user);
		expect(capturedEvent!.pathToRoot).toBe('user.value');
		expect(capturedEvent!.pathToParent).toBe('value');
		expect(capturedEvent!.oldValue).toBe('defined');
		expect(capturedEvent!.newValue).toBe(undefined);
	});

	it('should emit event when nested property is deleted', () => {
		const obj = reactive({
			user: {
				value: 'to-delete'
			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'user.value', listener);

		const user = obj.user;
		delete user.value;

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(user);
		expect(capturedEvent!.pathToRoot).toBe('user.value');
		expect(capturedEvent!.pathToParent).toBe('value');
		expect(capturedEvent!.oldValue).toBe('to-delete');
		expect(capturedEvent!.newValue).toBe(undefined);
	});

	it('should manually emit event for nested property', () => {
		const obj = reactive({
			user: {
				name: 'John'			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'user.name', listener);

		const user = obj.user;
		ERO.emit(user, 'name', 'John', 'Jane');

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(user);
		expect(capturedEvent!.pathToRoot).toBe('user.name');
		expect(capturedEvent!.pathToParent).toBe('name');
		expect(capturedEvent!.oldValue).toBe('John');
		expect(capturedEvent!.newValue).toBe('Jane');
	});

	it('should not capture changes to different nested property', () => {
		const obj = reactive({
			user: {
				name: 'John',
				age: 30
			}
		});
		let callCount = 0;

		const listener = (_event: ValueChangedEvent) => {
			callCount++;
		};

		ERO.on(obj, 'user.name', listener);

		obj.user.age = 31;

		expect(callCount).toBe(0);
	});

	it('should not capture changes to different nested object', () => {
		const obj = reactive({
			user: {
				name: 'John'
			},
			config: {
				enabled: false
			}
		});
		let callCount = 0;

		const listener = (_event: ValueChangedEvent) => {
			callCount++;
		};

		ERO.on(obj, 'user.name', listener);

		obj.config.enabled = true;

		expect(callCount).toBe(0);
	});

	it('should monitor parent path when monitoring nested property', () => {
		const obj = reactive({
			user: {
				name: 'John',
				age: 30
			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'user', listener);

		const user = obj.user;
		user.name = 'Jane';

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent!.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent!.parent)).toBe(true);
		expect(capturedEvent!.root).toBe(obj);
		expect(capturedEvent!.parent).toBe(user);
		expect(capturedEvent!.pathToRoot).toBe('user.name');
		expect(capturedEvent!.pathToParent).toBe('name');
		expect(capturedEvent!.oldValue).toBe('John');
		expect(capturedEvent!.newValue).toBe('Jane');
	});
});
