import {reactive} from '@hx/data';
import {fireEvent, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HxCheckbox, HxMCheckbox, HxMRadio, HxRadio} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

describe('HxCheckbox', () => {
	it('renders an unchecked checkbox when the model value is the unchecked value', () => {
		const model = reactive({accepted: false});
		const {container} = renderWithProvider(<HxCheckbox $model={model} $field="accepted" text="Accept"/>);
		const root = queryByDataAttr(container, 'data-hx-checkbox')!;
		const control = screen.getByRole('checkbox');
		expect(root.hasAttribute('data-hx-checkbox-checked')).toBe(false);
		expect(control.getAttribute('tabindex')).toBe('0');
		expect(screen.getByText('Accept')).toBeTruthy();
	});

	it('toggles the model value on click and reflects the checked state', () => {
		const model = reactive({accepted: false});
		const {container} = renderWithProvider(<HxCheckbox $model={model} $field="accepted"/>);
		fireEvent.click(screen.getByRole('checkbox'));
		expect(model.accepted).toBe(true);
		expect(queryByDataAttr(container, 'data-hx-checkbox')!.getAttribute('data-hx-checkbox-checked')).toBe('');
		expect(screen.getByRole('checkbox').getAttribute('tabindex')).toBe('0');
	});

	it('supports a custom value pair', () => {
		const model = reactive({answer: 'N'});
		renderWithProvider(<HxCheckbox $model={model} $field="answer" values={['Y', 'N']}/>);
		fireEvent.click(screen.getByRole('checkbox'));
		expect(model.answer).toBe('Y');
	});

	it('supports a custom checked-value predicate', () => {
		const model = reactive({answer: 'yes'});
		const {container} = renderWithProvider(
			<HxCheckbox $model={model} $field="answer" values={['y', 'n', value => value === 'yes']}/>
		);
		expect(queryByDataAttr(container, 'data-hx-checkbox')!.getAttribute('data-hx-checkbox-checked')).toBe('');
	});

	it('toggles from the label and focuses the control', () => {
		const model = reactive({accepted: false});
		renderWithProvider(<HxCheckbox $model={model} $field="accepted" text="Accept"/>);
		fireEvent.click(screen.getByText('Accept'));
		expect(model.accepted).toBe(true);
		expect(document.activeElement).toBe(screen.getByRole('checkbox'));
	});

	it('toggles with Space but not Enter by default', () => {
		const model = reactive({value: false});
		renderWithProvider(<HxCheckbox $model={model} $field="value"/>);
		const control = screen.getByRole('checkbox');
		fireEvent.keyDown(control, {key: 'Enter'});
		expect(model.value).toBe(false);
		fireEvent.keyDown(control, {key: ' '});
		expect(model.value).toBe(true);
	});

	it('toggles with Enter when enterToSwitchValue is enabled', () => {
		const model = reactive({value: false});
		renderWithProvider(<HxCheckbox $model={model} $field="value" enterToSwitchValue/>);
		fireEvent.keyDown(screen.getByRole('checkbox'), {key: 'Enter'});
		expect(model.value).toBe(true);
	});

	it('does not toggle and drops the tab stop when disabled', () => {
		const model = reactive({value: false});
		const {container} = renderWithProvider(<HxCheckbox $model={model} $field="value" $disabled/>);
		fireEvent.click(screen.getByRole('checkbox'));
		expect(model.value).toBe(false);
		expect(queryByDataAttr(container, 'data-hx-checkbox')).not.toBeNull();
		expect(screen.getByRole('checkbox').hasAttribute('tabindex')).toBe(false);
		expect(queryByDataAttr(container, 'data-hx-checkbox')!.getAttribute('data-hx-disabled')).toBe('');
	});

	it('adds the hover marker on label hover', () => {
		const model = reactive({value: false});
		renderWithProvider(<HxCheckbox $model={model} $field="value" text="Hover"/>);
		const control = screen.getByRole('checkbox');
		fireEvent.mouseEnter(screen.getByText('Hover'));
		expect(control.getAttribute('data-hx-hover')).toBe('');
		fireEvent.mouseLeave(screen.getByText('Hover'));
		expect(control.hasAttribute('data-hx-hover')).toBe(false);
	});
});

describe('HxRadio', () => {
	it('reflects the checked value from the model', () => {
		const model = reactive({choice: 'a'});
		const {container} = renderWithProvider(<HxRadio $model={model} $field="choice" values={['a', 'b']}/>);
		expect(queryByDataAttr(container, 'data-hx-radio')!.getAttribute('data-hx-radio-checked')).toBe('');
	});

	it('selects a value on click', () => {
		const checkedModel = reactive({choice: 'a'});
		const checked = renderWithProvider(
			<HxRadio $model={checkedModel} $field="choice" values={['a', 'b']}/>
		);
		// the radio is already checked, and unchecked clicking is not allowed
		fireEvent.click(screen.getByRole('radio'));
		expect(checkedModel.choice).toBe('a');
		checked.unmount();

		const uncheckedModel = reactive({choice: 'a'});
		renderWithProvider(<HxRadio $model={uncheckedModel} $field="choice" values={['b', 'a']}/>);
		fireEvent.click(screen.getByRole('radio'));
		expect(uncheckedModel.choice).toBe('b');
	});

	it('clears the value on a checked click when allowUnchecked is set', () => {
		const model = reactive({choice: 'a'});
		renderWithProvider(<HxRadio $model={model} $field="choice" values={['a', 'b']} allowUnchecked/>);
		fireEvent.click(screen.getByRole('radio'));
		expect(model.choice).toBe('b');
	});

	it('does not toggle when disabled', () => {
		const model = reactive({choice: 'a'});
		renderWithProvider(<HxRadio $model={model} $field="choice" values={['b', 'a']} $disabled/>);
		fireEvent.click(screen.getByRole('radio'));
		expect(model.choice).toBe('a');
	});
});

describe('HxMCheckbox', () => {
	const options = [
		{value: 'a', label: 'Alpha'},
		{value: 'b', label: 'Beta'},
		{value: 'c', label: 'Gamma'}
	];

	it('renders one checkbox per option after options load', async () => {
		const model = reactive({selected: [] as string[]});
		renderWithProvider(<HxMCheckbox $model={model} $field="selected" options={options}/>);
		expect(await screen.findByText('Alpha')).toBeTruthy();
		expect(screen.getAllByRole('checkbox')).toHaveLength(3);
	});

	it('adds and removes values from the model array', async () => {
		const model = reactive({selected: [] as string[]});
		renderWithProvider(<HxMCheckbox $model={model} $field="selected" options={options}/>);
		fireEvent.click(await screen.findByText('Alpha'));
		expect(model.selected).toEqual(['a']);
		fireEvent.click(screen.getByText('Beta'));
		expect(model.selected).toEqual(['a', 'b']);
		fireEvent.click(screen.getByText('Alpha'));
		expect(model.selected).toEqual(['b']);
	});

	it('marks checked options from the model', async () => {
		const model = reactive({selected: ['b']});
		const {container} = renderWithProvider(<HxMCheckbox $model={model} $field="selected" options={options}/>);
		await screen.findByText('Beta');
		const checked = container.querySelectorAll('[data-hx-checkbox-checked]');
		expect(checked).toHaveLength(1);
	});

	it('supports sync function options', async () => {
		const model = reactive({selected: [] as string[]});
		renderWithProvider(
			<HxMCheckbox $model={model} $field="selected"
			             options={() => [{value: 'x', label: 'Dynamic'}]}/>
		);
		expect(await screen.findByText('Dynamic')).toBeTruthy();
	});

	it('disables unchecked options once maxChecked is reached', async () => {
		const model = reactive({selected: [] as string[]});
		renderWithProvider(<HxMCheckbox $model={model} $field="selected" options={options} maxChecked={1}/>);
		fireEvent.click(await screen.findByText('Alpha'));
		expect(model.selected).toEqual(['a']);
		fireEvent.click(screen.getByText('Beta'));
		expect(model.selected).toEqual(['a']);
	});

	it('drops the lanes attribute in vertical direction and keeps it in horizontal', async () => {
		const model = reactive({selected: [] as string[]});
		const vertical = renderWithProvider(
			<HxMCheckbox $model={model} $field="selected" options={options} direction="dir-y" lanes={2}/>
		);
		await screen.findByText('Alpha');
		expect(queryByDataAttr(vertical.container, 'data-hx-m-checkbox')!.hasAttribute('data-hx-m-checkbox-lanes')).toBe(false);

		const horizontal = renderWithProvider(
			<HxMCheckbox $model={model} $field="selected" options={options} direction="dir-x" lanes={2}/>
		);
		await screen.findByText('Alpha');
		const root = queryByDataAttr(horizontal.container, 'data-hx-m-checkbox')!;
		expect(root.getAttribute('data-hx-m-checkbox-direction')).toBe('dir-x');
		expect(root.getAttribute('data-hx-m-checkbox-lanes')).toBe('2');
	});

	it('shows the empty options label when no options are available', async () => {
		const model = reactive({selected: [] as string[]});
		renderWithProvider(<HxMCheckbox $model={model} $field="selected" options={[]}/>);
		expect(await screen.findByText('HxCommon.SelectNoOptions')).toBeTruthy();
	});
});

describe('HxMRadio', () => {
	const options = [
		{value: 'a', label: 'Alpha'},
		{value: 'b', label: 'Beta'}
	];

	it('renders one radio per option and reflects the model value', async () => {
		const model = reactive({choice: 'b'});
		const {container} = renderWithProvider(<HxMRadio $model={model} $field="choice" options={options}/>);
		await screen.findByText('Beta');
		expect(screen.getAllByRole('radio')).toHaveLength(2);
		expect(container.querySelectorAll('[data-hx-radio-checked]')).toHaveLength(1);
	});

	it('changes the model value when another option is clicked', async () => {
		const model = reactive({choice: 'a'});
		renderWithProvider(<HxMRadio $model={model} $field="choice" options={options}/>);
		fireEvent.click(await screen.findByText('Beta'));
		expect(model.choice).toBe('b');
	});

	it('shows the empty options label when no options are available', async () => {
		const model = reactive({choice: undefined as string | undefined});
		renderWithProvider(<HxMRadio $model={model} $field="choice" options={[]}/>);
		expect(await screen.findByText('HxCommon.SelectNoOptions')).toBeTruthy();
	});
});
