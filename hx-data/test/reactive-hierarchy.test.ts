import {describe, expect, it} from 'vitest';
import {ERO, reactive} from '../src';

describe('Reactive hierarchy navigation', () => {
	describe('rootOf and parentOf', () => {
		it('returns the same root from nested objects and arrays', () => {
			const root = reactive({users: [{addresses: [{city: 'New York'}]}]});
			const users = root.users;
			const user = users[0];
			const addresses = user.addresses;
			const address = addresses[0];

			expect(ERO.rootOf(user)).toBe(root);
			expect(ERO.rootOf(users)).toBe(root);
			expect(ERO.rootOf(address)).toBe(root);
			expect(ERO.parentOf(root)).toBe((void 0));
			expect(ERO.parentOf(users)).toBe(root);
			expect(ERO.parentOf(user)).toBe(users);
			expect(ERO.parentOf(addresses)).toBe(user);
			expect(ERO.parentOf(address)).toBe(addresses);
		});
	});

	describe('pathToRoot and pathToParent', () => {
		it('returns empty strings for the root', () => {
			const root = reactive({user: {name: 'John'}});

			expect(ERO.pathToRoot(root)).toBe('');
			expect(ERO.pathToParent(root)).toBe('');
		});

		it('returns absolute paths for nested objects', () => {
			const root = reactive({user: {address: {city: 'New York'}}});
			const address = root.user.address;

			expect(ERO.pathToRoot(root.user)).toBe('user');
			expect(ERO.pathToRoot(address)).toBe('user.address');
			expect(ERO.pathToParent(root.user)).toBe('user');
			expect(ERO.pathToParent(address)).toBe('address');
		});

		it('returns bracket notation for nested array elements', () => {
			const root = reactive({users: [{addresses: [{city: 'New York'}]}]});
			const user = root.users[0];
			const address = user.addresses[0];

			expect(ERO.pathToRoot(user)).toBe('users.[0]');
			expect(ERO.pathToRoot(address)).toBe('users.[0].addresses.[0]');
		});
	});

	describe('pathOf', () => {
		it('returns the object path when no extra path is requested', () => {
			const root = reactive({user: {address: {city: 'New York'}}});
			const address = root.user.address;

			expect(ERO.pathOf(root)).toBe('');
			expect(ERO.pathOf(address)).toBe('user.address');
		});

		it('appends standard paths to the object path', () => {
			const root = reactive({user: {address: {city: 'New York'}}});

			expect(ERO.pathOf(root, 'user.name')).toBe('user.name');
			expect(ERO.pathOf(root.user, 'address.city')).toBe('user.address.city');
			expect(ERO.pathOf(root.user.address, 'city')).toBe('user.address.city');
		});

		it('resolves "./" relative paths', () => {
			const root = reactive({user: {address: {city: 'New York'}}});
			const address = root.user.address;

			expect(ERO.pathOf(address, './city')).toBe('user.address.city');
		});

		it('resolves "../" parent traversal', () => {
			const root = reactive({user: {address: {city: 'New York'}, name: 'John'}});
			const address = root.user.address;

			expect(ERO.pathOf(address, '../name')).toBe('user.name');
			expect(ERO.pathOf(address, '../../name')).toBe('name');
		});

		it('stops at the root when traversing above it', () => {
			const root = reactive({name: 'root', user: {address: {city: 'New York'}}});
			const address = root.user.address;

			expect(ERO.pathOf(address, '../../../name')).toBe('name');
		});

		it('strips the leading slash of an absolute path', () => {
			const root = reactive({user: {name: 'John'}});
			const user = root.user;

			expect(ERO.pathOf(user, '/user.name')).toBe('user.name');
		});
	});

	describe('loosePathOf', () => {
		it('returns undefined for null and undefined values', () => {
			expect(ERO.loosePathOf(null)).toBe((void 0));
			expect(ERO.loosePathOf((void 0))).toBe((void 0));
		});

		it('delegates to pathOf for reactive objects', () => {
			const root = reactive({user: {address: {city: 'New York'}}});
			const address = root.user.address;

			expect(ERO.loosePathOf(address)).toBe('user.address');
			expect(ERO.loosePathOf(address, './city')).toBe('user.address.city');
		});

		it('throws for non-reactive values', () => {
			expect(() => ERO.loosePathOf({}, 'name')).toThrowError('Cannot expose a non-reactive object value.');
		});
	});

	describe('getValue and setValue with relative paths', () => {
		const createRoot = () => reactive({user: {address: {city: 'New York'}, name: 'John'}});

		it('gets values using "./" and "../" paths', () => {
			const root = createRoot();
			const address = root.user.address;

			expect(ERO.getValue(address, './city')).toBe('New York');
			expect(ERO.getValue(address, '../name')).toBe('John');
		});

		it('gets values using absolute paths', () => {
			const root = createRoot();

			expect(ERO.getValue(root.user.address, '/user.name')).toBe('John');
		});

		it('sets values using "./" and "../" paths', () => {
			const root = createRoot();
			const address = root.user.address;

			ERO.setValue(address, './city', 'London');
			ERO.setValue(address, '../name', 'Jane');

			expect(root.user.address.city).toBe('London');
			expect(root.user.name).toBe('Jane');
		});

		it('sets values using absolute paths', () => {
			const root = createRoot();

			ERO.setValue(root.user.address, '/user.name', 'Jane');

			expect(root.user.name).toBe('Jane');
		});
	});
});
