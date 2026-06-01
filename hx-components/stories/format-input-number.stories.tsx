import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {useState} from 'react';
import {HxFormatInput, type HxFormatInputNumberPattern, HxLabel} from '../src';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Number/Deletion',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

export default meta;

type Story = StoryObj<typeof HxFormatInput>;

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
/**
 * Helper that creates a simple labeled format input for visual testing.
 */
const Fixture = ({pattern, label, initialValue}: {
	pattern: HxFormatInputNumberPattern;
	label: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	initialValue: any;
}) => {
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

	return <div style={{display: 'flex', flexDirection: 'column', gap: '4px', width: '280px'}}>
		<HxLabel text={`${label}  [${pattern}]`}/>
		<HxFormatInput $model={model} $field="value" pattern={pattern}
		               placeholder="Type and delete to test..."/>
		<HxLabel $model={model} $field="displayValue" $change={{
			on: 'value',
			handle: () => 'repaint'
		}}/>
	</div>;
};

// ── Deletion scenarios ──────────────────────────────────────────────

/** Delete a digit from a grouped integer — value reformats automatically */
export const DeleteDigitFromGrouped: Story = {
	render: () => <Fixture
		pattern="@nug" label="Delete a digit: 1,234 → delete 4 → 123"
		initialValue={1234}/>
};
