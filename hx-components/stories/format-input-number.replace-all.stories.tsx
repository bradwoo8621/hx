import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../src';
import {Fixture} from './format-input-number.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input/Number/Replace All',
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
