import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput, HxModelDateFormat, HxModelTimeFormat, HxModelDateTimeFormat} from '../../src';
import {Fixture} from './format-input-datetime.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - DateTime/Deletion - By Backspace',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// ── Backspace a digit ───────────────────────────────────────────────────

/** Backspace a digit from a date — value reformats automatically */
export const BackspaceDigitFromDate: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/06/10 → backspace 0 → 2024/06/1 (caret after 1)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Backspace a digit from a time */
export const BackspaceDigitFromTime: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:30:00 → backspace 0 → 14:30:0 (caret after 2nd 0)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

/** Backspace a digit from a date with dash separators */
export const BackspaceDigitFromDashDate: Story = {
	render: () => <Fixture
		pattern="@d-ymd" label="2024-06-10 → backspace 0 → 2024-06-1"
		valueFormat="y-m-d"
		initialValue="2024-06-10"/>
};

// ── Backspace near separator ────────────────────────────────────────────

/** Backspace the digit before a separator, caret lands before the separator */
export const BackspaceBeforeSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/06/10 → backspace 6 → 2024/0/10 (caret after /)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Backspace the digit right after a separator */
export const BackspaceAfterSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/06/10 → backspace 0 (after /) → 2024/6/10"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Backspace digit before separator in time */
export const BackspaceBeforeTimeSeparator: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:30:00 → backspace 3 → 14:0/00 (caret after :)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

/** Backspace digit after separator in time */
export const BackspaceAfterTimeSeparator: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:30:00 → backspace 3 (after :) → 14:0:00"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

// ── Backspace the separator itself ──────────────────────────────────────

/** Backspace the separator itself — value stays, caret before separator */
export const BackspaceDateSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/06/10 → backspace / → 2024/06/10 (caret before /)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Backspace the separator in time — value stays */
export const BackspaceTimeSeparator: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:30:00 → backspace : → 14:30:00 (caret before :)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

/** Backspace the separator in datetime — value stays */
export const BackspaceDateTimeSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="2024/06/10 14:30:00 → backspace space → 2024/06/10 14:30:00 (caret before space)"
		valueFormat="y/m/d h:n:s"
		initialValue="2024/06/10 14:30:00"/>
};

// ── Invalid → valid after deletion ──────────────────────────────────────

/** Backspace illegal char from invalid date — combined becomes valid */
export const BackspaceIllegalCharToValid: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/0x/10 → backspace x → 2024/0_/10"
		valueFormat={HxModelDateFormat}
		initialValue="2024/0x/10"/>
};

/** Backspace digit from invalid date — combined stays invalid */
export const BackspaceFromInvalidStaysInvalid: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="202x/06/10 → backspace 0 → 202x/06/1"
		valueFormat={HxModelDateFormat}
		initialValue="202x/06/10"/>
};

// ── Deletion from intermediate state ────────────────────────────────────

/** Backspace lone separator — combined empty is not a valid date */
export const BackspaceLoneSlashToInvalid: Story = {
	render: () => <Fixture
		pattern="@dymd" label="'/' → backspace → '' (caret at 0)"
		valueFormat="ymd"
		initialValue={'/'}/>
};

/** Backspace lone letter to empty */
export const BackspaceLoneLetterToInvalid: Story = {
	render: () => <Fixture
		pattern="@dymd" label="'x' → backspace → '' (caret at 0)"
		valueFormat="ymd"
		initialValue={'x'}/>
};

// ── Last digit / edge cases ─────────────────────────────────────────────

/** Backspace the last digit → combined empty → not valid */
export const BackspaceLastDigitToEmpty: Story = {
	render: () => <Fixture
		pattern="@dh" label="5 → backspace → '' (caret at 0)"
		valueFormat="h"
		initialValue={'5'}/>
};

/** Backspace from compact date (no separators) */
export const BackspaceFromCompactDate: Story = {
	render: () => <Fixture
		pattern="@dymd" label="20240610 → backspace 0 → 2024061"
		valueFormat="ymd"
		initialValue="20240610"/>
};

/** Backspace from compact time (no separators) */
export const BackspaceFromCompactTime: Story = {
	render: () => <Fixture
		pattern="@dhns" label="143000 → backspace 0 → 14300"
		valueFormat="hns"
		initialValue="143000"/>
};

// ── DateTime mixed ──────────────────────────────────────────────────────

/** Backspace a digit from datetime — value reformats */
export const BackspaceDigitFromDateTime: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="2024/06/10 14:30:00 → backspace 0 → 2024/06/10 14:30:0"
		valueFormat="y/m/d h:n:s"
		initialValue="2024/06/10 14:30:00"/>
};

/** Backspace a digit before T separator in datetime model */
export const BackspaceBeforeDateTimeTSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="2024/06/10 14:30:00 → backspace 1 → 2024/06/0 14:30:00"
		valueFormat={HxModelDateTimeFormat}
		initialValue="2024/06/10T14:30:00"/>
};
