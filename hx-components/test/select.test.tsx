import {reactive} from '@hx/data';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HxSelect, type HxObject, type HxSelectProps} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

const options = [
	{value: 'a', label: 'Alpha'},
	{value: 'b', label: 'Beta'},
	{value: 'c', label: 'Gamma'}
];

type SelectModel = {value?: string | null};

const renderSelect = (model: HxObject<SelectModel>, props: Partial<HxSelectProps<SelectModel>> = {}) => {
	return renderWithProvider(
		<HxSelect $model={model} $field="value" options={options} {...props}/>
	);
};

describe('HxSelect', () => {
	it('shows the selected option label after options load', async () => {
		const model = reactive({value: 'a'});
		const {container} = renderSelect(model);
		const select = queryByDataAttr(container, 'data-hx-select')!;
		expect(select.getAttribute('role')).toBe('select');
		await waitFor(() => expect(select.textContent).toContain('Alpha'));
		expect(select.getAttribute('data-hx-model-path')).toBe('value');
	});

	it('shows the placeholder when no option is selected', async () => {
		const model = reactive<{value?: string}>({});
		const {container} = renderSelect(model);
		const select = queryByDataAttr(container, 'data-hx-select')!;
		await waitFor(() => expect(select.textContent).toContain('HxCommon.SelectPlaceholder'));
	});

	it('shows the loading label before options resolve', () => {
		const model = reactive({value: 'a'});
		const {container} = renderWithProvider(
			<HxSelect $model={model} $field="value" options={() => new Promise(() => (void 0))}/>
		);
		expect(queryByDataAttr(container, 'data-hx-select')!.textContent).toContain('HxCommon.SelectOptionsOnLoad');
	});

	it('opens the popup and selects an option', async () => {
		const model = reactive({value: 'a'});
		const {container} = renderSelect(model);
		const select = queryByDataAttr(container, 'data-hx-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));

		fireEvent.click(select);
		const beta = await screen.findByText('Beta');
		expect(document.querySelectorAll('[data-hx-select-option]').length).toBe(3);
		fireEvent.click(beta);

		expect(model.value).toBe('b');
		await waitFor(() => expect(select.textContent).toContain('Beta'));
	});

	it('opens the popup with the Space key by default', async () => {
		const model = reactive({value: 'a'});
		const {container} = renderSelect(model);
		const select = queryByDataAttr(container, 'data-hx-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));
		fireEvent.keyDown(select, {key: ' '});
		await waitFor(() => expect(document.querySelectorAll('[data-hx-select-option]').length).toBe(3));
	});

	it('opens the popup with ArrowDown', async () => {
		const model = reactive({value: 'a'});
		const {container} = renderSelect(model);
		const select = queryByDataAttr(container, 'data-hx-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));
		fireEvent.keyDown(select, {key: 'ArrowDown'});
		await waitFor(() => expect(document.querySelectorAll('[data-hx-select-option]').length).toBe(3));
	});

	it('clears the value through the clear button', async () => {
		const model = reactive<{value?: string | null}>({value: 'a'});
		const {container} = renderSelect(model, {clearable: true});
		const select = queryByDataAttr(container, 'data-hx-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));
		const clear = container.querySelector<HTMLElement>('[data-hx-select-icon="clear"]')!;
		fireEvent.click(clear);
		expect(model.value).toBeUndefined();
	});

	it('does not render the clear button when clearable is false or no value is selected', async () => {
		const model = reactive({value: 'a'});
		const {container} = renderSelect(model, {clearable: false});
		const select = queryByDataAttr(container, 'data-hx-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));
		expect(container.querySelectorAll('[data-hx-select-icon="clear"]')).toHaveLength(0);

		const emptyModel = reactive<{value?: string}>({});
		const empty = renderSelect(emptyModel, {clearable: true});
		await waitFor(() =>
			expect(queryByDataAttr(empty.container, 'data-hx-select')!.textContent).toContain('HxCommon.SelectPlaceholder')
		);
		expect(empty.container.querySelectorAll('[data-hx-select-icon="clear"]')).toHaveLength(0);
	});

	it('does not open the popup or accept focus when disabled', async () => {
		const model = reactive({value: 'a'});
		const {container} = renderSelect(model, {$disabled: true});
		const select = queryByDataAttr(container, 'data-hx-select')!;
		await waitFor(() => expect(select.textContent).toContain('Alpha'));
		expect(select.hasAttribute('tabindex')).toBe(false);
		fireEvent.click(select);
		// the popup opens in a later macrotask, so settle one before asserting absence;
		// a synchronous check holds even when the disabled guard is broken
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(document.querySelectorAll('[data-hx-select-option]')).toHaveLength(0);
	});

	it('marks the hidden state through $visible', async () => {
		const model = reactive({value: 'a'});
		const {container} = renderSelect(model, {$visible: false});
		expect(queryByDataAttr(container, 'data-hx-select')!.getAttribute('data-hx-visible')).toBe('no');
	});

	it('shows the empty options label in the popup', async () => {
		const model = reactive({value: undefined as string | undefined});
		const {container} = renderWithProvider(<HxSelect $model={model} $field="value" options={[]}/>);
		const select = queryByDataAttr(container, 'data-hx-select')!;
		fireEvent.click(select);
		await waitFor(() => expect(document.querySelector('[data-hx-select-options]')).not.toBeNull());
		expect(document.querySelector('[data-hx-select-options]')!.textContent).toContain('HxCommon.SelectNoOptions');
	});

	it('sorts options in the popup when sort is enabled', async () => {
		const model = reactive<{value?: string}>({});
		const unordered = [
			{value: 'c', label: 'Cherry'},
			{value: 'a', label: 'Apple'},
			{value: 'b', label: 'Banana'}
		];
		const {container} = renderWithProvider(
			<HxSelect $model={model} $field="value" options={unordered} sort/>
		);
		fireEvent.click(queryByDataAttr(container, 'data-hx-select')!);
		await waitFor(() => expect(document.querySelectorAll('[data-hx-select-option]').length).toBe(3));
		const labels = [...document.querySelectorAll('[data-hx-select-option]')].map(el => el.textContent);
		expect(labels).toEqual(['Apple', 'Banana', 'Cherry']);
	});

	it('renders the filter input when filter is enabled', async () => {
		const model = reactive({value: 'a'});
		const {container} = renderSelect(model, {filter: true});
		fireEvent.click(queryByDataAttr(container, 'data-hx-select')!);
		await waitFor(() => expect(document.querySelector('[data-hx-select-option]')).not.toBeNull());
		expect(document.querySelector('input[data-hx-select-input]')).not.toBeNull();
		const placeholder = document.querySelector('[data-hx-label-input-placeholder]');
		expect(placeholder).not.toBeNull();
		expect(placeholder!.textContent).toContain('HxCommon.SelectFilterPlaceholder');
	});

	it('keeps the filter text and re-applies it when options change while open', async () => {
		const fruits = [
			{value: 'apple', label: 'Apple'},
			{value: 'banana', label: 'Banana'},
			{value: 'cherry', label: 'Cherry'}
		];
		const veggies = [
			{value: 'basil', label: 'Basil'},
			{value: 'carrot', label: 'Carrot'},
			{value: 'pea', label: 'Pea'}
		];
		const model = reactive<{ value?: string | null, kind: string}>({kind: 'fruits'});
		const {container} = renderWithProvider(
			<HxSelect $model={model} $field="value" filter={true} optionsDependsOn={['kind']}
			          options={(m) => m?.kind === 'fruits' ? fruits : veggies}/>
		);
		const optionOf = (label: string): HTMLElement =>
			[...document.querySelectorAll<HTMLElement>('[data-hx-select-option]')]
				.find(el => el.textContent === label)!;

		fireEvent.click(queryByDataAttr(container, 'data-hx-select')!);
		await waitFor(() => expect(optionOf('Cherry')).toBeTruthy());
		const input = document.querySelector<HTMLInputElement>('input[data-hx-select-input]')!;
		fireEvent.change(input, {target: {value: 'ba'}});
		await waitFor(() => {
			expect(optionOf('Banana').style.display).not.toBe('none');
			expect(optionOf('Cherry').style.display).toBe('none');
		});

		// options mutate mid-flight while the filter is active
		model.kind = 'veggies';
		await waitFor(() => expect(optionOf('Basil')).toBeTruthy());

		// the filter text survives the options change and is re-applied to the new options
		expect(input.value).toBe('ba');
		expect(optionOf('Basil').style.display).not.toBe('none');
		expect(optionOf('Carrot').style.display).toBe('none');
		expect(optionOf('Pea').style.display).toBe('none');
	});

	it('restores option display when the filter disappears with shrinking options', async () => {
		const fruits = [
			{value: 'apple', label: 'Apple'},
			{value: 'banana', label: 'Banana'},
			{value: 'cherry', label: 'Cherry'}
		];
		const shrunk = [{value: 'apple', label: 'Apple'}];
		const model = reactive<{ value?: string | null, kind: string}>({kind: 'fruits'});
		const {container} = renderWithProvider(
			<HxSelect $model={model} $field="value" filterWhenOptionExceed={3} optionsDependsOn={['kind']}
			          options={(m) => m?.kind === 'fruits' ? fruits : shrunk}/>
		);
		const optionOf = (label: string): HTMLElement =>
			[...document.querySelectorAll<HTMLElement>('[data-hx-select-option]')]
				.find(el => el.textContent === label)!;

		fireEvent.click(queryByDataAttr(container, 'data-hx-select')!);
		await waitFor(() => expect(optionOf('Cherry')).toBeTruthy());
		const input = document.querySelector<HTMLInputElement>('input[data-hx-select-input]')!;
		fireEvent.change(input, {target: {value: 'ba'}});
		await waitFor(() => expect(optionOf('Apple').style.display).toBe('none'));

		// options shrink below the threshold: the filter input disappears and the text is cleared
		model.kind = 'shrunk';
		await waitFor(() => expect(document.querySelector('input[data-hx-select-input]')).toBeNull());

		// the surviving node was reused with display:none — it must be restored
		await waitFor(() => expect(optionOf('Apple').style.display).not.toBe('none'));
	});
});
