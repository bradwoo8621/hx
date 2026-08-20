import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../../src';
import {Fixture} from './format-input-integer.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Integer/Deletion',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// Deletion is always accepted (removing digits only shrinks the value),
// so Backspace and Delete share identical behavior in this kit.

/** Backspace the last digit → empty */
export const BackspaceLastDigit: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: 7| → backspace → empty"
		initialValue={7}/>
};

/** Delete the first digit */
export const DeleteFirstDigit: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: |23 → delete → 3"
		initialValue={23}/>
};

/** Backspace a middle digit */
export const BackspaceMiddleDigit: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: 1|32 → backspace → 12"
		initialValue={132}/>
};

/** Delete a middle digit */
export const DeleteMiddleDigit: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: 1|32 → delete → 12"
		initialValue={132}/>
};

/** Select a digit and delete it */
export const DeleteSelectedDigit: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: 2[3] → delete → 2"
		initialValue={23}/>
};

/** Select all and delete → empty */
export const DeleteAll: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: [23] → backspace → empty"
		initialValue={23}/>
};

// ── negative values (enabled by min < 0) ────────────────────────────────

/** Delete the minus from a negative value */
export const DeleteMinus: Story = {
	render: () => <Fixture
		pattern="@il-5u59" label="min=-5: |-5 → delete → 5"
		initialValue={-5}/>
};

/** Backspace the digit keeps the lone minus intermediate */
export const BackspaceDigitKeepsMinus: Story = {
	render: () => <Fixture
		pattern="@il-5u59" label="min=-5: -5| → backspace → -"
		initialValue={-5}/>
};
