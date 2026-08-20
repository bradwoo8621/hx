import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../../src';
import {Fixture} from './format-input-integer.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Integer/Replace All',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// Replace-all truncates the pasted text to its longest valid prefix
// (empty, or digits with value within [min, max]).

/** Paste a valid value */
export const PasteValid: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: paste 7 → 7"
		initialValue={(void 0)}/>
};

/** Paste overflowing max → truncated to the longest valid prefix */
export const PasteOverflowTruncated: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: paste 999 → 9"
		initialValue={(void 0)}/>
};

/** Paste overflowing max over an existing value → truncated */
export const PasteOverflowOverValue: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: [5] paste 999 → 9"
		initialValue={5}/>
};

/** Paste with leading zeros → kept as-is */
export const PasteLeadingZeros: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: paste 007 → 007"
		initialValue={(void 0)}/>
};

/** Paste mixed garbage → truncated at the first invalid char */
export const PasteMixedGarbageTruncated: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: paste 1a2 → 1"
		initialValue={(void 0)}/>
};

/** Paste fully illegal → rejected, old value kept */
export const PasteIllegalRejected: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: [5] paste abc → rejected"
		initialValue={5}/>
};

/** Paste a value below min → rejected, old value kept */
export const PasteBelowMinRejected: Story = {
	render: () => <Fixture
		pattern="@il5u59" label="min=5: [5] paste 3 → rejected"
		initialValue={5}/>
};

/** Paste a two-digit value where only the first digit fits → truncated */
export const PastePartialPrefix: Story = {
	render: () => <Fixture
		pattern="@iu9" label="max=9: paste 23 → 2"
		initialValue={(void 0)}/>
};

/** Select all and type → treated as replace-all */
export const SelectAllType: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: [23] type 45 → 4"
		initialValue={23}/>
};

// ── negative values (enabled by min < 0) ────────────────────────────────

/** Paste a valid negative value */
export const PasteNegativeValid: Story = {
	render: () => <Fixture
		pattern="@il-5u59" label="min=-5: paste -5 → -5"
		initialValue={(void 0)}/>
};

/** Paste a negative overflow → truncated to the lone minus intermediate */
export const PasteNegativeOverflowTruncated: Story = {
	render: () => <Fixture
		pattern="@il-5u59" label="min=-5: paste -6 → -"
		initialValue={(void 0)}/>
};

/** Paste minus in the middle → truncated before it */
export const PasteMinusInMiddleTruncated: Story = {
	render: () => <Fixture
		pattern="@il-5u59" label="min=-5: paste 6- → 6"
		initialValue={(void 0)}/>
};

/** Paste a lone minus → kept as intermediate state */
export const PasteLoneMinus: Story = {
	render: () => <Fixture
		pattern="@il-5u59" label="min=-5: paste - → -"
		initialValue={(void 0)}/>
};
