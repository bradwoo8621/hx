import {describe, expect, it} from 'vitest';
import {ERO, reactive} from '../src';

describe('Array element search', () => {
	it('finds elements by their reactive proxy with indexOf', () => {
		const obj = reactive({items: [{id: 1}, {id: 2}]});

		expect(obj.items.indexOf(obj.items[0])).toBe(0);
		expect(obj.items.indexOf(obj.items[1])).toBe(1);
	});

	it('finds the underlying object with indexOf', () => {
		const obj = reactive({items: [{id: 1}, {id: 2}]});
		const raw = ERO.revoke<{items: Array<{id: number}>}>(obj);

		expect(obj.items.indexOf(raw.items[0])).toBe(0);
		expect(obj.items.indexOf(raw.items[1])).toBe(1);
	});

	it('finds primitive elements with indexOf', () => {
		const obj = reactive({items: [10, 20, 30]});

		expect(obj.items.indexOf(20)).toBe(1);
		expect(obj.items.indexOf(40)).toBe(-1);
	});

	it('handles null and undefined elements', () => {
		const obj = reactive({items: [1, null, 3, (void 0)] as Array<number | null | undefined>});

		expect(obj.items.indexOf(3)).toBe(2);
		expect(obj.items.indexOf(null)).toBe(1);
		expect(obj.items.indexOf((void 0))).toBe(3);
		expect(obj.items.indexOf(4)).toBe(-1);
		expect(obj.items.lastIndexOf(3, 3)).toBe(2);
	});

	it('supports fromIndex for indexOf', () => {
		const obj = reactive({items: [1, 2, 1, 2]});

		expect(obj.items.indexOf(1)).toBe(0);
		expect(obj.items.indexOf(1, 1)).toBe(2);
		expect(obj.items.indexOf(2, 2)).toBe(3);
		expect(obj.items.indexOf(1, -1)).toBe(-1);
	});

	it('returns -1 when no element matches', () => {
		const obj = reactive({items: [{id: 1}]});

		expect(obj.items.indexOf({id: 1})).toBe(-1);
	});

	it('searches the whole array when fromIndex is omitted', () => {
		const obj = reactive({items: [1, 2, 3]});

		expect(obj.items.lastIndexOf(3)).toBe(2);
		expect(obj.items.lastIndexOf(2)).toBe(1);
		expect(obj.items.lastIndexOf(1)).toBe(0);
		expect(obj.items.lastIndexOf(4)).toBe(-1);

		const objects = reactive({items: [{id: 1}, {id: 2}]});
		expect(objects.items.lastIndexOf(objects.items[1])).toBe(1);
	});

	it('supports lastIndexOf when fromIndex is provided', () => {
		const nums = reactive({items: [1, 2, 1, 2]});

		expect(nums.items.lastIndexOf(1, 2)).toBe(2);
		expect(nums.items.lastIndexOf(2, 5)).toBe(3);

		const objects = reactive({items: [{id: 1}, {id: 2}]});
		const raw = ERO.revoke<{items: Array<{id: number}>}>(objects);
		expect(objects.items.lastIndexOf(raw.items[1], 5)).toBe(1);
	});

	it('finds elements in nested arrays', () => {
		const obj = reactive({matrix: [[{id: 1}], [{id: 2}]]});
		const row = obj.matrix[1];

		expect(row.indexOf(row[0])).toBe(0);
	});
});
