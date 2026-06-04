import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {useRef, useState} from 'react';
import {HxButton, HxFormatInput, type HxFormatInputNumberPattern, HxLabel} from '../../src';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asDisplayValue = (value: any) => {
	if (value === (void 0)) {
		return '[undefined]';
	} else if (value == null) {
		return '[null]';
	} else if (value === '') {
		return '[empty string]';
	} else {
		return (typeof value) + ' [' + value + ']';
	}
};

export type TestFn = (input: HTMLInputElement) => void;

export const Fixture = ({pattern, label, initialValue, test}: {
	pattern: HxFormatInputNumberPattern;
	label: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	initialValue: any;
	test?: TestFn;
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [model] = useState(() => ERO.reactive(new Proxy({
		value: initialValue,
		displayValue: asDisplayValue(initialValue)
	}, {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		set(target: any, p: string | symbol, newValue: any, receiver: any): boolean {
			if (p === 'value') {
				target.displayValue = asDisplayValue(newValue);
			}
			return Reflect.set(target, p, newValue, receiver);
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		deleteProperty(target: any, p: string | symbol): boolean {
			if (p === 'value') {
				target.displayValue = asDisplayValue(void 0);
			}
			return Reflect.deleteProperty(target, p);
		}
	})));

	const onTestClick = () => {
		if (inputRef.current == null) {
			return;
		}

		test?.(inputRef.current);
	};

	return <div style={{display: 'flex', flexDirection: 'column', gap: '4px', width: '600px'}}>
		<HxLabel text="Pattern:" style={{marginBottom: '-12px'}}/>
		<HxLabel text={`[${pattern}]`} color="primary"/>
		<HxLabel text="Behaviour:" style={{marginBottom: '-12px'}}/>
		<HxLabel text={`[${label}]`} color="primary"/>
		<HxLabel text="Test Input:" style={{marginBottom: '-8px'}}/>
		<HxFormatInput $model={model} $field="value" pattern={pattern}
		               autoComplete="off"
		               ref={inputRef}/>
		<HxLabel text="Model Value:" style={{marginBottom: '-12px'}}/>
		<HxLabel $model={model} $field="displayValue" color="primary" $change={{
			on: 'value',
			handle: () => 'repaint'
		}}/>
		{test != null
			? <HxButton text="Start Test, Watch input value, caret, and model value."
			            uppercase={false} color="info" onClick={onTestClick}/>
			: (void 0)
		}
	</div>;
};

const caretAt = (input: HTMLInputElement, caret: number | [number, number]) => {
	input.focus();
	input.selectionStart = typeof caret === 'number' ? caret : caret[0];
	input.selectionEnd = typeof caret === 'number' ? caret : caret[1];
	return typeof caret === 'number' ? caret : caret[0];
};

// eslint-disable-next-line react-refresh/only-export-components
export const fireDelete = (input: HTMLInputElement, caret: number | [number, number]) => {
	const caretStart = caretAt(input, caret);
	input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Delete', bubbles: true}));
	// noinspection JSDeprecatedSymbols
	console.log(`Command[forwardDelete at ${caretStart}] executed, return ${document.execCommand('forwardDelete')}.`);
};

// eslint-disable-next-line react-refresh/only-export-components
export const fireBackspace = (input: HTMLInputElement, caret: number | [number, number]) => {
	const caretStart = caretAt(input, caret);
	input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Backspace', bubbles: true}));
	// noinspection JSDeprecatedSymbols
	console.log(`Command[delete at ${caretStart}] executed, return ${document.execCommand('delete')}.`);
};

/**
 * Simulate a paste operation by replacing the current selection with `text`.
 * When `selectRange` is omitted the entire input content is selected
 * (simulating Ctrl+A → Ctrl+V).
 */
// eslint-disable-next-line react-refresh/only-export-components
export const firePaste = (input: HTMLInputElement, text: string, caret: 'all' | number | [number, number]) => {
	input.focus();
	let caretStart;
	if (caret === 'all') {
		caretStart = caretAt(input, [0, input.value.length]);
	} else {
		caretStart = caretAt(input, caret);
	}
	input.dispatchEvent(new InputEvent('beforeinput', {bubbles: true}));
	const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
	const newValue = input.value.substring(0, input.selectionStart!) + text + input.value.substring(input.selectionEnd!);
	nativeSetter.call(input, newValue);
	input.dispatchEvent(new Event('input', {bubbles: true}));
	console.log(`Command[paste[${text}] at ${caretStart}] executed.`);
};
