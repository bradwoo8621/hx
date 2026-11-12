import {reactive} from '@hx/data';
import {waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HxOptionsLabel, type HxObject} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

type TestModel = { value?: unknown };

const renderLabel = (model: HxObject<TestModel>, options: Parameters<typeof HxOptionsLabel>[0]['options']) => {
	return renderWithProvider(
		<HxOptionsLabel $model={model} $field="value" options={options}/>
	);
};

const stateOf = (container: HTMLElement): string => {
	const el = queryByDataAttr(container, 'data-hx-options-label');
	return el?.getAttribute('data-hx-options-label-state') ?? '';
};

describe('HxOptionsLabel', () => {
	it('renders the matched option label for a single value', async () => {
		const model = reactive<TestModel>({value: 'a'});
		const {container} = renderLabel(model, [
			{value: 'a', label: 'Alpha'},
			{value: 'b', label: 'Beta'}
		]);
		await waitFor(() => expect(stateOf(container)).toBe('option-found'));
		expect(queryByDataAttr(container, 'data-hx-options-label')?.textContent).toBe('Alpha');
		expect(queryByDataAttr(container, 'data-hx-options-label')?.getAttribute('data-hx-options-label-value')).toBe('a');
	});

	it('prefers selectedLabel over label when present', async () => {
		const model = reactive<TestModel>({value: 'a'});
		const {container} = renderLabel(model, [
			{value: 'a', label: 'Alpha', selectedLabel: 'The Alpha'}
		]);
		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-options-label')?.textContent).toBe('The Alpha'));
	});

	it('matches numeric option values loosely', async () => {
		const model = reactive<TestModel>({value: 1});
		const {container} = renderLabel(model, [
			{value: 1, label: 'Odd'},
			{value: 2, label: 'Even'}
		]);
		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-options-label')?.textContent).toBe('Odd'));
	});

	it('joins matched values of an array with commas', async () => {
		const model = reactive<TestModel>({value: ['a', 'b']});
		const {container} = renderLabel(model, [
			{value: 'a', label: 'Alpha'},
			{value: 'b', label: 'Beta'},
			{value: 'c', label: 'Gamma'}
		]);
		await waitFor(() => expect(stateOf(container)).toBe('option-found'));
		expect(queryByDataAttr(container, 'data-hx-options-label')?.textContent).toBe('Alpha,Beta');
		expect(queryByDataAttr(container, 'data-hx-options-label')?.getAttribute('data-hx-options-label-value')).toBe('a,b');
	});

	it('skips missing values and marks the state as some-option-not-found', async () => {
		const model = reactive<TestModel>({value: ['a', 'x']});
		const {container} = renderLabel(model, [
			{value: 'a', label: 'Alpha'},
			{value: 'b', label: 'Beta'}
		]);
		await waitFor(() => expect(stateOf(container)).toBe('some-option-not-found'));
		expect(queryByDataAttr(container, 'data-hx-options-label')?.textContent).toBe('Alpha');
	});

	it('shows the not-found state with empty text when no array value matches', async () => {
		const model = reactive<TestModel>({value: ['x', 'y']});
		const {container} = renderLabel(model, [
			{value: 'a', label: 'Alpha'}
		]);
		await waitFor(() => expect(stateOf(container)).toBe('option-not-found'));
		expect(queryByDataAttr(container, 'data-hx-options-label')?.textContent).toBe('');
	});

	it('shows the not-found key text for a missing single value', async () => {
		const model = reactive<TestModel>({value: 'x'});
		const {container} = renderWithProvider(
			<HxOptionsLabel $model={model} $field="value"
			                options={[{value: 'a', label: 'Alpha'}]}
			                optionNotFoundKey="Not Found"/>
		);
		await waitFor(() => expect(stateOf(container)).toBe('option-not-found'));
		expect(queryByDataAttr(container, 'data-hx-options-label')?.textContent).toBe('Not Found');
	});

	it('shows the no-value state when the model value is null', async () => {
		const model = reactive<TestModel>({value: null});
		const {container} = renderLabel(model, [
			{value: 'a', label: 'Alpha'}
		]);
		await waitFor(() => expect(stateOf(container)).toBe('no-value'));
		expect(queryByDataAttr(container, 'data-hx-options-label')?.textContent).toBe('');
	});

	it('shows the no-options state when the options array is empty', async () => {
		const model = reactive<TestModel>({value: 'a'});
		const {container} = renderWithProvider(
			<HxOptionsLabel $model={model} $field="value" options={[]}
			                noOptionsKey="No Options"/>
		);
		await waitFor(() => expect(stateOf(container)).toBe('no-options'));
		expect(queryByDataAttr(container, 'data-hx-options-label')?.textContent).toBe('No Options');
	});

	it('shows the loading state until async options resolve', async () => {
		const model = reactive<TestModel>({value: 'a'});
		const {container} = renderWithProvider(
			<HxOptionsLabel $model={model} $field="value"
			                options={async () => {
				                await new Promise(resolve => setTimeout(resolve, 50));
				                return [{value: 'a', label: 'Alpha'}];
			                }}
			                optionsOnLoadKey="Loading..."/>
		);
		expect(stateOf(container)).toBe('loading');
		expect(queryByDataAttr(container, 'data-hx-options-label')?.textContent).toBe('Loading...');
		await waitFor(() => expect(stateOf(container)).toBe('option-found'));
		expect(queryByDataAttr(container, 'data-hx-options-label')?.textContent).toBe('Alpha');
	});
});
