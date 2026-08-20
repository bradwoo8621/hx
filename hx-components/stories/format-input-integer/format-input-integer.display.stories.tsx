import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../../src';
import {Fixture} from './format-input-integer.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Integer/Display',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

/** padZero pads the initial display (model 7 → 07, width derived from max) */
export const PadZeroPadding: Story = {
	render: () => <Fixture
		pattern="@iu23z" label="max=23 padZero: initial 7 → 07"
		initialValue={7}/>
};

/** padZero pads the display on blur (type 7 → blur → 07) */
export const PadZeroPaddingOnBlur: Story = {
	render: () => <Fixture
		pattern="@iu23z" label="max=23 padZero: type 7 → blur → 07"
		initialValue={(void 0)}/>
};

/** no padZero → natural display */
export const NoPadZeroNatural: Story = {
	render: () => <Fixture
		pattern="@iu59" label="max=59: initial 7 → 7"
		initialValue={7}/>
};

/** undefined initial value → empty field */
export const UndefinedInitial: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: initial undefined → empty"
		initialValue={(void 0)}/>
};

/** model value outside [min, max] is displayed as-is (garbage in, garbage out) */
export const OutOfRangeModel: Story = {
	render: () => <Fixture
		pattern="@iu23" label="max=23: initial 99 → 99 displayed as-is"
		initialValue={99}/>
};

/** padZero is ignored for negative domains (min < 0) */
export const NegativePadZeroIgnored: Story = {
	render: () => <Fixture
		pattern="@il-5u59z" label="min=-5 padZero: initial -5 → -5 (flag ignored)"
		initialValue={-5}/>
};

/** Lone minus intermediate → model stays undefined */
export const LoneMinusModelUndefined: Story = {
	render: () => <Fixture
		pattern="@il-5u59" label="min=-5: type - → model [undefined]"
		initialValue={(void 0)}/>
};

/** The intended datetime-picker use case: hour / minute / second fields */
export const TimeFields: Story = {
	render: () => <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
		<Fixture
			pattern="@iu23z" label="Hour (max=23)"
			initialValue={9} testManually={false}/>
		<Fixture
			pattern="@iu59z" label="Minute (max=59)"
			initialValue={5} testManually={false}/>
		<Fixture
			pattern="@iu59z" label="Second (max=59)"
			initialValue={0} testManually={false}/>
	</div>
};
