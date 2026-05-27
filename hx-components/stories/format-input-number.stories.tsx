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

/**
 * Helper that creates a simple labeled format input for visual testing.
 */
const DeletionFixture = ({pattern, label, initialValue}: {
	pattern: HxFormatInputNumberPattern;
	label: string;
	initialValue: string;
}) => {
	const [model] = useState(() => ERO.reactive({value: initialValue}));
	return <div style={{display: 'flex', flexDirection: 'column', gap: '4px', width: '280px'}}>
		<HxLabel text={`${label}  [${pattern}]`}/>
		<HxFormatInput $model={model} $field="value" pattern={pattern}
		               placeholder="Type and delete to test..."/>
	</div>;
};

// ── Deletion scenarios ──────────────────────────────────────────────

/** Delete a digit from a grouped integer — value reformats automatically */
export const DeleteDigitFromGrouped: Story = {
	render: () => <DeletionFixture
		pattern="@nug" label="Delete a digit: 1,234 → delete 4 → 123"
		initialValue="1234"/>
};

/** Delete a digit with fraction — integer and fraction parts update */
export const DeleteDigitWithFraction: Story = {
	render: () => <DeletionFixture
		pattern="@nugf2" label="Delete a fraction digit: 12.34 → delete 3 → 12.4"
		initialValue="12.34"/>
};

/** Delete digits until only the minus sign remains */
export const DeleteToMinusOnly: Story = {
	render: () => <DeletionFixture
		pattern="@ng" label="Delete digits: -123 → delete all → stays at -"
		initialValue="-123"/>
};

/** Delete digits until only the decimal point remains */
export const DeleteToDecimalOnly: Story = {
	render: () => <DeletionFixture
		pattern="@nf2" label="Delete around decimal: 1.5 → leave only ."
		initialValue="1.5"/>
};

/** Delete digits leaving minus + decimal */
export const DeleteToMinusAndDecimal: Story = {
	render: () => <DeletionFixture
		pattern="@ngf2" label="Delete around: -1.5 → leave only -."
		initialValue="-1.5"/>
};

/** Fixed fraction: delete a fraction digit, it re-pads with zero */
export const FixedFractionDelete: Story = {
	render: () => <DeletionFixture
		pattern="@nugf2x" label="Fixed fraction: 12.34 → delete 3 → 12.40"
		initialValue="12.34"/>
};

/** Force EN locale — decimal is always "." regardless of browser locale */
export const ForceEnFormatDelete: Story = {
	render: () => <DeletionFixture
		pattern="@nge" label="Force EN: 1,234.56 in any locale"
		initialValue="1234.56"/>
};

/** Delete all digits — empty combined invalid, returns raw prefix+suffix */
export const DeleteAllDigits: Story = {
	render: () => <DeletionFixture
		pattern="@nug" label="Delete all: 123 → delete 3,2,1 → empty stays"
		initialValue="123"/>
};
