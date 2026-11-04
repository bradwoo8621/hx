import {ERO, reactive} from '@hx/data';
import {act, fireEvent, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {HxInput, HxLabel} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

describe('HxInput', () => {
	it('renders a text input bound to the model', () => {
		const model = reactive({name: 'Ada'});
		const {container} = renderWithProvider(<HxInput $model={model} $field="name"/>);
		const box = queryByDataAttr(container, 'data-hx-input-box')!;
		const input = queryByDataAttr(container, 'data-hx-input') as HTMLInputElement;
		expect(box).not.toBeNull();
		expect(input.tagName.toLowerCase()).toBe('input');
		expect(input.type).toBe('text');
		expect(input.value).toBe('Ada');
		expect(input.name).toBe('name');
		expect(input.getAttribute('data-hx-model-path')).toBe('name');
		expect(input.hasAttribute('data-hx-input-inbox')).toBe(true);
	});

	it('writes typed text to the model immediately when the delay is zero', () => {
		const model = reactive({name: ''});
		const {container} = renderWithProvider(<HxInput $model={model} $field="name" emitChangeDelay={0}/>);
		const input = queryByDataAttr(container, 'data-hx-input') as HTMLInputElement;
		fireEvent.change(input, {target: {value: 'Grace'}});
		expect(model.name).toBe('Grace');
	});

	it('emits a change event immediately in zero-delay mode', () => {
		const model = reactive({name: 'a'});
		const onChange = vi.fn();
		ERO.on(model, 'name', onChange);
		const {container} = renderWithProvider(<HxInput $model={model} $field="name" emitChangeDelay={0}/>);
		const input = queryByDataAttr(container, 'data-hx-input') as HTMLInputElement;
		fireEvent.change(input, {target: {value: 'b'}});
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0].newValue).toBe('b');
	});

	it('defers the change event until blur in blur mode', () => {
		const model = reactive({name: 'a'});
		const onChange = vi.fn();
		ERO.on(model, 'name', onChange);
		const {container} = renderWithProvider(<HxInput $model={model} $field="name" emitChangeOnBlur/>);
		const input = queryByDataAttr(container, 'data-hx-input') as HTMLInputElement;
		fireEvent.change(input, {target: {value: 'b'}});
		expect(onChange).not.toHaveBeenCalled();
		// the model is updated silently while typing
		expect(model.name).toBe('b');
		fireEvent.blur(input);
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it('commits the value on Enter in blur mode', () => {
		const model = reactive({name: 'a'});
		const onChange = vi.fn();
		ERO.on(model, 'name', onChange);
		const {container} = renderWithProvider(<HxInput $model={model} $field="name" emitChangeOnBlur/>);
		const input = queryByDataAttr(container, 'data-hx-input') as HTMLInputElement;
		fireEvent.change(input, {target: {value: 'c'}});
		fireEvent.keyDown(input, {key: 'Enter'});
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it('marks disabled and readonly states', () => {
		const {container} = renderWithProvider(<HxInput $model={reactive({v: ''})} $field="v" $disabled $readonly/>);
		const input = queryByDataAttr(container, 'data-hx-input') as HTMLInputElement;
		expect(input.disabled).toBe(true);
		expect(input.readOnly).toBe(true);
		expect(input.getAttribute('data-hx-disabled')).toBe('');
		expect(input.getAttribute('data-hx-readonly')).toBe('');
	});

	it('renders the placeholder label and hides it when disabled or readonly', () => {
		const {container: c1} = renderWithProvider(<HxInput $model={reactive({v: ''})} $field="v" placeholder="Type here"/>);
		expect(queryByDataAttr(c1, 'data-hx-label-input-placeholder')!.textContent).toBe('Type here');

		const {container: c2} = renderWithProvider(<HxInput $model={reactive({v: ''})} $field="v" placeholder="Type here" $disabled/>);
		expect(queryByDataAttr(c2, 'data-hx-label-input-placeholder')).toBeNull();

		const {container: c3} = renderWithProvider(<HxInput $model={reactive({v: ''})} $field="v" placeholder="Type here" $readonly/>);
		expect(queryByDataAttr(c3, 'data-hx-label-input-placeholder')).toBeNull();
	});

	it('supports password inputs and regular attributes', () => {
		const {container} = renderWithProvider(
			<HxInput $model={reactive({v: ''})} $field="v" type="password" autoComplete="off" className="host-class"/>
		);
		const input = queryByDataAttr(container, 'data-hx-input') as HTMLInputElement;
		expect(input.type).toBe('password');
		expect(input.classList.contains('host-class')).toBe(true);
	});

	it('selects all text on focus by default', () => {
		const select = vi.spyOn(HTMLInputElement.prototype, 'select');
		const model = reactive({name: 'Ada'});
		const {container} = renderWithProvider(<HxInput $model={model} $field="name"/>);
		fireEvent.focus(queryByDataAttr(container, 'data-hx-input')!);
		expect(select).toHaveBeenCalled();
		select.mockRestore();
	});

	it('does not select all text when selectAll is false', () => {
		const select = vi.spyOn(HTMLInputElement.prototype, 'select');
		const {container} = renderWithProvider(<HxInput $model={reactive({v: ''})} $field="v" selectAll={false}/>);
		fireEvent.focus(queryByDataAttr(container, 'data-hx-input')!);
		expect(select).not.toHaveBeenCalled();
		select.mockRestore();
	});

	it('interposes the model into prefix and suffix components', () => {
		const model = reactive({name: 'Ada'});
		const {container} = renderWithProvider(
			<HxInput $model={model} $field="name"
			         prefix={[<HxLabel key="p" $field="name"/>]}
			         suffix={[<HxLabel key="s" $field="name"/>]}/>
		);
		const labels = container.querySelectorAll('[data-hx-label]');
		expect(labels).toHaveLength(2);
		labels.forEach(label => {
			expect(label.getAttribute('data-hx-model-path')).toBe('name');
			expect(label.textContent).toBe('Ada');
		});
	});

	it('forwards ref to the native input', () => {
		const ref = {current: null as HTMLInputElement | null};
		renderWithProvider(<HxInput $model={reactive({v: ''})} $field="v" ref={ref}/>);
		expect(ref.current).not.toBeNull();
		expect(ref.current!.tagName.toLowerCase()).toBe('input');
	});

	it('re-reads the model value on each render', async () => {
		const model = reactive({name: 'Ada'});
		const {container, rerender} = renderWithProvider(<HxInput $model={model} $field="name"/>);
		const input = queryByDataAttr(container, 'data-hx-input') as HTMLInputElement;
		await act(async () => {
			model.name = 'Grace';
		});
		rerender(<HxInput $model={model} $field="name"/>);
		expect(input.value).toBe('Grace');
	});

	it('supports i18n-aware labels through the placeholder', () => {
		renderWithProvider(<HxInput $model={reactive({v: ''})} $field="v" placeholder="~unknown.placeholder"/>);
		expect(screen.getByText('unknown.placeholder')).toBeTruthy();
	});
});
