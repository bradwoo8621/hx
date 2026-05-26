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
		pattern="@nugf2x" label="Fixed fraction: 12.34 → delete 3 → 12.04"
		initialValue="12.34"/>
};

/** Force EN locale — decimal is always "." regardless of browser locale */
export const ForceEnFormatDelete: Story = {
	render: () => <DeletionFixture
		pattern="@ne" label="Force EN: 1,234.56 in any locale"
		initialValue="1234.56"/>
};

/** Delete all digits — empty combined invalid, returns raw prefix+suffix */
export const DeleteAllDigits: Story = {
	render: () => <DeletionFixture
		pattern="@nug" label="Delete all: 123 → delete 3,2,1 → empty stays"
		initialValue="123"/>
};

/** Delete whitespace-containing input (e.g. pasted with spaces) */
export const DeleteWithWhitespace: Story = {
	render: () => {
		const [model] = useState(() => ERO.reactive({value: '12 34'}));
		return <div style={{display: 'flex', flexDirection: 'column', gap: '4px', width: '280px'}}>
			<HxLabel text="Whitespace stripped: '12 34' on init"/>
			<HxFormatInput $model={model} $field="value" pattern="@nug"
			               placeholder="Delete spaces..."/>
		</div>;
	}
};

/** Delete in unsigned mode — minus sign is rejected */
export const UnsignedDeleteMinus: Story = {
	render: () => <DeletionFixture
		pattern="@nug" label="Unsigned: minus not allowed"
		initialValue="1234"/>
};

// ── Multi-input playground ──────────────────────────────────────────

/** Side-by-side comparison of different patterns under deletion */
export const DeletionPlayground: Story = {
	render: () => {
		const [m0] = useState(() => ERO.reactive({value: '1234'}));
		const [m1] = useState(() => ERO.reactive({value: '-1234'}));
		const [m2] = useState(() => ERO.reactive({value: '12.34'}));
		const [m3] = useState(() => ERO.reactive({value: '12.34'}));
		const [m4] = useState(() => ERO.reactive({value: '1234.56'}));
		const [m5] = useState(() => ERO.reactive({value: '1234'}));

		const rows: Array<{
			pattern: HxFormatInputNumberPattern;
			label: string;
			model: ReturnType<typeof ERO.reactive>
		}> = [
			{pattern: '@nug', label: 'Grouped int', model: m0},
			{pattern: '@ng', label: 'Signed + grouped', model: m1},
			{pattern: '@nugf2', label: 'Grouped + frac', model: m2},
			{pattern: '@nugf2x', label: 'Fixed frac', model: m3},
			{pattern: '@ne', label: 'Force EN', model: m4},
			{pattern: '@n', label: 'Bare number', model: m5}
		];

		return <div style={{display: 'flex', flexDirection: 'column', gap: '12px', width: '320px'}}>
			{rows.map((r, i) => <div key={i} style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
				<HxLabel text={`${r.label} [${r.pattern}]`}/>
				<HxFormatInput $model={r.model} $field="value" pattern={r.pattern}/>
			</div>)}
		</div>;
	}
};
