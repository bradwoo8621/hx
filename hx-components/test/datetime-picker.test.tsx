import {reactive} from '@hx/data';
import {fireEvent, waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HxDateTimePicker, type HxDateTimePickerProps, type HxObject} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

type DtpModel = {value?: string | null};

type DtpProps =
	& Partial<HxDateTimePickerProps<DtpModel>>
	& Pick<HxDateTimePickerProps<DtpModel>, 'displayFormat'>;

const renderPicker = (
	model: HxObject<DtpModel>,
	props: DtpProps
) => {
	return renderWithProvider(<HxDateTimePicker $model={model} $field="value" {...props}/>);
};

const findDay = (day: string): HTMLElement | undefined => {
	return [...document.querySelectorAll<HTMLElement>('[data-hx-dtp-panel-day-gregory][data-hx-dtp-panel-this-month]')]
		.find(el => el.textContent === day);
};

describe('HxDateTimePicker', () => {
	it('renders the formatted model value', () => {
		const model = reactive<DtpModel>({value: '2024-02-03'});
		const {container} = renderPicker(model, {
			displayFormat: '@d/ymd',
			valueFormat: 'y-m-d'
		});
		const picker = queryByDataAttr(container, 'data-hx-dtp')!;
		expect(picker.textContent).toContain('2024/02/03');
		expect(picker.getAttribute('data-hx-model-path')).toBe('value');
		expect(picker.getAttribute('tabindex')).toBe('0');
	});

	it('renders the placeholder when the model is empty', () => {
		const model = reactive<DtpModel>({});
		const {container} = renderPicker(model, {
			displayFormat: '@d/ymd',
			valueFormat: 'y-m-d'
		});
		const picker = queryByDataAttr(container, 'data-hx-dtp')!;
		expect(picker.textContent).toContain('HxCommon.DtpPlaceholder');
		expect(queryByDataAttr(picker, 'data-hx-label-input-placeholder')).not.toBeNull();
	});

	it('opens the calendar popup and applies a date-only selection immediately', async () => {
		const model = reactive<DtpModel>({value: '2024-02-03'});
		const {container} = renderPicker(model, {
			displayFormat: '@d/ymd',
			valueFormat: 'y-m-d'
		});
		const picker = queryByDataAttr(container, 'data-hx-dtp')!;

		fireEvent.click(picker);
		await waitFor(() => expect(document.querySelector('[data-hx-dtp-panel]')).not.toBeNull());
		const day = findDay('15')!;
		expect(day).toBeTruthy();
		fireEvent.click(day);

		expect(model.value).toBe('2024-02-15');
		await waitFor(() => expect(picker.textContent).toContain('2024/02/15'));
	});

	it('only writes the datetime value on confirm by default', async () => {
		const model = reactive<DtpModel>({value: '2024-02-03T10:20:30'});
		const {container} = renderPicker(model, {
			displayFormat: '@d/ymd :hns',
			valueFormat: 'y-m-dTh:n:s'
		});
		fireEvent.click(queryByDataAttr(container, 'data-hx-dtp')!);
		await waitFor(() => expect(document.querySelector('[data-hx-dtp-panel]')).not.toBeNull());

		fireEvent.click(findDay('15')!);
		expect(model.value).toBe('2024-02-03T10:20:30');

		const confirm = document.querySelector<HTMLElement>('[data-hx-dtp-panel-btn="confirm"]')!;
		expect(confirm).not.toBeNull();
		fireEvent.click(confirm);
		expect(model.value).toBe('2024-02-15T10:20:30');
	});

	it('writes immediately and hides the confirm button in immediate sync mode', async () => {
		const model = reactive<DtpModel>({value: '2024-02-03T10:20:30'});
		const {container} = renderPicker(model, {
			displayFormat: '@d/ymd :hns',
			valueFormat: 'y-m-dTh:n:s',
			valueSyncMode: 'immediate'
		});
		fireEvent.click(queryByDataAttr(container, 'data-hx-dtp')!);
		await waitFor(() => expect(document.querySelector('[data-hx-dtp-panel]')).not.toBeNull());
		expect(document.querySelector('[data-hx-dtp-panel-btn="confirm"]')).toBeNull();

		fireEvent.click(findDay('15')!);
		expect(model.value).toBe('2024-02-15T10:20:30');
	});

	it('clears the value through the clear button', () => {
		const model = reactive<DtpModel>({value: '2024-02-03'});
		const {container} = renderPicker(model, {
			displayFormat: '@d/ymd',
			valueFormat: 'y-m-d',
			clearable: true
		});
		const clear = container.querySelector<HTMLElement>('[data-hx-dtp-icon="clear"]')!;
		expect(clear).not.toBeNull();
		fireEvent.click(clear);
		expect(model.value == null).toBe(true);
	});

	it('does not render the clear button when not clearable', () => {
		const model = reactive<DtpModel>({value: '2024-02-03'});
		const {container} = renderPicker(model, {
			displayFormat: '@d/ymd',
			valueFormat: 'y-m-d'
		});
		expect(container.querySelector('[data-hx-dtp-icon="clear"]')).toBeNull();
	});

	it('does not open or take focus when disabled', async () => {
		const model = reactive<DtpModel>({value: '2024-02-03'});
		const {container} = renderPicker(model, {
			displayFormat: '@d/ymd',
			valueFormat: 'y-m-d',
			$disabled: true
		});
		const picker = queryByDataAttr(container, 'data-hx-dtp')!;
		expect(picker.hasAttribute('tabindex')).toBe(false);
		fireEvent.click(picker);
		// give the popup a chance to open if it were going to
		await Promise.resolve();
		expect(document.querySelector('[data-hx-dtp-panel]')).toBeNull();
	});

	it('degrades to a format input when the display format has no full date', () => {
		const model = reactive<DtpModel>({value: '10:20:30'});
		const {container} = renderPicker(model, {
			displayFormat: '@d:hns',
			valueFormat: 'h:n:s'
		});
		expect(container.querySelector('[data-hx-dtp]')).toBeNull();
		expect(container.querySelector('[data-hx-format-input]')).not.toBeNull();
	});

	it('forwards ref to the trigger element', () => {
		const model = reactive<DtpModel>({value: '2024-02-03'});
		const ref = {current: null as HTMLDivElement | null};
		renderWithProvider(
			<HxDateTimePicker $model={model} $field="value" displayFormat="@d/ymd" valueFormat="y-m-d" ref={ref}/>
		);
		expect(ref.current).not.toBeNull();
		expect(ref.current!.hasAttribute('data-hx-dtp')).toBe(true);
	});
});
