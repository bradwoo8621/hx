import {reactive} from '@hx/data';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HxMSelect, type HxMSelectProps, type HxObject} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

const options = [
	{value: 'a', label: 'Alpha'},
	{value: 'b', label: 'Beta'},
	{value: 'c', label: 'Gamma'}
];

type MSelectModel = {value?: string[]};

const renderMSelect = (model: HxObject<MSelectModel>, props: Partial<HxMSelectProps<MSelectModel>> = {}) => {
	return renderWithProvider(
		<HxMSelect $model={model} $field="value" options={options} {...props}/>
	);
};

describe('HxMSelect', () => {
	it('renders the selected option labels after options load', async () => {
		const model = reactive<MSelectModel>({value: ['a', 'b']});
		const {container} = renderMSelect(model);
		const select = queryByDataAttr(container, 'data-hx-m-select')!;
		expect(select.getAttribute('role')).toBe('select');
		await waitFor(() => {
			expect(select.textContent).toContain('Alpha');
			expect(select.textContent).toContain('Beta');
		});
		expect(select.getAttribute('data-hx-model-path')).toBe('value');
	});

	it('shows the placeholder when nothing is selected', async () => {
		const model = reactive<MSelectModel>({});
		const {container} = renderMSelect(model);
		await waitFor(() =>
			expect(queryByDataAttr(container, 'data-hx-m-select')!.textContent).toContain('HxCommon.SelectPlaceholder')
		);
	});

	it('adds an option from the popup and updates the model array', async () => {
		const model = reactive<MSelectModel>({value: ['a']});
		const {container} = renderMSelect(model);
		const select = queryByDataAttr(container, 'data-hx-m-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));

		fireEvent.click(select);
		const beta = await screen.findByText('Beta');
		fireEvent.click(beta);
		expect(model.value).toEqual(['a', 'b']);
	});

	it('removes an option when a selected option is clicked again', async () => {
		const model = reactive<MSelectModel>({value: ['a', 'b']});
		const {container} = renderMSelect(model);
		const select = queryByDataAttr(container, 'data-hx-m-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));

		fireEvent.click(select);
		await waitFor(() => expect(document.querySelectorAll('[data-hx-m-select-option]').length).toBe(3));
		const beta = [...document.querySelectorAll<HTMLElement>('[data-hx-m-select-option]')]
			.find(el => el.textContent === 'Beta')!;
		fireEvent.click(beta);
		expect(model.value).toEqual(['a']);
	});

	it('clears all values through the clear button', async () => {
		const model = reactive<MSelectModel>({value: ['a', 'b']});
		const {container} = renderMSelect(model, {clearable: true});
		const select = queryByDataAttr(container, 'data-hx-m-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));

		const clear = select.querySelector<HTMLElement>(':scope > [data-hx-m-select-icon="clear"]')!;
		fireEvent.click(clear);
		expect(model.value).toBeUndefined();
	});

	it('removes one value through the per-label clear button', async () => {
		const model = reactive<MSelectModel>({value: ['a', 'b']});
		const {container} = renderMSelect(model);
		const select = queryByDataAttr(container, 'data-hx-m-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));

		const perLabelClear = select.querySelector<HTMLElement>('[data-hx-m-select-icon="clear"]')!;
		fireEvent.click(perLabelClear);
		expect(model.value).toEqual(['b']);
	});

	it('does not render per-label clear buttons when disabled', async () => {
		const model = reactive<MSelectModel>({value: ['a', 'b']});
		const {container} = renderMSelect(model, {$disabled: true});
		const select = queryByDataAttr(container, 'data-hx-m-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));
		expect(select.querySelectorAll('[data-hx-m-select-icon="clear"]')).toHaveLength(0);
		expect(select.hasAttribute('tabindex')).toBe(false);
	});

	it('renders compact selected labels', async () => {
		const model = reactive<MSelectModel>({value: ['a', 'b']});
		const {container} = renderMSelect(model, {compact: true});
		const select = queryByDataAttr(container, 'data-hx-m-select')!;
		await waitFor(() =>
			expect(select.querySelector('[data-hx-m-select-input-options-compact]')).not.toBeNull()
		);
		const labels = select.querySelectorAll('[data-hx-m-select-input-label]');
		expect([...labels].map(el => el.textContent).slice(0, 2)).toEqual(['Alpha', 'Beta']);
	});

	it('supports fromModel and toModel conversions', async () => {
		const model = reactive({csv: 'a,b'});
		const {container} = renderWithProvider(
			<HxMSelect $model={model} $field="csv" options={options}
			           fromModel={value => value ? `${value}`.split(',') : []}
			           toModel={value => value?.join(',')}/>
		);
		const select = queryByDataAttr(container, 'data-hx-m-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));

		fireEvent.click(select);
		const gamma = await screen.findByText('Gamma');
		fireEvent.click(gamma);
		expect(model.csv).toBe('a,b,c');
	});

	it('does not open the popup when disabled', async () => {
		const model = reactive<MSelectModel>({value: ['a']});
		const {container} = renderMSelect(model, {$disabled: true});
		const select = queryByDataAttr(container, 'data-hx-m-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));
		fireEvent.click(select);
		expect(document.querySelectorAll('[data-hx-m-select-option]')).toHaveLength(0);
	});

	it('marks the hidden state through $visible', async () => {
		const model = reactive<MSelectModel>({value: ['a']});
		const {container} = renderMSelect(model, {$visible: false});
		expect(queryByDataAttr(container, 'data-hx-m-select')!.getAttribute('data-hx-visible')).toBe('no');
	});
});
