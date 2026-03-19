import {describe, expect, it, vi} from 'vitest';
import {ERO, reactive} from '../src';

describe('ERO utility methods', () => {
	describe('isReactiveObject', () => {
		it('returns true for reactive objects', () => {
			const obj = reactive({name: 'Test'});
			expect(ERO.isReactiveObject(obj)).toBe(true);
			expect(ERO.isReactiveObject(obj as any)).toBe(true);
		});

		it('returns true for nested reactive objects', () => {
			const obj = reactive({user: {name: 'Test'}});
			expect(ERO.isReactiveObject(obj.user)).toBe(true);
		});

		it('returns false for plain objects', () => {
			expect(ERO.isReactiveObject({})).toBe(false);
			expect(ERO.isReactiveObject({name: 'Test'})).toBe(false);
		});

		it('returns false for primitive values', () => {
			expect(ERO.isReactiveObject(null)).toBe(false);
			expect(ERO.isReactiveObject((void 0))).toBe(false);
			expect(ERO.isReactiveObject(123)).toBe(false);
			expect(ERO.isReactiveObject('string')).toBe(false);
			expect(ERO.isReactiveObject(true)).toBe(false);
		});

		it('returns false for arrays', () => {
			expect(ERO.isReactiveObject([])).toBe(false);
			expect(ERO.isReactiveObject([1, 2, 3])).toBe(false);
		});
	});

	describe('isReactiveRoot', () => {
		it('returns true for reactive root objects', () => {
			const obj = reactive({name: 'Test'});
			expect(ERO.isReactiveRoot(obj)).toBe(true);
		});

		it('returns false for nested reactive objects', () => {
			const obj = reactive({user: {name: 'Test'}});
			expect(ERO.isReactiveRoot(obj.user)).toBe(false);
		});

		it('returns false for plain objects', () => {
			expect(ERO.isReactiveRoot({})).toBe(false);
		});
	});

	describe('rootOf', () => {
		it('returns the root reactive object from nested objects', () => {
			const root = reactive({user: {address: {city: 'Test'}}});
			const address = root.user.address;
			expect(ERO.rootOf(address)).toBe(root);
		});

		it('returns the same object when called on root', () => {
			const root = reactive({name: 'Test'});
			expect(ERO.rootOf(root)).toBe(root);
		});

		it('throws error for non-reactive objects', () => {
			expect(() => ERO.rootOf({})).toThrowError('Cannot expose a non-reactive object value.');
		});
	});

	describe('pathOf', () => {
		it('resolves correct absolute path from nested objects', () => {
			const root = reactive({user: {address: {city: 'Test'}}});
			const address = root.user.address;
			expect(ERO.pathOf(address, 'city')).toBe('user.address.city');
			expect(ERO.pathOf(root.user, 'address.city')).toBe('user.address.city');
		});

		it('returns relative path when called on root', () => {
			const root = reactive({user: {name: 'Test'}});
			expect(ERO.pathOf(root, 'user.name')).toBe('user.name');
			expect(ERO.pathOf(root, 'user')).toBe('user');
		});

		it('throws error for non-reactive objects', () => {
			expect(() => ERO.pathOf({}, 'test')).toThrowError('Cannot expose a non-reactive object value.');
		});
	});

	describe('revoke', () => {
		it('returns plain non-reactive object from reactive object', () => {
			const reactiveObj = reactive({name: 'Test', nested: {value: 123}});
			const plainObj = ERO.revoke<{ name: string; nested: { value: number } }>(reactiveObj);

			expect(plainObj).toEqual({name: 'Test', nested: {value: 123}});
			expect(ERO.isReactiveObject(plainObj)).toBe(false);
			expect(ERO.isReactiveObject(plainObj.nested)).toBe(false); // Nested objects are also revoked
		});

		it('returns the same value for non-reactive objects', () => {
			const plainObj = {name: 'Test'};
			expect(ERO.revoke(plainObj)).toBe(plainObj);

			const primitive = 123;
			expect(ERO.revoke(primitive)).toBe(primitive);
		});

		it('modifications to revoked object do not trigger events', () => {
			const reactiveObj = reactive({count: 0});
			const listener = vi.fn();
			ERO.on(reactiveObj, 'count', listener);

			const plainObj = ERO.revoke(reactiveObj);
			// @ts-expect-error Testing modification on revoked plain object
			plainObj.count = 1;

			expect(listener).not.toHaveBeenCalled();
			expect(reactiveObj.count).toBe(1); // Original is modified since revoke returns reference
		});
	});

	describe('getValue', () => {
		it('gets value from reactive object using path', () => {
			const obj = reactive({user: {name: 'John', age: 30}});
			expect(ERO.getValue(obj, 'user.name')).toBe('John');
			expect(ERO.getValue(obj, 'user.age')).toBe(30);
		});

		it('gets value from plain object using path', () => {
			const obj = {user: {name: 'John', age: 30}};
			expect(ERO.getValue(obj, 'user.name')).toBe('John');
		});

		it('supports absolute paths with "/" prefix', () => {
			const obj = reactive({user: {name: 'John'}});
			const user = obj.user;
			// Absolute paths are resolved from the root, so '/name' would be root.name, not user.name
			// To access user.name from user object using absolute path:
			expect(ERO.getValue(user, '/name')).toBe('John');
		});

		it('returns undefined for non-existent paths', () => {
			const obj = reactive({user: {name: 'John'}});
			expect(ERO.getValue(obj, 'user.nonExistent')).toBe(void 0);
			expect(ERO.getValue(obj, 'nonExistent')).toBe(void 0);
		});
	});

	describe('setValue', () => {
		it('sets value on reactive object using path', () => {
			const obj = reactive({user: {name: 'John'}});
			ERO.setValue(obj, 'user.name', 'Jane');
			expect(obj.user.name).toBe('Jane');
		});

		it('sets value on plain object using path', () => {
			const obj = {user: {name: 'John'}} as any;
			ERO.setValue(obj, 'user.name', 'Jane');
			expect(obj.user.name).toBe('Jane');
		});

		it('supports absolute paths with "/" prefix', () => {
			const obj = reactive({user: {name: 'John'}});
			const user = obj.user;
			ERO.setValue(user, '/user.name', 'Jane');
			expect(obj.user.name).toBe('Jane');
		});

		it('creates intermediate objects when they don\'t exist', () => {
			const obj = reactive({} as any);
			ERO.setValue(obj, 'user.address.city', 'London');
			expect(obj.user.address.city).toBe('London');
		});
	});

	describe('emit', () => {
		it('manually triggers change event', () => {
			const obj = reactive({count: 0});
			const listener = vi.fn();
			ERO.on(obj, 'count', listener);

			ERO.emit(obj, 'count', 0, 1);

			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith(expect.objectContaining({
				oldValue: 0,
				newValue: 1,
				pathToRoot: 'count',
				pathToParent: 'count'
			}));
		});

		it('triggers appropriate listeners for emitted events', () => {
			const obj = reactive({user: {name: 'John'}});
			const globalListener = vi.fn();
			const userListener = vi.fn();
			const nameListener = vi.fn();

			ERO.on(obj, '*', globalListener);
			ERO.on(obj, 'user.*', userListener);
			ERO.on(obj, 'user.name', nameListener);

			ERO.emit(obj.user, 'name', 'John', 'Jane');

			expect(globalListener).toHaveBeenCalledTimes(1);
			expect(userListener).toHaveBeenCalledTimes(1);
			expect(nameListener).toHaveBeenCalledTimes(1);
		});
	});

	describe('setValueSilent', () => {
		describe('loud mode (default)', () => {
			it('triggers change events normally', () => {
				const obj = reactive({count: 0});
				const listener = vi.fn();
				ERO.on(obj, 'count', listener);

				ERO.setValueSilent(obj, 'count', 1, 'loud');

				expect(listener).toHaveBeenCalledTimes(1);
				expect(obj.count).toBe(1);
			});
		});

		describe('mute-all mode', () => {
			it('does not trigger any change events', () => {
				const obj = reactive({user: {name: 'John', age: 30}});
				const globalListener = vi.fn();
				const userListener = vi.fn();
				const nameListener = vi.fn();

				ERO.on(obj, '*', globalListener);
				ERO.on(obj, 'user.*', userListener);
				ERO.on(obj, 'user.name', nameListener);

				ERO.setValueSilent(obj, 'user.name', 'Jane', 'mute-all');

				expect(globalListener).not.toHaveBeenCalled();
				expect(userListener).not.toHaveBeenCalled();
				expect(nameListener).not.toHaveBeenCalled();
				expect(obj.user.name).toBe('Jane');
			});

			it('works for nested paths', () => {
				const obj = reactive({user: {address: {city: 'London'}}});
				const listener = vi.fn();
				ERO.on(obj, 'user.address.city', listener);

				ERO.setValueSilent(obj, 'user.address.city', 'Paris', 'mute-all');

				expect(listener).not.toHaveBeenCalled();
				expect(obj.user.address.city).toBe('Paris');
			});
		});

		describe('mute-leaf mode', () => {
			it('does not trigger event for leaf node change', () => {
				const obj = reactive({user: {name: 'John'}});
				const nameListener = vi.fn();
				const userListener = vi.fn();

				ERO.on(obj, 'user.name', nameListener);
				ERO.on(obj, 'user', userListener);

				ERO.setValueSilent(obj, 'user.name', 'Jane', 'mute-leaf');

				expect(nameListener).not.toHaveBeenCalled();
				expect(userListener).not.toHaveBeenCalled();
				expect(obj.user.name).toBe('Jane');
			});

			it('triggers events for intermediate path creation', () => {
				const obj = reactive({} as any);
				const intermediateListener = vi.fn();
				const leafListener = vi.fn();

				ERO.on(obj, 'user', intermediateListener);
				ERO.on(obj, 'user.address', intermediateListener);
				ERO.on(obj, 'user.address.city', leafListener);

				ERO.setValueSilent(obj, 'user.address.city', 'London', 'mute-leaf');

				expect(intermediateListener).toHaveBeenCalledTimes(2); // user created, address created
				expect(leafListener).not.toHaveBeenCalled(); // leaf change is muted
				expect(obj.user.address.city).toBe('London');
			});

			it('works for array indices as leaf nodes', () => {
				const obj = reactive({items: [1, 2, 3]});
				const listener = vi.fn();
				ERO.on(obj, 'items.[1]', listener);

				ERO.setValueSilent(obj, 'items.[1]', 200, 'mute-leaf');

				expect(listener).not.toHaveBeenCalled();
				expect(obj.items[1]).toBe(200);
			});
		});

		it('supports absolute paths with "/" prefix', () => {
			const obj = reactive({user: {name: 'John'}});
			const user = obj.user;
			const listener = vi.fn();
			ERO.on(obj, 'user.name', listener);

			ERO.setValueSilent(user, '/user.name', 'Jane', 'mute-all');

			expect(listener).not.toHaveBeenCalled();
			expect(obj.user.name).toBe('Jane');
		});

		it('works on plain objects (no events to mute)', () => {
			const obj = {user: {name: 'John'}} as any;
			ERO.setValueSilent(obj, 'user.name', 'Jane', 'mute-all');
			expect(obj.user.name).toBe('Jane');
		});
	});
});
