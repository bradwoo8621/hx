// noinspection DuplicatedCode

import {describe, expect, it} from 'vitest';
import {ERO, reactive, ValueChangedEvent} from '../src';

describe('Complex objects in reactive arrays', () => {
	it('should emit event when pushing an object to an array', () => {
		const obj = reactive({
			users: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'}
			]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'users', listener);

		obj.users.push({id: 3, name: 'Charlie'});

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('users');
		expect(capturedEvent!.pathToParent).toBe('users');
		expect(capturedEvent!.oldValue).toEqual([
			{id: 1, name: 'Alice'},
			{id: 2, name: 'Bob'}
		]);
		expect(capturedEvent!.newValue).toEqual([
			{id: 1, name: 'Alice'},
			{id: 2, name: 'Bob'},
			{id: 3, name: 'Charlie'}
		]);
	});

	it('should emit event when popping an object from an array', () => {
		const obj = reactive({
			users: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
				{id: 3, name: 'Charlie'}
			]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'users', listener);

		obj.users.pop();

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('users');
		expect(capturedEvent!.pathToParent).toBe('users');
		expect(capturedEvent!.oldValue).toEqual([
			{id: 1, name: 'Alice'},
			{id: 2, name: 'Bob'},
			{id: 3, name: 'Charlie'}
		]);
		expect(capturedEvent!.newValue).toEqual([
			{id: 1, name: 'Alice'},
			{id: 2, name: 'Bob'}
		]);
	});

	it('should emit event when splicing objects in an array', () => {
		const obj = reactive({
			users: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
				{id: 3, name: 'Charlie'}
			]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'users', listener);

		obj.users.splice(1, 1, {id: 4, name: 'David'});

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('users');
		expect(capturedEvent!.pathToParent).toBe('users');
		expect(capturedEvent!.oldValue).toEqual([
			{id: 1, name: 'Alice'},
			{id: 2, name: 'Bob'},
			{id: 3, name: 'Charlie'}
		]);
		expect(capturedEvent!.newValue).toEqual([
			{id: 1, name: 'Alice'},
			{id: 4, name: 'David'},
			{id: 3, name: 'Charlie'}
		]);
	});

	it('should emit event when modifying nested array property', () => {
		const obj = reactive({
			user: {
				id: 1,
				name: 'Alice',
				tags: ['admin', 'active']
			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'user.tags', listener);

		const user = obj.user;
		user.tags.push('verified');

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(user);
		expect(capturedEvent!.pathToRoot).toBe('user.tags');
		expect(capturedEvent!.pathToParent).toBe('tags');
		expect(capturedEvent!.oldValue).toEqual(['admin', 'active']);
		expect(capturedEvent!.newValue).toEqual(['admin', 'active', 'verified']);
	});

	it('should emit event when modifying array property of nested object', () => {
		const obj = reactive({
			users: [
				{id: 1, name: 'Alice', roles: ['admin']},
				{id: 2, name: 'Bob', roles: ['user']}
			]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'users.[0].roles', listener);

		const user0 = obj.users[0];
		user0.roles.push('moderator');

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(user0);
		expect(capturedEvent!.pathToRoot).toBe('users.[0].roles');
		expect(capturedEvent!.pathToParent).toBe('roles');
		expect(capturedEvent!.oldValue).toEqual(['admin']);
		expect(capturedEvent!.newValue).toEqual(['admin', 'moderator']);
	});

	it('should work with deeply nested object arrays', () => {
		const obj = reactive({
			organization: {
				name: 'Company',
				departments: [
					{
						name: 'Engineering',
						teams: [
							{name: 'Frontend', members: ['Alice', 'Bob']},
							{name: 'Backend', members: ['Charlie']}
						]
					}
				]
			}
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'organization.departments.[0].teams.[0].members', listener);

		const team0 = obj.organization.departments[0].teams[0];
		team0.members.push('David');

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(team0);
		expect(capturedEvent!.pathToRoot).toBe('organization.departments.[0].teams.[0].members');
		expect(capturedEvent!.pathToParent).toBe('members');
		expect(capturedEvent!.oldValue).toEqual(['Alice', 'Bob']);
		expect(capturedEvent!.newValue).toEqual(['Alice', 'Bob', 'David']);
	});

	it('should handle arrays with mixed primitive and object types', () => {
		const obj = reactive({
			items: [1, {value: 2}, 'three', {nested: {value: 4}}]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'items', listener);

		obj.items.push({value: 5});

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(obj);
		expect(capturedEvent!.pathToRoot).toBe('items');
		expect(capturedEvent!.pathToParent).toBe('items');
		expect(capturedEvent!.oldValue).toEqual([1, {value: 2}, 'three', {nested: {value: 4}}]);
		expect(capturedEvent!.newValue).toEqual([1, {value: 2}, 'three', {nested: {value: 4}}, {value: 5}]);
	});

	it('should emit event when adding new property to array element object', () => {
		const obj = reactive({
			users: [
				{id: 1, name: 'Alice'}
			]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'users.[0].email', listener);

		const user0 = obj.users[0];
		// @ts-ignore
		user0.email = 'alice@example.com';

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(user0);
		expect(capturedEvent!.pathToRoot).toBe('users.[0].email');
		expect(capturedEvent!.pathToParent).toBe('email');
		expect(capturedEvent!.oldValue).toBeUndefined();
		expect(capturedEvent!.newValue).toBe('alice@example.com');
	});

	it('should emit event when modifying property of array element object', () => {
		const obj = reactive({
			users: [
				{id: 1, name: 'Alice'}
			]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'users.[0].name', listener);

		const user0 = obj.users[0];
		user0.name = 'Alice Smith';

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(user0);
		expect(capturedEvent!.pathToRoot).toBe('users.[0].name');
		expect(capturedEvent!.pathToParent).toBe('name');
		expect(capturedEvent!.oldValue).toBe('Alice');
		expect(capturedEvent!.newValue).toBe('Alice Smith');
	});

	it('should emit event when deleting property from array element object', () => {
		const obj = reactive({
			users: [
				{id: 1, name: 'Alice', email: 'alice@example.com'}
			]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'users.[0].email', listener);

		const user0 = obj.users[0];
		delete user0.email;

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(user0);
		expect(capturedEvent!.pathToRoot).toBe('users.[0].email');
		expect(capturedEvent!.pathToParent).toBe('email');
		expect(capturedEvent!.oldValue).toBe('alice@example.com');
		expect(capturedEvent!.newValue).toBeUndefined();
	});

	it('should handle multiple listeners on different paths of complex structure', () => {
		const obj = reactive({
			users: [
				{id: 1, name: 'Alice', roles: ['admin']},
				{id: 2, name: 'Bob', roles: ['user']}
			]
		});
		let rolesEvent: ValueChangedEvent | null = null;

		const rolesListener = (event: ValueChangedEvent) => {
			rolesEvent = event;
		};

		ERO.on(obj, 'users.[0].roles', rolesListener);

		const user0 = obj.users[0];
		user0.roles.push('moderator');

		expect(rolesEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(rolesEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(rolesEvent.parent)).toBe(true);
		expect(rolesEvent.root).toBe(obj);
		expect(rolesEvent.parent).toBe(user0);
		expect(rolesEvent!.pathToRoot).toBe('users.[0].roles');
		expect(rolesEvent!.pathToParent).toBe('roles');
		expect(rolesEvent!.oldValue).toEqual(['admin']);
		expect(rolesEvent!.newValue).toEqual(['admin', 'moderator']);
	});

	it('should work with array of arrays containing objects', () => {
		const obj = reactive({
			matrix: [
				[{x: 1, y: 1}, {x: 2, y: 1}],
				[{x: 1, y: 2}, {x: 2, y: 2}]
			]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'matrix.[0]', listener);

		const matrix = obj.matrix;
		matrix[0].push({x: 3, y: 1});

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(matrix);
		expect(capturedEvent!.pathToRoot).toBe('matrix.[0]');
		expect(capturedEvent!.pathToParent).toBe('[0]');
		expect(capturedEvent!.oldValue).toEqual([
			{x: 1, y: 1},
			{x: 2, y: 1}
		]);
		expect(capturedEvent!.newValue).toEqual([
			{x: 1, y: 1},
			{x: 2, y: 1},
			{x: 3, y: 1}
		]);
	});

	it('should handle modifying nested object in array element', () => {
		const obj = reactive({
			users: [
				{id: 1, profile: {name: 'Alice', age: 25}}
			]
		});
		let capturedEvent: ValueChangedEvent | null = null;

		const listener = (event: ValueChangedEvent) => {
			capturedEvent = event;
		};

		ERO.on(obj, 'users.[0].profile.age', listener);

		const profile = obj.users[0].profile;
		profile.age = 26;

		expect(capturedEvent).not.toBeNull();
		expect(ERO.isReactiveRoot(capturedEvent.root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvent.parent)).toBe(true);
		expect(capturedEvent.root).toBe(obj);
		expect(capturedEvent.parent).toBe(profile);
		expect(capturedEvent!.pathToRoot).toBe('users.[0].profile.age');
		expect(capturedEvent!.pathToParent).toBe('age');
		expect(capturedEvent!.oldValue).toBe(25);
		expect(capturedEvent!.newValue).toBe(26);
	});

	it('should handle complex operations on object arrays', () => {
		const obj = reactive({
			items: [
				{id: 1, status: 'pending'},
				{id: 2, status: 'pending'},
				{id: 3, status: 'pending'}
			]
		});
		let capturedEvents: ValueChangedEvent[] = [];

		const listener = (event: ValueChangedEvent) => {
			capturedEvents.push(event);
		};

		ERO.on(obj, 'items', listener);

		// Reverse array
		obj.items.reverse();
		// Add new item
		obj.items.push({id: 4, status: 'pending'});

		expect(capturedEvents.length).toBe(2);
		expect(ERO.isReactiveRoot(capturedEvents[0].root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvents[0].parent)).toBe(true);
		expect(capturedEvents[0].root).toBe(obj);
		expect(capturedEvents[0].parent).toBe(obj);
		expect(capturedEvents[0]!.pathToRoot).toBe('items');
		expect(capturedEvents[0]!.pathToParent).toBe('items');
		expect(capturedEvents[0].oldValue).toEqual([
			{id: 1, status: 'pending'},
			{id: 2, status: 'pending'},
			{id: 3, status: 'pending'}
		]);
		expect(capturedEvents[0].newValue).toEqual([
			{id: 3, status: 'pending'},
			{id: 2, status: 'pending'},
			{id: 1, status: 'pending'}
		]);

		expect(ERO.isReactiveRoot(capturedEvents[1].root)).toBe(true);
		expect(ERO.isReactiveObject(capturedEvents[1].parent)).toBe(true);
		expect(capturedEvents[1].root).toBe(obj);
		expect(capturedEvents[1].parent).toBe(obj);
		expect(capturedEvents[1]!.pathToRoot).toBe('items');
		expect(capturedEvents[1]!.pathToParent).toBe('items');
		expect(capturedEvents[1].oldValue).toEqual([
			{id: 3, status: 'pending'},
			{id: 2, status: 'pending'},
			{id: 1, status: 'pending'}
		]);
		expect(capturedEvents[1].newValue).toEqual([
			{id: 3, status: 'pending'},
			{id: 2, status: 'pending'},
			{id: 1, status: 'pending'},
			{id: 4, status: 'pending'}
		]);
	});
});
