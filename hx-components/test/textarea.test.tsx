import {ERO, reactive} from '@hx/data';
import {fireEvent} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {HxTextarea, HxWithCheckTextarea} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

describe('HxTextarea', () => {
	it('renders a textarea bound to the model', () => {
		const model = reactive({note: 'hello'});
		const {container} = renderWithProvider(<HxTextarea $model={model} $field="note"/>);
		const box = queryByDataAttr(container, 'data-hx-textarea-box')!;
		const textarea = queryByDataAttr(container, 'data-hx-textarea') as HTMLTextAreaElement;
		expect(box).not.toBeNull();
		expect(textarea.tagName.toLowerCase()).toBe('textarea');
		expect(textarea.value).toBe('hello');
		expect(textarea.name).toBe('note');
		expect(textarea.getAttribute('data-hx-model-path')).toBe('note');
		expect(textarea.hasAttribute('data-hx-textarea-rows')).toBe(true);
	});

	it('writes typed text to the model immediately when the delay is zero', () => {
		const model = reactive({note: ''});
		const {container} = renderWithProvider(<HxTextarea $model={model} $field="note" emitChangeDelay={0}/>);
		const textarea = queryByDataAttr(container, 'data-hx-textarea') as HTMLTextAreaElement;
		fireEvent.change(textarea, {target: {value: 'written'}});
		expect(model.note).toBe('written');
	});

	it('defers the change event until blur in blur mode', () => {
		const model = reactive({note: 'a'});
		const onChange = vi.fn();
		ERO.on(model, 'note', onChange);
		const {container} = renderWithProvider(<HxTextarea $model={model} $field="note" emitChangeOnBlur/>);
		const textarea = queryByDataAttr(container, 'data-hx-textarea') as HTMLTextAreaElement;
		fireEvent.change(textarea, {target: {value: 'b'}});
		expect(onChange).not.toHaveBeenCalled();
		expect(model.note).toBe('b');
		fireEvent.blur(textarea);
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it('applies rows and resize configuration', () => {
		const {container} = renderWithProvider(<HxTextarea $model={reactive({v: ''})} $field="v" rows={3} resize="dir-y"/>);
		const textarea = queryByDataAttr(container, 'data-hx-textarea') as HTMLTextAreaElement;
		expect(textarea.style.getPropertyValue('--hx-textarea-rows-this')).toBe('3');
		expect(textarea.getAttribute('data-hx-textarea-resize')).toBe('dir-y');
	});

	it('marks auto rows and its max rows cap', () => {
		const {container} = renderWithProvider(<HxTextarea $model={reactive({v: ''})} $field="v" rows={2} autoRows={5}/>);
		const textarea = queryByDataAttr(container, 'data-hx-textarea') as HTMLTextAreaElement;
		expect(textarea.getAttribute('data-hx-textarea-max-rows')).toBe('');
		expect(textarea.style.getPropertyValue('--hx-textarea-max-rows-this')).toBe('5');
	});

	it('renders the placeholder label', () => {
		const {container} = renderWithProvider(<HxTextarea $model={reactive({v: ''})} $field="v" placeholder="Write here"/>);
		expect(queryByDataAttr(container, 'data-hx-textarea-placeholder')!.textContent).toBe('Write here');
	});

	it('shows the char count when a limit is configured', () => {
		const model = reactive({note: 'abc'});
		const {container} = renderWithProvider(<HxTextarea $model={model} $field="note" charLimit={10}/>);
		expect(queryByDataAttr(container, 'data-hx-label-textarea-char-limit')!.textContent).toBe('3 / 10');
	});

	it('hides the char count when disabled or readonly', () => {
		const {container: c1} = renderWithProvider(<HxTextarea $model={reactive({v: ''})} $field="v" charLimit={10} $disabled/>);
		expect(queryByDataAttr(c1, 'data-hx-label-textarea-char-limit')).toBeNull();

		const {container: c2} = renderWithProvider(<HxTextarea $model={reactive({v: ''})} $field="v" charLimit={10} $readonly/>);
		expect(queryByDataAttr(c2, 'data-hx-label-textarea-char-limit')).toBeNull();
	});

	it('marks disabled and readonly states', () => {
		const {container} = renderWithProvider(<HxTextarea $model={reactive({v: ''})} $field="v" $disabled $readonly/>);
		const textarea = queryByDataAttr(container, 'data-hx-textarea') as HTMLTextAreaElement;
		expect(textarea.disabled).toBe(true);
		expect(textarea.readOnly).toBe(true);
		expect(textarea.getAttribute('data-hx-disabled')).toBe('');
		expect(textarea.getAttribute('data-hx-readonly')).toBe('');
	});

	it('forwards ref to the native textarea', () => {
		const ref = {current: null as HTMLTextAreaElement | null};
		renderWithProvider(<HxTextarea $model={reactive({v: ''})} $field="v" ref={ref}/>);
		expect(ref.current).not.toBeNull();
		expect(ref.current!.tagName.toLowerCase()).toBe('textarea');
	});
});

describe('HxWithCheckTextarea', () => {
	it('renders the validation wrapper and shows the error message after a change', () => {
		const model = reactive({note: ''});
		const {container} = renderWithProvider(
			<HxWithCheckTextarea $model={model} $field="note" $withCheck={false} emitChangeDelay={0}
			                     $check={{
				                     handle: () => 'Required field'
			                     }}/>
		);
		expect(queryByDataAttr(container, 'data-hx-with-check')).not.toBeNull();
		fireEvent.change(queryByDataAttr(container, 'data-hx-textarea')!, {target: {value: 'x'}});
		const message = queryByDataAttr(container, 'data-hx-label-check-msg');
		expect(message).not.toBeNull();
		expect(message!.textContent).toBe('Required field');
	});

	it('keeps the message DOM when alwaysKeepMessageDOM is set', () => {
		const model = reactive({note: 'x'});
		const {container} = renderWithProvider(
			<HxWithCheckTextarea $model={model} $field="note" $withCheck={false} alwaysKeepMessageDOM/>
		);
		expect(queryByDataAttr(container, 'data-hx-label-check-msg')).not.toBeNull();
	});
});
