import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../../src';
import {Fixture} from './format-input-integer.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Integer/Insert',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// ── append ──────────────────────────────────────────────────────────────

/** Append a digit within max → accepted */
export const AppendWithinMax: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: type 7 → 7"
		initialValue={(void 0)}/>
};

/** Append up to the max boundary → accepted */
export const AppendAtMaxBoundary: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: type 2 → 2, type 3 → 23"
		initialValue={(void 0)}/>
};

/** Append a digit overflowing max → rejected */
export const AppendOverflowRejected: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: 2| → type 5 → rejected"
		initialValue={2}/>
};

/** Append to a value already at max → rejected */
export const AppendAtMaxRejected: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: 23| → type 5 → rejected"
		initialValue={23}/>
};

// ── middle insert ───────────────────────────────────────────────────────

/** Insert in the middle within max → accepted */
export const InsertInMiddle: Story = {
	render: () => <Fixture
		pattern="@iu999" label="max=999: 1|2 → type 3 → 132"
		initialValue={12}/>
};

/** Insert in the middle overflowing max → rejected */
export const InsertInMiddleOverflowRejected: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: |5 → type 2 → rejected"
		initialValue={5}/>
};

/** Insert a digit at the start that stays within max → accepted */
export const InsertAtStartWithinMax: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: |2 → type 1 → 12"
		initialValue={2}/>
};

// ── leading zeros ───────────────────────────────────────────────────────

/** Leading zeros typed by the user are kept as-is */
export const LeadingZeroKept: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: type 0 → 0, type 7 → 07"
		initialValue={(void 0)}/>
};

/** All-zero strings are valid (value 0 within bounds) */
export const AllZerosValid: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: type 000 → 000"
		initialValue={(void 0)}/>
};

// ── max = 0 ─────────────────────────────────────────────────────────────

/** max=0: only 0 is allowed */
export const MaxZeroAcceptsZero: Story = {
	render: () => <Fixture
		pattern="@iu0" label="max=0: type 0 → 0"
		initialValue={(void 0)}/>
};

/** max=0: non-zero rejected */
export const MaxZeroRejectsNonZero: Story = {
	render: () => <Fixture
		pattern="@iu0" label="max=0: type 5 → rejected"
		initialValue={(void 0)}/>
};

/** max=0: 0 followed by a digit → rejected */
export const MaxZeroRejectsZeroThenDigit: Story = {
	render: () => <Fixture
		pattern="@iu0" label="max=0: 0| → type 1 → rejected"
		initialValue={0}/>
};

// ── illegal chars ───────────────────────────────────────────────────────

/** Non-digit characters → rejected */
export const IllegalCharRejected: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: 2| → type a → rejected"
		initialValue={2}/>
};

/** Non-digit characters from empty → rejected */
export const IllegalCharFromEmptyRejected: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: type a → rejected"
		initialValue={(void 0)}/>
};

// ── min ─────────────────────────────────────────────────────────────────

/** Value below min → rejected */
export const MinEnforced: Story = {
	render: () => <Fixture
		pattern="@il5u59" label="min=5: type 3 → rejected"
		initialValue={(void 0)}/>
};

/** Value reaching min → accepted */
export const MinReachedAccepted: Story = {
	render: () => <Fixture
		pattern="@il5u59" label="min=5: type 5 → 5"
		initialValue={(void 0)}/>
};

/** Leading zeros still counted by the final value against min */
export const MinWithLeadingZeros: Story = {
	render: () => <Fixture
		pattern="@il5u59" label="min=5: 0| → type 5 → 05 accepted"
		initialValue={0}/>
};

// ── negative values (enabled by min < 0) ────────────────────────────────

/** min < 0 enables minus typing; lone "-" is an intermediate state */
export const NegativeTypingFlow: Story = {
	render: () => <Fixture
		pattern="@il-5u59" label="min=-5: type - → -, type 5 → -5"
		initialValue={(void 0)}/>
};

/** Negative overflow → the digit is rejected, lone minus kept */
export const NegativeOverflowRejected: Story = {
	render: () => <Fixture
		pattern="@il-5u59" label="min=-5: -| → type 6 → rejected"
		initialValue={(void 0)}/>
};

/** min >= 0 → minus rejected like any illegal char */
export const NonNegativeRejectsMinus: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: type - → rejected"
		initialValue={(void 0)}/>
};

/** Minus inserted in the middle → rejected */
export const MinusInMiddleRejected: Story = {
	render: () => <Fixture
		pattern="@il-5u59" label="min=-5: -|5 → insert 3 → -35 rejected"
		initialValue={-5}/>
};

/** Negative value within min → accepted */
export const NegativeWithinMin: Story = {
	render: () => <Fixture
		pattern="@il-5u59" label="min=-5: |- → insert 1 → -1"
		initialValue={(void 0)}/>
};
