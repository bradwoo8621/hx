import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../../src';
import {Fixture} from './format-input-integer.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Integer/Replace Part',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

/** Replace a selected digit within max → accepted */
export const ReplaceWithinMax: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: 2[3] → type 0 → 20"
		initialValue={23}/>
};

/** Replace a selected digit overflowing max → rejected */
export const ReplaceOverflowRejected: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: 2[3] → type 5 → rejected"
		initialValue={23}/>
};

/** Replace a selected digit making the value exceed max → rejected */
export const ReplaceOutOfRangeRejected: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: 0[5] → type 3 → 35 rejected"
		initialValue={5}/>
};

/** Replace a selected digit below min → rejected */
export const ReplaceBelowMinRejected: Story = {
	render: () => <Fixture
		pattern="@il5u59" label="min=5: [5] → type 3 → rejected"
		initialValue={5}/>
};

/** Replace with a non-digit → rejected */
export const ReplaceIllegalCharRejected: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: 2[3] → type a → rejected"
		initialValue={23}/>
};

/** Replace a selection covering multiple digits within max → accepted */
export const ReplaceMultiDigitWithinMax: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: [12] → type 3 → 3"
		initialValue={12}/>
};

/** Replace a multi-digit selection overflowing max → rejected */
export const ReplaceMultiDigitOverflowRejected: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: [23] → type 45 → rejected"
		initialValue={23}/>
};
