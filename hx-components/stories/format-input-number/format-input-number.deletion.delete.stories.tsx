import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../../src';
import {fireDelete, Fixture} from './format-input-number.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Number/Deletion - By Delete',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// ── Delete a digit ────────────────────────────────────────────────────

/** Delete a digit from a grouped integer — value reformats automatically */
export const DeleteDigitFromGrouped: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → delete 4 → 123 (caret after 3)"
		initialValue={1234}
		test={input => fireDelete(input, 4)}/>
};

/** Delete from unsigned input */
export const DeleteDigitUnsigned: Story = {
	render: () => <Fixture
		pattern="@nud3" label="123 → delete 3 → 12"
		initialValue={123}
		test={input => fireDelete(input, 2)}/>
};

/** Delete a digit from a multi-grouped number */
export const DeleteDigitFromLargeNumber: Story = {
	render: () => <Fixture
		pattern="@nug" label="123,456 → delete 3 → 12,456 (caret before comma)"
		initialValue={123456}
		test={input => fireDelete(input, 2)}/>
};

// ── Delete near grouping separator ─────────────────────────────────────

/** Delete the digit before a grouping separator, caret lands before the separator */
export const DeleteBeforeGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="12,345 → delete 2 → 1,345 (caret after 1)"
		initialValue={12345}
		test={input => fireDelete(input, 1)}/>
};

/** Delete the digit right after a grouping separator */
export const DeleteDigitAfterGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → delete 2 → 134 (caret after 1)"
		initialValue={1234}
		test={input => fireDelete(input, 2)}/>
};

// ── Delete the grouping separator itself ───────────────────────────────

/** Delete key on grouping separator — value stays, caret after comma */
export const DeleteGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → delete comma → 1,234 (caret after comma)"
		initialValue={1234}
		test={input => fireDelete(input, 1)}/>
};

/** Delete the grouping separator in a multi-grouped number — caret skips past the comma */
export const DeleteGroupingInLargeNumber: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234,567 → delete 1st comma → 1,234,567 (caret after 1st comma)"
		initialValue={1234567}
		test={input => fireDelete(input, 1)}/>
};

// ── Invalid → valid after deletion ────────────────────────────────────

/** Delete illegal char from invalid number — combined becomes valid */
export const DeleteIllegalCharToValid: Story = {
	render: () => <Fixture
		pattern="@nug" label="1a345 → delete a → 1,345"
		initialValue={'1a345'}
		test={input => fireDelete(input, 1)}/>
};

/** Delete digit from invalid number — combined stays invalid */
export const DeleteFromInvalidStaysInvalid: Story = {
	render: () => <Fixture
		pattern="@nug" label="1a345 → delete 3 → 1a45"
		initialValue={'1a345'}
		test={input => fireDelete(input, 2)}/>
};

// ── Deletion from intermediate state — combined stays invalid ──────────

/** Delete lone minus — combined empty is not a valid number */
export const DeleteLoneMinusToInvalid: Story = {
	render: () => <Fixture
		pattern="@nd5" label="|- → delete → '' (caret at 0)"
		initialValue={'-'}
		test={input => fireDelete(input, 0)}/>
};

/** Delete lone decimal — combined empty is not a valid number */
export const DeleteLoneDecimalToInvalid: Story = {
	render: () => <Fixture
		pattern="@nf2" label="|. → delete → '' (caret at 0)"
		initialValue={'.'}
		test={input => fireDelete(input, 0)}/>
};
