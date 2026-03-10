import {describe, it} from 'vitest';
import {ModelPath, PathValue, type StrictPathValue} from '../src';

describe('Model path test', () => {
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
			'a3.[0].[0].id',
		];

		type ExampleTypeName = StrictPathValue<ExampleType, 'name'>;
		type ExampleTypeItems = StrictPathValue<ExampleType, 'items'>;
		type ExampleTypeItems0 = PathValue<ExampleType, 'items.[0]'>;
		type ExampleTypeItemsId = PathValue<ExampleType, 'items.[0].id'>;
		type ExampleTypeItemsTags = PathValue<ExampleType, 'items.[0].tags'>;
		type ExampleTypeItemsTags0 = PathValue<ExampleType, 'items.[0].tags.[0]'>;
		type ExampleTypeMetaData = PathValue<ExampleType, 'metadata'>;
		type ExampleTypeMetaDataCreated = PathValue<ExampleType, 'metadata.created'>;
		type ExampleTypeMetaDataUpdated = PathValue<ExampleType, 'metadata.updated'>;
		type ExampleTypeA2 = PathValue<ExampleType, 'a2'>;
		type ExampleTypeA20 = PathValue<ExampleType, 'a2.[0]'>;
		type ExampleTypeA200 = PathValue<ExampleType, 'a2.[0].[0]'>;
		type ExampleTypeA3 = PathValue<ExampleType, 'a3'>;
		type ExampleTypeA30 = PathValue<ExampleType, 'a3.[0]'>;
		type ExampleTypeA300 = PathValue<ExampleType, 'a3.[0].[0]'>;
		type ExampleTypeA300Id = PathValue<ExampleType, 'a3.[0].[0].id'>;

		type TestPath<T, Expected extends string> = Expected extends ModelPath<T> ? true : false;
	});
});