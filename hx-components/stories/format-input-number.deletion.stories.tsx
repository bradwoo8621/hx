import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../src';
import {fireBackspace, fireDelete, Fixture} from './format-input-number.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input/Number/Deletion',
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
export const DeleteDigitFromGroupedByDelete: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → delete 4 → 123 (caret after 3)"
		initialValue={1234}
		test={input => fireDelete(input, 4)}/>
};

/** Backspace a digit from a grouped integer — value reformats automatically */
export const DeleteDigitFromGroupedByBackspace: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → backspace 4 → 123 (caret after 3)"
		initialValue={1234}
		test={input => fireBackspace(input, 5)}/>
};

/** Delete from unsigned input */
export const DeleteDigitUnsignedByDelete: Story = {
	render: () => <Fixture
		pattern="@nud3" label="123 → delete 3 → 12"
		initialValue={123}
		test={input => fireDelete(input, 2)}/>
};

/** Backspace from unsigned input */
export const DeleteDigitUnsignedByBackspace: Story = {
	render: () => <Fixture
		pattern="@nud3" label="123 → backspace 3 → 12"
		initialValue={123}
		test={input => fireBackspace(input, 3)}/>
};

/** Delete a digit from a multi-grouped number */
export const DeleteDigitFromLargeNumberByDelete: Story = {
	render: () => <Fixture
		pattern="@nug" label="123,456 → delete 3 → 12,456 (caret before comma)"
		initialValue={123456}
		test={input => fireDelete(input, 2)}/>
};

/** Backspace a digit from a multi-grouped number */
export const DeleteDigitFromLargeNumberByBackspace: Story = {
	render: () => <Fixture
		pattern="@nug" label="123,456 → backspace 3 → 12,456 (caret before comma)"
		initialValue={123456}
		test={input => fireBackspace(input, 3)}/>
};

// ── Delete near grouping separator ─────────────────────────────────────

/** Delete the digit before a grouping separator, caret lands before the separator */
export const DeleteBeforeGroupingByDelete: Story = {
	render: () => <Fixture
		pattern="@nug" label="12,345 → delete 2 → 1,345 (caret after 1)"
		initialValue={12345}
		test={input => fireDelete(input, 1)}/>
};

/** Backspace the digit before a grouping separator, caret lands before the separator */
export const DeleteBeforeGroupingByBackspace: Story = {
	render: () => <Fixture
		pattern="@nug" label="12,345 → backspace 2 → 1,345 (caret after 1)"
		initialValue={12345}
		test={input => fireBackspace(input, 2)}/>
};

/** Backspace to delete the digit right after a grouping separator */
export const DeleteDigitAfterGroupingByBackspace: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → backspace 2 → 134 (caret after 1)"
		initialValue={1234}
		test={input => fireBackspace(input, 3)}/>
};

/** Delete the digit right after a grouping separator */
export const DeleteDigitAfterGroupingByDelete: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → delete 2 → 134 (caret after 1)"
		initialValue={1234}
		test={input => fireDelete(input, 2)}/>
};

// ── Delete the grouping separator itself ───────────────────────────────

/** Delete key on grouping separator — value stays, caret after comma */
export const DeleteGroupingByDelete: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → delete comma → 1,234 (caret after comma)"
		initialValue={1234}
		test={input => fireDelete(input, 1)}/>
};

/** Backspace the grouping separator itself — value stays, caret before comma */
export const DeleteGroupingByBackspace: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → backspace comma → 1,234 (caret before comma)"
		initialValue={1234}
		test={input => fireBackspace(input, 2)}/>
};

/** Delete the grouping separator in a multi-grouped number — caret skips past the comma */
export const DeleteGroupingInLargeNumberByDelete: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234,567 → delete 1st comma → 1,234,567 (caret after 1st comma)"
		initialValue={1234567}
		test={input => fireDelete(input, 1)}/>
};

/** Backspace the grouping separator in a multi-grouped number — caret stays before the comma */
export const DeleteGroupingInLargeNumberByBackspace: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234,567 → backspace 1st comma → 1,234,567 (caret before 1st comma)"
		initialValue={1234567}
		test={input => fireBackspace(input, 2)}/>
};
