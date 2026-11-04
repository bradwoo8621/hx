import {describe, expect, it, vi} from 'vitest';
import {ERO, reactive} from '../src';

describe('Wildcard path matching', () => {
	it('should match a wildcard in the middle of a path', () => {
		const obj = reactive({
			items: [
				{name: 'first', title: 'a'},
				{name: 'second', title: 'b'}
			]
		});
		const listener = vi.fn();

		ERO.on(obj, 'items.*.name', listener);

		obj.items[0].name = 'updated-first';
		obj.items[1].name = 'updated-second';

		expect(listener).toHaveBeenCalledTimes(2);
		expect(listener).toHaveBeenNthCalledWith(1, expect.objectContaining({
			pathToRoot: 'items.[0].name'
		}));
		expect(listener).toHaveBeenNthCalledWith(2, expect.objectContaining({
			pathToRoot: 'items.[1].name'
		}));
	});

	it('should not match sibling properties or deeper paths', () => {
		const obj = reactive({items: [{name: 'a', title: 'b', detail: {name: 'c'}}]});
		const listener = vi.fn();

		ERO.on(obj, 'items.*.name', listener);

		obj.items[0].title = 'updated';
		obj.items[0].detail.name = 'updated';

		expect(listener).not.toHaveBeenCalled();
	});

	it('should not match when the wildcard element is replaced as a whole', () => {
		const obj = reactive({items: [{name: 'a'}]});
		const listener = vi.fn();

		ERO.on(obj, 'items.*.name', listener);

		obj.items[0] = {name: 'b'};

		expect(listener).not.toHaveBeenCalled();
	});

	it('should match multiple wildcards in one pattern', () => {
		const obj = reactive({
			groups: [
				{items: [{name: 'a'}]},
				{items: [{name: 'b'}]}
			]
		});
		const listener = vi.fn();

		ERO.on(obj, 'groups.*.items.*.name', listener);

		obj.groups[1].items[0].name = 'updated';

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith(expect.objectContaining({
			pathToRoot: 'groups.[1].items.[0].name'
		}));
	});

	it('should match a leading wildcard against root properties', () => {
		const obj = reactive({user: {name: 'John'}, other: {name: 'Jane'}, name: 'root'});
		const listener = vi.fn();

		ERO.on(obj, '*.name', listener);

		obj.user.name = 'A';
		obj.other.name = 'B';
		obj.name = 'C';

		expect(listener).toHaveBeenCalledTimes(2);
		expect(listener).toHaveBeenNthCalledWith(1, expect.objectContaining({
			pathToRoot: 'user.name'
		}));
		expect(listener).toHaveBeenNthCalledWith(2, expect.objectContaining({
			pathToRoot: 'other.name'
		}));
	});

	it('should not match a leading wildcard across more than one segment', () => {
		const obj = reactive({user: {profile: {name: 'John'}}});
		const listener = vi.fn();

		ERO.on(obj, '*.name', listener);

		obj.user.profile.name = 'Jane';

		expect(listener).not.toHaveBeenCalled();
	});

	it('should match wildcard segments against object property names', () => {
		const obj = reactive({users: {john: {age: 30}, jane: {age: 25}}});
		const listener = vi.fn();

		ERO.on(obj, 'users.*.age', listener);

		obj.users.jane.age = 26;

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith(expect.objectContaining({
			pathToRoot: 'users.jane.age'
		}));
	});

	it('should unregister middle wildcard listeners with off()', () => {
		const obj = reactive({items: [{name: 'a'}]});
		const listener = vi.fn();

		ERO.on(obj, 'items.*.name', listener);
		obj.items[0].name = 'b';
		expect(listener).toHaveBeenCalledTimes(1);

		ERO.off(obj, 'items.*.name', listener);
		obj.items[0].name = 'c';
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('should keep trailing wildcard subtree semantics', () => {
		const obj = reactive({user: {name: 'John', address: {city: 'Shanghai'}}});
		const listener = vi.fn();

		ERO.on(obj, 'user.*', listener);

		obj.user.name = 'Jane';
		obj.user.address.city = 'Beijing';
		obj.user = {name: 'Bob', address: {city: 'Paris'}};

		expect(listener).toHaveBeenCalledTimes(2);
	});

	it('should deliver once when a property is literally named "*"', () => {
		const obj = reactive({star: {'*': 1}});
		const listener = vi.fn();

		ERO.on(obj, 'star.*', listener);

		obj.star['*'] = 2;

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith(expect.objectContaining({
			pathToRoot: 'star.*'
		}));
	});

	it('should deliver once for deeper paths containing a literal "*"', () => {
		const obj = reactive({star: {'*': {value: 1}}});
		const listener = vi.fn();

		ERO.on(obj, 'star.*.value', listener);

		obj.star['*'].value = 2;

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith(expect.objectContaining({
			pathToRoot: 'star.*.value'
		}));
	});
});
