import {reactive} from '@hx/data';
import {fireEvent} from '@testing-library/react';
import {createElement, type ComponentType} from 'react';
import {describe, expect, it} from 'vitest';
import {HxFormatInput, type HxFormatInputProps, type HxObject} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

type FormatModel = {value?: unknown};

type FormatExtra = {
	emitChangeDelay?: number;
	options?: {valueFormat?: string};
	$disabled?: boolean;
	$readonly?: boolean;
};

type FormatInputComponent = ComponentType<HxFormatInputProps<FormatModel>>;

const renderFormatInput = (
	model: HxObject<FormatModel>,
	pattern: string,
	extra: FormatExtra = {}
) => {
	const props = {
		$model: model,
		$field: 'value',
		pattern: pattern as HxFormatInputProps<FormatModel>['pattern'],
		...extra
	} as HxFormatInputProps<FormatModel>;
	return renderWithProvider(createElement(HxFormatInput as unknown as FormatInputComponent, props));
};

const inputOf = (container: HTMLElement) => queryByDataAttr(container, 'data-hx-input') as HTMLInputElement;

describe('HxFormatInput', () => {
	it('renders a number input with grouping and fixed fraction', () => {
		const model = reactive({value: 1234.5});
		const {container} = renderFormatInput(model, '@ngf2x');
		const input = inputOf(container);
		expect(input.hasAttribute('data-hx-format-input')).toBe(true);
		expect(input.value).toBe('1,234.50');
	});

	it('writes a parsed number back to the model', () => {
		const model = reactive<{value?: number}>({value: 1});
		const {container} = renderFormatInput(model, '@nf2', {emitChangeDelay: 0});
		fireEvent.change(inputOf(container), {target: {value: '1234.56'}});
		expect(model.value).toBe(1234.56);
	});

	it('keeps the value as a string when it cannot round-trip losslessly', () => {
		const model = reactive<{value?: unknown}>({value: 1});
		const {container} = renderFormatInput(model, '@n', {emitChangeDelay: 0});
		fireEvent.change(inputOf(container), {target: {value: '1.00000000000000000001'}});
		expect(model.value).toBe('1.00000000000000000001');
	});

	it('renders a zero-padded integer', () => {
		const model = reactive({value: 5});
		const {container} = renderFormatInput(model, '@il0u23z');
		expect(inputOf(container).value).toBe('05');
	});

	it('does not pad an integer without the z flag', () => {
		const model = reactive({value: 5});
		const {container} = renderFormatInput(model, '@il0u23');
		expect(inputOf(container).value).toBe('5');
	});

	it('converts an integer display value to a model number', () => {
		const model = reactive<{value?: number}>({value: 1});
		const {container} = renderFormatInput(model, '@il0u23', {emitChangeDelay: 0});
		fireEvent.change(inputOf(container), {target: {value: '23'}});
		expect(model.value).toBe(23);
	});

	it('renders a datetime input using the configured pattern', () => {
		const model = reactive({value: '2024-02-03'});
		const {container} = renderFormatInput(model, '@d/ymd');
		expect(inputOf(container).value).toBe('2024/02/03');
	});

	it('converts a datetime display value back to the configured model value format', () => {
		const model = reactive<{value?: string}>({value: '2024-02-03'});
		const {container} = renderFormatInput(model, '@d/ymd', {emitChangeDelay: 0});
		fireEvent.change(inputOf(container), {target: {value: '2024/02/04'}});
		expect(model.value).toBe('2024/02/04T00:00:00');
	});

	it('honours a custom datetime value format', () => {
		const model = reactive<{value?: string}>({value: '2024-02-03'});
		const {container} = renderFormatInput(model, '@d/ymd', {
			emitChangeDelay: 0,
			options: {valueFormat: 'y/m/d'}
		});
		fireEvent.change(inputOf(container), {target: {value: '2024/02/04'}});
		expect(model.value).toBe('2024/02/04');
	});

	it('downgrades to a plain input when the pattern is not recognized', () => {
		const model = reactive({value: 'x'});
		const {container} = renderFormatInput(model, '@x');
		const input = inputOf(container);
		expect(input.hasAttribute('data-hx-format-input')).toBe(false);
		expect(input.value).toBe('x');
	});

	it('maps disabled and readonly states', () => {
		const model = reactive({value: 1});
		const {container} = renderFormatInput(model, '@n', {$disabled: true, $readonly: true});
		const input = inputOf(container);
		expect(input.disabled).toBe(true);
		expect(input.readOnly).toBe(true);
		expect(input.getAttribute('data-hx-disabled')).toBe('');
		expect(input.getAttribute('data-hx-readonly')).toBe('');
	});

	it('forwards ref to the native input', () => {
		const model = reactive({value: 1});
		const ref = {current: null as HTMLInputElement | null};
		renderWithProvider(<HxFormatInput $model={model} $field="value" pattern="@n" ref={ref}/>);
		expect(ref.current).not.toBeNull();
		expect(ref.current!.tagName.toLowerCase()).toBe('input');
	});
});
