import {describe, expect, it} from 'vitest';
import {get, ModelPath, PathValue, set, type StrictPathValue} from '../src';

describe('Model path test', () => {
	describe('get function', () => {
		it('should get simple property', () => {
			const obj = {name: 'test', value: 123};
			expect(get(obj, 'name')).toBe('test');
			expect(get(obj, 'value')).toBe(123);
		});

		it('should get nested object property', () => {
			const obj = {
				nested: {
					deep: {
						value: 'deep value'
					}
				}
			};
			expect(get(obj, 'nested')).toEqual({deep: {value: 'deep value'}});
			expect(get(obj, 'nested.deep')).toEqual({value: 'deep value'});
			expect(get(obj, 'nested.deep.value')).toBe('deep value');
		});

		it('should get array element', () => {
			const obj = {items: ['a', 'b', 'c']};
			expect(get(obj, 'items')).toEqual(['a', 'b', 'c']);
			expect(get(obj, 'items.[0]')).toBe('a');
			expect(get(obj, 'items.[1]')).toBe('b');
			expect(get(obj, 'items.[2]')).toBe('c');
		});

		it('should get nested array element', () => {
			const obj = {
				data: {
					items: [{id: 1, name: 'item1'}, {id: 2, name: 'item2'}]
				}
			};
			expect(get(obj, 'data.items.[0]')).toEqual({id: 1, name: 'item1'});
			expect(get(obj, 'data.items.[1].id')).toBe(2);
			expect(get(obj, 'data.items.[1].name')).toBe('item2');
		});

		it('should get multi-dimensional array element', () => {
			const obj = {
				matrix: [
					[1, 2, 3],
					[4, 5, 6]
				]
			};
			expect(get(obj, 'matrix.[0]')).toEqual([1, 2, 3]);
			expect(get(obj, 'matrix.[0].[0]')).toBe(1);
			expect(get(obj, 'matrix.[0].[1]')).toBe(2);
			expect(get(obj, 'matrix.[1].[2]')).toBe(6);
		});

		it('should get from object array', () => {
			const obj = {
				users: [
					[{id: 1, name: 'user1'}],
					[{id: 2, name: 'user2'}]
				]
			};
			expect(get(obj, 'users.[0].[0]')).toEqual({id: 1, name: 'user1'});
			expect(get(obj, 'users.[1].[0].id')).toBe(2);
		});

		it('should return undefined for invalid path', () => {
			const obj = {name: 'test'};
			expect(get(obj, 'nonexistent')).toBeUndefined();
			expect(get(obj, 'nested.value')).toBeUndefined();
		});

		it('should return undefined for out of bounds array index', () => {
			const obj = {items: ['a', 'b']};
			expect(get(obj, 'items.[5]')).toBeUndefined();
		});

		it('should return undefined for array access on non-array', () => {
			const obj = {value: 'string'};
			expect(get(obj, 'value.[0]')).toBeUndefined();
		});
	});

	describe('set function', () => {
		it('should set simple property', () => {
			const obj = {name: 'test'};
			set(obj, 'name', 'updated');
			expect(obj.name).toBe('updated');
		});

		it('should set nested object property', () => {
			const obj = {nested: {value: 'old'}};
			set(obj, 'nested.value', 'new');
			expect(obj.nested.value).toBe('new');
		});

		it('should set array element', () => {
			const obj = {items: ['a', 'b', 'c']};
			set(obj, 'items.[0]', 'x');
			set(obj, 'items.[2]', 'z');
			expect(obj.items).toEqual(['x', 'b', 'z']);
		});

		it('should set nested array element', () => {
			const obj = {
				data: {
					items: [{id: 1}, {id: 2}]
				}
			};
			set(obj, 'data.items.[0].id', 10);
			expect(obj.data.items[0].id).toBe(10);
		});

		it('should set multi-dimensional array element', () => {
			const obj = {
				matrix: [
					[1, 2],
					[3, 4]
				]
			};
			set(obj, 'matrix.[0].[0]', 10);
			set(obj, 'matrix.[1].[1]', 20);
			expect(obj.matrix[0][0]).toBe(10);
			expect(obj.matrix[1][1]).toBe(20);
		});

		it('should create intermediate objects for nested path', () => {
			const obj = {} as any;
			set(obj, 'nested.deep.value', 'created');
			expect(obj.nested.deep.value).toBe('created');
		});

		it('should create intermediate arrays for array path', () => {
			const obj = {} as any;
			set(obj, 'items.[0]', 'first');
			expect(obj.items).toEqual(['first']);
		});

		it('should extend array when setting out of bounds index', () => {
			const obj = {items: ['a']};
			set(obj, 'items.[3]', 'd');
			expect(obj.items).toEqual(['a', undefined, undefined, 'd']);
		});

		it('should create nested array structure', () => {
			const obj = {} as any;
			// @ts-expect-error
			set(obj, 'matrix.[0].[0]', 1);
			expect(obj.matrix).toEqual([[1]]);
		});

		it('should create mixed object and array structure', () => {
			const obj = {} as any;
			// @ts-expect-error
			set(obj, 'data.items.[0].id', 1);
			expect(obj.data.items[0].id).toBe(1);
		});

		it('should throw error for array access on non-array property', () => {
			const obj = {value: 'string'} as any;
			expect(() => set(obj, 'value.[0]', 'x')).toThrow('Cannot use array access on non-array property value');
		});

		it('should return the original object', () => {
			const obj = {name: 'test'};
			const result = set(obj, 'name', 'updated');
			expect(result).toBe(obj);
		});
	});

	it('path type check', () => {
		type ExampleType = {
			name: string;
			items: Array<{
				id: number;
				tags: string[];
			}>;
			metadata: {
				created: string;
				updated?: string;
			};
			a2: string[][];
			a3: { id: number }[][],
		};

		// noinspection JSUnusedLocalSymbols
		const validPaths: ModelPath<ExampleType>[] = [
			'name',
			'items',
			'items.[0]',
			'items.[0].id',
			'items.[0].tags',
			'items.[0].tags.[1]',
			'metadata',
			'metadata.created',
			'metadata.updated',
			'a2',
			'a2.[0]',
			'a2.[0].[0]',
			'a3.[0]',
			'a3.[0].[0]',
			'a3.[0].[0].id'
		];
		expect(validPaths).not.toBeNull();

		type ExampleTypeName = StrictPathValue<ExampleType, 'name'>;
		// type ExampleTypeItems = StrictPathValue<ExampleType, 'items'>;
		// type ExampleTypeItems0 = PathValue<ExampleType, 'items.[0]'>;
		type ExampleTypeItemsId = PathValue<ExampleType, 'items.[0].id'>;
		type ExampleTypeItemsTags = PathValue<ExampleType, 'items.[0].tags'>;
		// type ExampleTypeItemsTags0 = PathValue<ExampleType, 'items.[0].tags.[0]'>;
		// type ExampleTypeMetaData = PathValue<ExampleType, 'metadata'>;
		// type ExampleTypeMetaDataCreated = PathValue<ExampleType, 'metadata.created'>;
		// type ExampleTypeMetaDataUpdated = PathValue<ExampleType, 'metadata.updated'>;
		// type ExampleTypeA2 = PathValue<ExampleType, 'a2'>;
		// type ExampleTypeA20 = PathValue<ExampleType, 'a2.[0]'>;
		type ExampleTypeA200 = PathValue<ExampleType, 'a2.[0].[0]'>;
		// type ExampleTypeA3 = PathValue<ExampleType, 'a3'>;
		// type ExampleTypeA30 = PathValue<ExampleType, 'a3.[0]'>;
		// type ExampleTypeA300 = PathValue<ExampleType, 'a3.[0].[0]'>;
		type ExampleTypeA300Id = PathValue<ExampleType, 'a3.[0].[0].id'>;

		// type TestPath<T, Expected extends string> = Expected extends ModelPath<T> ? true : false;

		// Type assertions - these will fail at compile time if types are wrong
		const typeCheck1: ExampleTypeName extends string ? true : never = true;
		const typeCheck2: ExampleTypeItemsId extends number ? true : never = true;
		const typeCheck3: ExampleTypeItemsTags extends string[] ? true : never = true;
		const typeCheck4: ExampleTypeA200 extends string ? true : never = true;
		const typeCheck5: ExampleTypeA300Id extends number ? true : never = true;

		// Verify path types compile correctly
		expect(typeCheck1).toBe(true);
		expect(typeCheck2).toBe(true);
		expect(typeCheck3).toBe(true);
		expect(typeCheck4).toBe(true);
		expect(typeCheck5).toBe(true);

		// Uncomment to verify invalid paths cause compile errors:
		// const invalidPaths: ModelPath<ExampleType>[] = [
		//     'nonexistent',    // ❌ Error: Type '"nonexistent"' is not assignable to type 'ModelPath<ExampleType>'
		//     'items.[0].xyz',  // ❌ Error: Type '"items.[0].xyz"' is not assignable to type 'ModelPath<ExampleType>'
		// ];
	});
});