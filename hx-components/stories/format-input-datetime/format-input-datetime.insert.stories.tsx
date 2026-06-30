import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput, HxModelDateFormat, HxModelDateTimeFormat, HxModelTimeFormat} from '../../src';
import {Fixture} from './format-input-datetime.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - DateTime/Insert',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// ── Insert digit on placeholder ──────────────────────────────────────────

/** Type a digit on a placeholder — replaces it, caret after the digit */
export const InsertDigitOnPlaceholderDate: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|__/__ type 6 → 2024/6_/__ (caret after 6)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/__/__"/>
};

/** Type a digit on a time placeholder */
export const InsertDigitOnPlaceholderTime: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:|__:__ type 3 → 14:3_:__ (caret after 3)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:__:__"/>
};

/** Type a digit on a datetime placeholder */
export const InsertDigitOnPlaceholderDateTime: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="2024/06/10 |__:__:__ type 1 → 2024/06/10 1_:__:__ (caret after 1)"
		valueFormat="y/m/d h:n:s"
		initialValue="2024/06/10 __:__:__"/>
};

// ── Insert multiple digits ───────────────────────────────────────────────

/** Type multiple digits — fills successive placeholders in the same field */
export const InsertMultipleDigitsDate: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="|____/__/__ type 2024 → 2024/__/__ (caret after 4)"
		valueFormat={HxModelDateFormat}
		initialValue="____/__/__"/>
};

/** Type multiple digits in time — fills the field */
export const InsertMultipleDigitsTime: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="|__:__:__ type 14 → 14:__:__ (caret after 4)"
		valueFormat={HxModelTimeFormat}
		initialValue="__:__:__"/>
};

/** Type digits that cross a separator into the next field */
export const InsertCrossSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|__/__ type 0610 → 2024/06/10 (caret after 0)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/__/__"/>
};

/** Type digits crossing both date and time separators */
export const InsertCrossDateTimeSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="2024/|__/__ __:__:__ type 06101430 → 2024/06/10 14:30:__ (caret after 0)"
		valueFormat="y/m/d h:n:s"
		initialValue="2024/__/__ __:__:__"/>
};

// ── Insert at position 0 ─────────────────────────────────────────────────

/** Type a digit when caret is at position 0 (start of input) */
export const InsertAtPositionZero: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="|1999/06/10 type 2 → 2999/06/10 (caret after 2)"
		valueFormat={HxModelDateFormat}
		initialValue="1999/06/10"/>
};

// ── Insert in the middle of a populated field ─────────────────────────────

/** Type a digit in the middle of a populated field — replaces the existing digit */
export const InsertMiddleOfField: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2|024/06/10 type 5 → 2524/06/10 (caret after 5)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Type a digit between two populated fields — cursor after separator */
export const InsertAfterSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/10 type 1 → 2024/16/10 (caret after 1)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

// ── Insert placeholder char ──────────────────────────────────────────────

/** Type underscore — same behaviour as typing a digit */
export const InsertUnderscoreChar: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|__/__ type _ → 2024/__/__ (caret 6)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/__/__"/>
};

// ── Space key ────────────────────────────────────────────────────────────

/** Type space on a separator — keeps the separator, caret moves past it */
export const InsertSpaceOnSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/10 type space → 2024/_6/10 (caret 6)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Type space on a placeholder — replaces placeholder with underscore */
export const InsertSpaceOnPlaceholder: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|__/__ type space → 2024/__/__ (rejected)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/__/__"/>
};

/** Type space on a digit — replaces with placeholder (soft clear) */
export const InsertSpaceOnDigit: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/0|6/10 type space → 2024/0_/10 (caret 8)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

// ── Type through separator (interchangeable separator chars) ─────────────

/** Type slash on a slash separator — keeps the separator, caret advances */
export const InsertSlashOnSlash: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/10 type / → 2024/06/10 (rejected)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Type dash on a slash separator — interchangeable, keeps slash */
export const InsertDashOnSlash: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/10 type - → 2024/06/10 (rejected)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Type dot on a slash separator — interchangeable, keeps slash */
export const InsertDotOnSlash: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/10 type . → 2024/06/10 (rejected)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Type colon on a time separator — keeps the separator, caret advances */
export const InsertColonOnColon: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:|30:00 type : → 14:30:00 (rejected)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

/** Type dot on a time separator — interchangeable, keeps colon */
export const InsertDotOnColon: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:|30:00 type . → 14:30:00 (rejected)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

/** Type T on a space datetime separator — interchangeable, keeps space */
export const InsertTOnSpace: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="2024/06/10 |14:30:00 type T → 2024/06/10 14:30:00 (rejected)"
		valueFormat={HxModelDateTimeFormat}
		initialValue="2024/06/10T14:30:00"/>
};

// ── Rejection cases ──────────────────────────────────────────────────────

/** Type a digit at the end of a fully populated value — rejected */
export const InsertAtEndRejected: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/06/10| type 5 → 2024/06/10 (unchanged)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Type a digit when cursor is on a separator — rejected */
export const InsertOnSeparatorRejected: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024|/06/10 type 5 → 2024/06/10 (unchanged)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Type a non-matching separator char — insertion stops */
export const InsertNonMatchingSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/10 type x → 2024/06/10 (rejected)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Type digit when all time fields are full — rejected */
export const InsertAtEndTimeRejected: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:30:00| type 5 → 14:30:00 (unchanged)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

// ── Compact format ───────────────────────────────────────────────────────

/** Type digits on compact date (no separators) */
export const InsertCompactDate: Story = {
	render: () => <Fixture
		pattern="@dymd" label="|________ type 2024 → 2024____ (caret after 4)"
		valueFormat="ymd"
		initialValue="________"/>
};

/** Type digits across field boundaries on compact format */
export const InsertCompactCrossField: Story = {
	render: () => <Fixture
		pattern="@dymd" label="|________ type 20240610 → 20240610 (caret after 0)"
		valueFormat="ymd"
		initialValue="________"/>
};

/** Type digits on compact time (no separators) */
export const InsertCompactTime: Story = {
	render: () => <Fixture
		pattern="@dhns" label="|______ type 1430 → 1430__ (caret after 0)"
		valueFormat="hns"
		initialValue="______"/>
};

// ── Different separator between pattern and valueFormat ──────────────────

/** Insert with model dash separator, pattern slash */
export const InsertModelDashDisplaySlash: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|__/__ type 06 → 2024/06/__ (caret after 6)"
		valueFormat="y-m-d"
		initialValue="2024/__/__"/>
};

// ── valueFormat with extra fields + defaults ─────────────────────────────

/** Insert when valueFormat has fields beyond the pattern */
export const InsertWithExtraFieldsDefault: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label='model: 2024/|__/__ + defaults "h12n0s0" type 06 → 2024/06/__ (caret after 6)'
		valueFormat="y/m/d h:n:s"
		defaultValues="h12n0s0"
		initialValue="2024/__/__"/>
};

// ── Invalid old value recovery ───────────────────────────────────────────

/** Insert into invalid old value — combined text fully parsable, no suffix → reformat */
export const InsertRecoverInvalidNoSuffix: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024x/1x/9| type 0 → 2024x/1x/90 (caret at last)"
		valueFormat={HxModelDateFormat}
		initialValue="2024x/1x/9"/>
};

/** Insert into invalid old value — combined text fully parsable, with suffix → reformat */
export const InsertRecoverInvalidWithSuffix: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024x/1x|/9 type 2 → 2024x/1x2/9 (caret after 2 in month)"
		valueFormat={HxModelDateFormat}
		initialValue="2024x/1x/9"/>
};

/** Insert into invalid old value — combined not parsable → pass through */
export const InsertInvalidPassThrough: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="hello| type 5 → hello5 (passed through)"
		valueFormat={HxModelDateFormat}
		initialValue="hello"/>
};

// ── Insert with partial input (half-filled field) ────────────────────────

/** Complete a partially filled month field */
export const InsertCompletePartialMonth: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|_6/__ type 0 → 2024/06/__ (caret before 6)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/_6/__"/>
};

/** Complete a partially filled hour field */
export const InsertCompletePartialHour: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="|_4:__:__ type 1 → 14:__:__ (caret before 4)"
		valueFormat={HxModelTimeFormat}
		initialValue="_4:__:__"/>
};

// ── Other patterns ───────────────────────────────────────────────────────

/** Insert digit on year-only pattern */
export const InsertYearOnlyPattern: Story = {
	render: () => <Fixture
		pattern="@dy" label="|____ type 2025 → 2025 (caret after 5)"
		valueFormat="y"
		initialValue="____"/>
};

/** Insert digit on minute-second pattern */
export const InsertMinuteSecond: Story = {
	render: () => <Fixture
		pattern="@d:ns" label="|__:__ type 30 → 30:__ (caret after 0)"
		valueFormat="n:s"
		initialValue="__:__"/>
};

/** Insert digit on day-month pattern */
export const InsertDayMonthPattern: Story = {
	render: () => <Fixture
		pattern="@d/dm" label="|__/__ type 25 → 25/__ (caret after 5)"
		valueFormat="d/m"
		initialValue="__/__"/>
};

/** Insert digit on month-day pattern */
export const InsertMonthDayPattern: Story = {
	render: () => <Fixture
		pattern="@d/md" label="|__/__ type 12 → 12/__ (caret after 2)"
		valueFormat="m/d"
		initialValue="__/__"/>
};

/** Insert digit with dot-separated valueFormat into colon pattern */
export const InsertDotValueFormatTime: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="|__:__:__ type 14 → 14:__:__ (caret after 4)"
		valueFormat="h.n.s"
		initialValue="__:__:__"/>
};

/** Insert digit on Chinese date valueFormat */
export const InsertChineseValueFormat: Story = {
	render: () => <Fixture
		pattern="@dymd" label="|________ type 2024 → 2024____ (caret after 4)"
		valueFormat="y年m月d日"
		initialValue="________"/>
};
