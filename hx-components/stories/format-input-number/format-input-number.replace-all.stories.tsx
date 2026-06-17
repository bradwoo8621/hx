import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../../src';
import {Fixture} from './format-input-number.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Number/Replace All',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

/** Paste valid number */
export const PasteValidNumber: Story = {
	render: () => <Fixture
		pattern="@nug" label="select all → paste 5678 → 5,678"
		initialValue={1234}/>
};

/** Paste intermediate state (bare minus) */
export const PasteBareMinus: Story = {
	render: () => <Fixture
		pattern="@nd5" label="select all → paste '-' → -"
		initialValue={123}/>
};

/** Paste intermediate state (bare decimal point) */
export const PasteBareDecimal: Story = {
	render: () => <Fixture
		pattern="@nf2" label="select all → paste '.' → ."
		initialValue={123}/>
};

/** Paste minus + decimal (intermediate state) */
export const PasteMinusDecimal: Story = {
	render: () => <Fixture
		pattern="@nf2" label="select all → paste '-.' → -."
		initialValue={123}/>
};

/** Paste empty/whitespace → ignored, old value kept */
export const PasteWhitespace: Story = {
	render: () => <Fixture
		pattern="@nug" label="select all → paste spaces → unchanged"
		initialValue={1234}/>
};

/** Paste value exceeding maxIntegerDigits */
export const PasteExceedMaxInteger: Story = {
	render: () => <Fixture
		pattern="@nd3" label="select all → paste 12345 → 123"
		initialValue={1}/>
};

/** Paste value with leading zeros */
export const PasteLeadingZeros: Story = {
	render: () => <Fixture
		pattern="@nd5" label="select all → paste 00123 → 123"
		initialValue={1}/>
};

/** Paste with decimal point, truncate fraction */
export const PasteTruncateFraction: Story = {
	render: () => <Fixture
		pattern="@nf2" label="select all → paste 1.2345 → 1.23"
		initialValue={(void 0)}/>
};

// ── illegal / invalid paste ───────────────────────────────────────────

/** Paste only illegal chars → ignored, old value kept */
export const PasteIllegalChars: Story = {
	render: () => <Fixture
		pattern="@n" label="select all → paste abc → unchanged"
		initialValue={123}/>
};

/** Paste mixed illegal and valid chars → illegal filtered */
export const PasteMixedIllegalChars: Story = {
	render: () => <Fixture
		pattern="@n" label="select all → paste 1a2b3c → 1"
		initialValue={(void 0)}/>
};

/** Paste leading grouping separator → rejected, old value kept */
export const PasteLeadingGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="select all → paste ,123 → 123"
		initialValue={1234}/>
};

// ── maxIntegerDigits=0 ────────────────────────────────────────────────

/** Paste 0 when maxIntegerDigits=0 */
export const PasteZeroWhenMaxIntegerZero: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: paste 0 → 0"
		initialValue={(void 0)}/>
};

/** Paste non-zero when maxIntegerDigits=0 → rejected */
export const PasteNonZeroWhenMaxIntegerZero: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: paste 5 → unchanged"
		initialValue={(void 0)}/>
};

/** Paste -0 when maxIntegerDigits=0 */
export const PasteMinusZeroWhenMaxIntegerZero: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: paste -0 → -0"
		initialValue={(void 0)}/>
};

/** Paste bare minus when maxIntegerDigits=0 → intermediate state */
export const PasteBareMinusWhenMaxIntegerZero: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: paste - → -"
		initialValue={(void 0)}/>
};

// ── unsigned ──────────────────────────────────────────────────────────

/** Paste minus sign when unsigned → minus rejected */
export const PasteMinusUnsigned: Story = {
	render: () => <Fixture
		pattern="@nu" label="unsigned: paste -5 → unchanged"
		initialValue={(void 0)}/>
};

// ── trailing decimal ──────────────────────────────────────────────────

/** Paste with trailing decimal point → intermediate state */
export const PasteTrailingDecimal: Story = {
	render: () => <Fixture
		pattern="@nf2" label="select all → paste 12. → 12."
		initialValue={(void 0)}/>
};

/** Paste with minus and trailing decimal → intermediate state */
export const PasteMinusTrailingDecimal: Story = {
	render: () => <Fixture
		pattern="@nf2" label="select all → paste -12. → -12."
		initialValue={(void 0)}/>
};

// ── grouping in pasted text ───────────────────────────────────────────

/** Paste text containing grouping separators → stripped and re-formatted */
export const PasteWithGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="select all → paste 1,234 → 1,234"
		initialValue={(void 0)}/>
};

