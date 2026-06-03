import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../../src';
import {fireBackspace, Fixture} from './format-input-number.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Number/Deletion - By Backspace',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// ── Backspace a digit ─────────────────────────────────────────────────

/** Backspace a digit from a grouped integer — value reformats automatically */
export const BackspaceDigitFromGrouped: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → backspace 4 → 123 (caret after 3)"
		initialValue={1234}
		test={input => fireBackspace(input, 5)}/>
};

/** Backspace from unsigned input */
export const BackspaceDigitUnsigned: Story = {
	render: () => <Fixture
		pattern="@nud3" label="123 → backspace 3 → 12"
		initialValue={123}
		test={input => fireBackspace(input, 3)}/>
};

/** Backspace a digit from a multi-grouped number */
export const BackspaceDigitFromLargeNumber: Story = {
	render: () => <Fixture
		pattern="@nug" label="123,456 → backspace 3 → 12,456 (caret before comma)"
		initialValue={123456}
		test={input => fireBackspace(input, 3)}/>
};

// ── Backspace near grouping separator ──────────────────────────────────

/** Backspace the digit before a grouping separator, caret lands before the separator */
export const BackspaceBeforeGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="12,345 → backspace 2 → 1,345 (caret after 1)"
		initialValue={12345}
		test={input => fireBackspace(input, 2)}/>
};

/** Backspace to delete the digit right after a grouping separator */
export const BackspaceDigitAfterGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → backspace 2 → 134 (caret after 1)"
		initialValue={1234}
		test={input => fireBackspace(input, 3)}/>
};

// ── Backspace the grouping separator itself ────────────────────────────

/** Backspace the grouping separator itself — value stays, caret before comma */
export const BackspaceGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → backspace comma → 1,234 (caret before comma)"
		initialValue={1234}
		test={input => fireBackspace(input, 2)}/>
};

/** Backspace the grouping separator in a multi-grouped number — caret stays before the comma */
export const BackspaceGroupingInLargeNumber: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234,567 → backspace 1st comma → 1,234,567 (caret before 1st comma)"
		initialValue={1234567}
		test={input => fireBackspace(input, 2)}/>
};

// ── Invalid → valid after deletion ────────────────────────────────────

/** Delete illegal char from invalid number — combined becomes valid */
export const BackspaceIllegalCharToValid: Story = {
	render: () => <Fixture
		pattern="@nug" label="1a345 → backspace a → 1,345"
		initialValue={'1a345'}
		test={input => fireBackspace(input, 2)}/>
};

/** Delete digit from invalid number — combined stays invalid */
export const BackspaceFromInvalidStaysInvalid: Story = {
	render: () => <Fixture
		pattern="@nug" label="1a345 → backspace 3 → 1a45"
		initialValue={'1a345'}
		test={input => fireBackspace(input, 3)}/>
};

// ── Deletion from intermediate state — combined stays invalid ──────────

/** Backspace lone minus — combined empty is not a valid number */
export const BackspaceLoneMinusToInvalid: Story = {
	render: () => <Fixture
		pattern="@nd5" label="'-' → backspace → '' (caret at 0)"
		initialValue={'-'}
		test={input => fireBackspace(input, 1)}/>
};

/** Backspace lone decimal — combined empty is not a valid number */
export const BackspaceLoneDecimalToInvalid: Story = {
	render: () => <Fixture
		pattern="@nf2" label="'.' → backspace → '' (caret at 0)"
		initialValue={'.'}
		test={input => fireBackspace(input, 1)}/>
};

// ── Decimal / last digit ──────────────────────────────────────────────

/** Backspace a digit from a decimal number — value reformats */
export const BackspaceDigitFromDecimal: Story = {
	render: () => <Fixture
		pattern="@nf2" label="12.34 → backspace 3 → 12.4 (caret after 2.)"
		initialValue={12.34}
		test={input => fireBackspace(input, 4)}/>
};

/** Backspace the last digit → combined empty → not valid */
export const BackspaceLastDigitToEmpty: Story = {
	render: () => <Fixture
		pattern="@n" label="5 → backspace → '' (caret at 0)"
		initialValue={5}
		test={input => fireBackspace(input, 1)}/>
};
// ── Decimal-point edge cases ──────────────────────────────────────────

/** Backspace a digit from a grouped decimal — value reformats */
export const BackspaceDigitFromGroupedDecimal: Story = {
	render: () => <Fixture
		pattern="@nugf3" label="1,234.56 → backspace 3 → 124.56 (caret after 12)"
		initialValue={1234.56}
		test={input => fireBackspace(input, 4)}/>
};

/** Backspace the decimal point — integer and fraction merge */
export const BackspaceDecimalPoint: Story = {
	render: () => <Fixture
		pattern="@nugf2" label="1,234.56 → backspace . → 123,456 (caret after 4)"
		initialValue={1234.56}
		test={input => fireBackspace(input, 6)}/>
};

/** Backspace the decimal point from a larger number — result re-groups */
export const BackspaceDecimalPointLargeNumber: Story = {
	render: () => <Fixture
		pattern="@nugf3" label="12,345.678 → backspace . → 12,345,678 (caret after 5)"
		initialValue={12345.678}
		test={input => fireBackspace(input, 7)}/>
};

/** Backspace an integer digit from a decimal number */
export const BackspaceIntegerDigitFromDecimal: Story = {
	render: () => <Fixture
		pattern="@nf2" label="12.34 → backspace 2 → 1.34 (caret after 1)"
		initialValue={12.34}
		test={input => fireBackspace(input, 2)}/>
};

/** Backspace the last fraction digit → trailing decimal point remains */
export const BackspaceLastFractionDigit: Story = {
	render: () => <Fixture
		pattern="@nf2" label="12.3 → backspace 3 → 12. (caret after decimal point)"
		initialValue={12.3}
		test={input => fireBackspace(input, 4)}/>
};

/** Backspace leading zero before decimal point */
export const BackspaceLeadingZeroBeforeDecimal: Story = {
	render: () => <Fixture
		pattern="@nf2" label="0.5 → backspace 0 → .5 (caret before .)"
		initialValue={0.5}
		test={input => fireBackspace(input, 1)}/>
};
