import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../../src';
import {Fixture} from './format-input-number.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Number/Replace Part',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// ── basic replace within integer ────────────────────────────────────────

/** Replace selected digits with shorter input */
export const ReplaceShorterWithinLimit: Story = {
	render: () => <Fixture
		pattern="@nd5" label="1[23]45 → replace with 9 → 1945"
		initialValue={12345}/>
};

/** Replace with longer digits within limit → truncated */
export const ReplaceLongerWithinLimit: Story = {
	render: () => <Fixture
		pattern="@nd5" label="1[23]45 → replace with 678 → 16745"
		initialValue={12345}/>
};

/** Replace selected digits exceeding maxIntegerDigits */
export const ReplaceExceedMaxInteger: Story = {
	render: () => <Fixture
		pattern="@nd3" label="[12]3 → replace with 45678 → 453"
		initialValue={123}/>
};

/** Replace with longer digits exceeding maxIntegerDigits → truncated */
export const ReplaceExceedMaxIntegerTruncated: Story = {
	render: () => <Fixture
		pattern="@nd3" label="1[23] → replace with 4567 → 145"
		initialValue={123}/>
};

// ── replace to insert decimal point ─────────────────────────────────────

/** Replace digits with decimal point, suffix becomes fraction */
export const ReplaceWithDecimalPoint: Story = {
	render: () => <Fixture
		pattern="@ngf2" label="1[2,3]45 → replace with '.' → 1.45"
		initialValue={12345}/>
};

/** Replace to insert decimal point with digit, suffix becomes fraction */
export const ReplaceWithDigitAndDecimal: Story = {
	render: () => <Fixture
		pattern="@ngf3" label="1[2,3]45 → replace with '.6' → 1.645"
		initialValue={12345}/>
};

/** Replace to insert decimal + fraction exceeding maxFractionDigits */
export const ReplaceWithDecimalExceedFraction: Story = {
	render: () => <Fixture
		pattern="@nf2" label="1[23]4 → replace with '.567' → 1.54"
		initialValue={1234}/>
};

// ── replace with minus ──────────────────────────────────────────────────

/** Replace at start with minus → allowed */
export const ReplaceStartWithMinus: Story = {
	render: () => <Fixture
		pattern="@nd5" label="[12]3 → replace with '-' → -3"
		initialValue={123}/>
};

/** Replace in middle with minus → rejected */
export const ReplaceMiddleWithMinus: Story = {
	render: () => <Fixture
		pattern="@nd5" label="1[23]45 → replace with '-' → rejected"
		initialValue={12345}/>
};

/** Replace at start (next to existing minus) with minus → filtered, digits deleted */
export const ReplaceStartWithMinusWhenHasMinus: Story = {
	render: () => <Fixture
		pattern="@nd5" label="-[12]3 → replace with '-' → rejected"
		initialValue={-123}/>
};

// ── replace with illegal / invalid chars ────────────────────────────────

/** Replace with illegal chars → deleted text lost, only prefix+suffix kept */
export const ReplaceWithIllegalChars: Story = {
	render: () => <Fixture
		pattern="@n" label="12[34] → replace with 'abc' → rejected"
		initialValue={1234}/>
};

/** Replace with mixed illegal and valid chars → filtered */
export const ReplaceWithMixedIllegalChars: Story = {
	render: () => <Fixture
		pattern="@n" label="12[34] → replace with '5a6b' → 125"
		initialValue={1234}/>
};

// ── decimal point in prefix (Branch B) ──────────────────────────────────

/** Replace fraction digits within limit */
export const ReplaceFractionWithinLimit: Story = {
	render: () => <Fixture
		pattern="@nf3" label="1.2[3]4 → replace with '89' → 1.284"
		initialValue={1.234}/>
};

/** Replace fraction digits exceeding maxFractionDigits */
export const ReplaceFractionExceedLimit: Story = {
	render: () => <Fixture
		pattern="@nf2" label="1.[23] → replace with '456' → 1.45"
		initialValue={1.23}/>
};

/** Replace fraction digit when maxFractionDigits reached → truncated */
export const ReplaceFractionAtMax: Story = {
	render: () => <Fixture
		pattern="@nf2" label="1.2[3] → replace with '45' → 1.24"
		initialValue={1.23}/>
};

// ── decimal point in suffix (Branch A) ──────────────────────────────────

/** Replace integer digits before decimal in suffix */
export const ReplaceBeforeDecimalInSuffix: Story = {
	render: () => <Fixture
		pattern="@nd5" label="[12].34 → replace with '89' → 89.34"
		initialValue={12.34}/>
};

/** Replace before decimal exceeding maxIntegerDigits → truncated */
export const ReplaceBeforeDecimalExceedMaxInteger: Story = {
	render: () => <Fixture
		pattern="@nd2f2" label="[12].34 → replace with '345' → 34.34"
		initialValue={12.34}/>
};

// ── maxIntegerDigits=0 ──────────────────────────────────────────────────

/** Replace with 0 when maxIntegerDigits=0 */
export const ReplaceWithZeroWhenMaxIntegerZero: Story = {
	render: () => <Fixture
		pattern="@nd0" label="[12] → replace with '0' → 0"
		initialValue={12}/>
};

/** Replace with non-zero when maxIntegerDigits=0 → rejected */
export const ReplaceWithNonZeroWhenMaxIntegerZero: Story = {
	render: () => <Fixture
		pattern="@nd0" label="[0] → replace with '5' → rejected"
		initialValue={0}/>
};

// ── unsigned ────────────────────────────────────────────────────────────

/** Replace with minus when unsigned → minus filtered, digits kept */
export const ReplaceWithMinusUnsigned: Story = {
	render: () => <Fixture
		pattern="@nu" label="[12]3 → replace with '-5' → rejected"
		initialValue={123}/>
};

// ── grouping ────────────────────────────────────────────────────────────

/** Replace across grouping boundary */
export const ReplaceAcrossGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,2[34],567 → replace with '89' → 1,289,567"
		initialValue={1234567}/>
};

/** Replace with text containing grouping separators → stripped */
export const ReplaceWithGroupingInText: Story = {
	render: () => <Fixture
		pattern="@nug" label="1[2,3]45 → replace with '6,78' → 167,845"
		initialValue={12345}/>
};

/** Replace with leading grouping → grouping skipped, digits kept */
export const ReplaceWithLeadingGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,2[34] → replace with ',56' → 1,256"
		initialValue={1234}/>
};

// ── negative + decimal ──────────────────────────────────────────────────

/** Replace integer part of negative decimal */
export const ReplaceIntegerInNegativeDecimal: Story = {
	render: () => <Fixture
		pattern="@nd5f2" label="-[12].34 → replace with '89' → -89.34"
		initialValue={-12.34}/>
};

/** Replace fraction part of negative decimal */
export const ReplaceFractionInNegativeDecimal: Story = {
	render: () => <Fixture
		pattern="@nd5f2" label="-12.[34] → replace with '5' → -12.5"
		initialValue={-12.34}/>
};

// ── replace-part in suffix with decimal ─────────────────────────────────

/** Replace before decimal, suffix has decimal and fraction */
export const ReplaceBeforeDecimalSuffixHasDecimal: Story = {
	render: () => <Fixture
		pattern="@nd5f2" label="12[3].45 → replace with '67' → 1267.45"
		initialValue={123.45}/>
};

// ── replace with intermediate state ─────────────────────────────────────

/** Replace selection with bare minus → intermediate state */
export const ReplaceWithBareMinus: Story = {
	render: () => <Fixture
		pattern="@nd5" label="[12]3 → replace with '-' → -3"
		initialValue={123}/>
};

/** Replace selection with bare decimal → intermediate state */
export const ReplaceWithBareDecimal: Story = {
	render: () => <Fixture
		pattern="@nf2" label="1[23]4 → replace with '.' → 1.4"
		initialValue={1234}/>
};
