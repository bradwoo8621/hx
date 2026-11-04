import {describe, expect, it, vi} from 'vitest';
import {ERO, reactive} from '../src';

describe('Reactive root creation and protection', () => {
	it('throws when an array is used as the root', () => {
		expect(() => reactive([1, 2, 3])).toThrowError('Root cannot be an array.');
	});

	it('accepts a plain object and shares mutations with the original target', () => {
		const target = {count: 0};
		const root = reactive(target);

		root.count = 1;

		expect(target.count).toBe(1);
	});

	it('creates an independent root when wrapping an existing reactive object', () => {
		const first = reactive({count: 0});
		const listener = vi.fn();
		ERO.on(first, 'count', listener);

		const second = reactive(first);
		second.count = 1;

		expect(first.count).toBe(1);
		expect(second.count).toBe(1);
		expect(listener).not.toHaveBeenCalled();
		expect(ERO.revoke(second)).toBe(ERO.revoke(first));
	});

	it('unwraps reactive values assigned into the tree', () => {
		const source = reactive({value: {nested: 1}});
		const target = reactive({slot: {nested: 0}});

		target.slot = source.value;

		const raw = ERO.revoke<{slot: {nested: number}}>(target);
		expect(ERO.isReactiveObject(raw.slot)).toBe(false);
		expect(raw.slot).toEqual({nested: 1});

		const listener = vi.fn();
		ERO.on(target, 'slot.nested', listener);
		target.slot.nested = 2;
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('exposes reactive as a static method', () => {
		const obj = ERO.reactive({count: 0});

		expect(ERO.isReactiveRoot(obj)).toBe(true);
	});

	describe('protected symbols', () => {
		it('refuses to overwrite internal symbols', () => {
			const obj = reactive({name: 'John'});
			const getRoot = (obj as unknown as Record<symbol, unknown>)[ERO.FUNC_GET_ROOT];

			expect(Reflect.set(obj, ERO.FUNC_GET_ROOT, () => (void 0))).toBe(false);
			expect((obj as unknown as Record<symbol, unknown>)[ERO.FUNC_GET_ROOT]).toBe(getRoot);
			expect(ERO.isReactiveRoot(obj)).toBe(true);
		});

		it('refuses to delete internal symbols', () => {
			const obj = reactive({name: 'John'});

			expect(Reflect.deleteProperty(obj, ERO.FUNC_GET_ROOT)).toBe(false);
			expect(ERO.isReactiveRoot(obj)).toBe(true);
		});

		it('stores ordinary symbols without emitting change events', () => {
			const obj = reactive({name: 'John'});
			const listener = vi.fn();
			ERO.on(obj, '*', listener);
			const key = Symbol('metadata');

			expect(Reflect.set(obj, key, 1)).toBe(true);
			expect(Reflect.get(obj, key)).toBe(1);
			expect(listener).not.toHaveBeenCalled();
		});
	});

	describe('reactive validation', () => {
		it('rejects non-reactive values used as listeners targets', () => {
			expect(() => ERO.on(null, 'count', () => {})).toThrowError('Cannot expose a null or undefined value.');
			expect(() => ERO.on((void 0), 'count', () => {})).toThrowError('Cannot expose a null or undefined value.');
			expect(() => ERO.on(123, 'count', () => {})).toThrowError('Cannot expose a non-object value.');
			expect(() => ERO.on({}, 'count', () => {})).toThrowError('Cannot expose a non-reactive object value.');
		});

		it('rejects non-reactive values used as emit targets', () => {
			expect(() => ERO.emit({}, 'count', 0, 1)).toThrowError('Cannot expose a non-reactive object value.');
		});
	});

	describe('fake', () => {
		it('returns undefined and logs on every get', () => {
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const fake = ERO.fake<{name: string}>();

			expect(fake.name).toBeUndefined();
			expect(spy).toHaveBeenCalledWith('Always returns undefined, when getter[name] called on faked reactive object.');

			spy.mockRestore();
		});

		it('accepts writes and deletes while logging', () => {
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const fake = ERO.fake<{name: string}>();

			fake.name = 'John';
			expect(Reflect.deleteProperty(fake, 'name')).toBe(true);

			expect(spy).toHaveBeenCalledWith('Always returns true, when setter[name] called on faked reactive object.');
			expect(spy).toHaveBeenCalledWith('Always returns true, when deleter[name] called on faked reactive object.');

			spy.mockRestore();
		});
	});
});
