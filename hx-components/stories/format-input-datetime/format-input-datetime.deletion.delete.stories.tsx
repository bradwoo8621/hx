import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput, HxModelDateFormat, HxModelDateTimeFormat, HxModelTimeFormat} from '../../src';
import {Fixture} from './format-input-datetime.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - DateTime/Deletion - By Delete',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// ── Delete a digit ─────────────────────────────────────────────────────

/** Delete a digit from a date — value reformats automatically */
export const DeleteDigitFromDate: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/06/10 → delete 2 → 024/06/10 (caret after 0)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Delete a digit from a time */
export const DeleteDigitFromTime: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:30:00 → delete 1 → 4:30:00 (caret after 4)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

/** Delete a digit from a date with dash separators */
export const DeleteDigitFromDashDate: Story = {
	render: () => <Fixture
		pattern="@d-ymd" label="2024-06-10 → delete 2 → 024-06-10"
		valueFormat="y-m-d"
		initialValue="2024-06-10"/>
};

// ── Delete near separator ───────────────────────────────────────────────

/** Delete the digit before a separator, caret lands before the separator */
export const DeleteBeforeSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/06/10 → delete 4 → 202/06/10 (caret before /)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Delete the digit right after a separator */
export const DeleteAfterSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/06/10 → delete 0 (after /) → 2024/6/10 (caret after /)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Delete digit before separator in time */
export const DeleteBeforeTimeSeparator: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:30:00 → delete 4 → 1:30:00 (caret after :)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

/** Delete digit after separator in time */
export const DeleteAfterTimeSeparator: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:30:00 → delete 3 (after :) → 14:0:00 (caret after :)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

// ── Delete the separator itself ─────────────────────────────────────────

/** Delete key on separator — value stays, caret after separator */
export const DeleteDateSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/06/10 → delete / → 2024/06/10 (caret after /)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Delete key on separator in time — value stays */
export const DeleteTimeSeparator: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:30:00 → delete : → 14:30:00 (caret after :)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

/** Delete key on space separator in datetime — value stays */
export const DeleteDateTimeSpaceSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="2024/06/10 14:30:00 → delete space → 2024/06/10 14:30:00 (caret after space)"
		valueFormat="y/m/d h:n:s"
		initialValue="2024/06/10 14:30:00"/>
};

// ── Invalid → valid after deletion ──────────────────────────────────────

/** Delete illegal char from invalid date — combined becomes valid */
export const DeleteIllegalCharToValid: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/x6/10 → delete x → 2024/6_/10"
		valueFormat={HxModelDateFormat}
		initialValue="2024/x6/10"/>
};

/** Delete digit from invalid date — combined stays invalid */
export const DeleteFromInvalidStaysInvalid: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="x024/06/10 → delete 0 → x024/06/1"
		valueFormat={HxModelDateFormat}
		initialValue="x024/06/10"/>
};

// ── Deletion from intermediate state ────────────────────────────────────

/** Delete lone separator — combined empty is not a valid date */
export const DeleteLoneSlashToInvalid: Story = {
	render: () => <Fixture
		pattern="@dymd" label="|/ → delete → '' (caret at 0)"
		valueFormat="ymd"
		initialValue={'/'}/>
};

/** Delete lone letter to empty */
export const DeleteLoneLetterToInvalid: Story = {
	render: () => <Fixture
		pattern="@dymd" label="|x → delete → '' (caret at 0)"
		valueFormat="ymd"
		initialValue={'x'}/>
};

// ── Last digit / edge cases ─────────────────────────────────────────────

/** Delete the last digit → combined empty → not valid */
export const DeleteLastDigitToEmpty: Story = {
	render: () => <Fixture
		pattern="@dh" label="5| → delete → '' (caret at 0)"
		valueFormat="h"
		initialValue={'5'}/>
};

/** Delete from compact date (no separators) */
export const DeleteFromCompactDate: Story = {
	render: () => <Fixture
		pattern="@dymd" label="20240610 → delete 2 → 0240610"
		valueFormat="ymd"
		initialValue="20240610"/>
};

/** Delete from compact time (no separators) */
export const DeleteFromCompactTime: Story = {
	render: () => <Fixture
		pattern="@dhns" label="143000 → delete 1 → 43000"
		valueFormat="hns"
		initialValue="143000"/>
};

// ── DateTime mixed ──────────────────────────────────────────────────────

/** Delete a digit from datetime — value reformats */
export const DeleteDigitFromDateTime: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="2024/06/10 14:30:00 → delete 2 → 024/06/10 14:30:00"
		valueFormat="y/m/d h:n:s"
		initialValue="2024/06/10 14:30:00"/>
};

/** Delete a digit after T separator in datetime model */
export const DeleteAfterDateTimeTSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="2024/06/10 14:30:00 → delete 1 (after 0) → 2024/06/10 4:30:00"
		valueFormat={HxModelDateTimeFormat}
		initialValue="2024/06/10T14:30:00"/>
};
