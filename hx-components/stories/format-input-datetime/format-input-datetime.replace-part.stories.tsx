import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput, HxModelDateFormat, HxModelDateTimeFormat, HxModelTimeFormat} from '../../src';
import {Fixture} from './format-input-datetime.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - DateTime/Replace Part',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// ── Basic digit replacement ─────────────────────────────────────────────

/** Select month and replace with new digits */
export const ReplaceMonthDigits: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06|/10 type 12 → 2024/12/|10 (caret after second /)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Select hour and replace with new digits */
export const ReplaceHourDigits: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="|14|:30:00 type 09 → 09:|30:00 (caret after first :)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

/** Select a single digit and replace it */
export const ReplaceSingleDigit: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/0|6|/10 type 8 → 2024/08/|10 (caret after second /)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Select day and replace */
export const ReplaceDayDigits: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/06/|10| type 25 → 2024/06/25| (caret after 5)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

// ── Replacement crossing separator ───────────────────────────────────────

/** Select month + separator + day, replace with digits crossing the separator */
export const ReplaceCrossSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/10| type 1225 → 2024/12/25| (caret after 5)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Select date + time separator + hour, replace with digits */
export const ReplaceCrossDateTimeSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="2024/06/|10 14|:30:00 type 2517 → 2024/06/25 17:|30:00 (caret after first :)"
		valueFormat="y/m/d h:n:s"
		initialValue="2024/06/10 14:30:00"/>
};

// ── Separator in selected range ──────────────────────────────────────────

/** Selection includes separator, typed matching separator → preserved, caret past it */
export const ReplaceWithSeparatorInSelection: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/|10 type / → 2024/|__/|10 (caret after first /)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Selection includes separator, typed digit → separator preserved, digit on next data pos */
export const ReplaceDigitOverSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/|10 type 1 → 2024/1|_/10 (caret after first 1)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Selection includes time separator, typed matching colon → preserved */
export const ReplaceWithTimeSeparatorInSelection: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="14:|30:|00 type : → 14:|__:00 (caret after first :)"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

/** Selection includes space separator, typed T → preserved */
export const ReplaceTOnSpaceInSelection: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="2024/06/10| 14|:30:00 type T → 2024/06/10 |__:30:00 (caret after space)"
		valueFormat={HxModelDateTimeFormat}
		initialValue="2024/06/10T14:30:00"/>
};

// ── Typed separator on data position ─────────────────────────────────────

/** Select a digit, type separator char → digit survives, separator ignored */
export const ReplaceDigitWithSeparator: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/0|6|/10 type / → 2024/0|_/10 (caret after 0)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Select a digit, type dash → digit survives */
export const ReplaceDigitWithDash: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/0|6|/10 type - → 2024/0|_/10 (caret after 0)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Select digit, type space → digit survives */
export const ReplaceDigitWithSpace: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/0|6|/10 type space → 2024/0|_/10 (caret after 0)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

// ── Underscore replacement ───────────────────────────────────────────────

/** Select digit, type underscore → replaces with placeholder */
export const ReplaceDigitWithUnderscore: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/0|6|/10 type _ → 2024/0_/10 (caret after _)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

// ── Inserted overflow ────────────────────────────────────────────────────

/** Inserted shorter than deleted — remaining deleted chars appended */
export const ReplaceInsertedShorter: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/10| type 1 → 2024/1/10 (caret after 1)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Inserted longer than deleted — excess chars dropped */
export const ReplaceInsertedLonger: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/0|6|/10 type 123 → 2024/01/10 (caret after 2)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

// ── Non-matching insertion ───────────────────────────────────────────────

/** Typed non-matching char → break, remaining deleted preserved */
export const ReplaceNonMatchingChar: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/10| type x → 2024/06/10 (unchanged)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

// ── Position 0 replacement ───────────────────────────────────────────────

/** Replace from the beginning of the value */
export const ReplaceAtPositionZero: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="|2024|/06/10 type 2025 → 2025/06/10 (caret after 5)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Replace all the way to the end */
export const ReplaceToEnd: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024/|06/10| type 12 → 2024/12 (caret after 2)"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

// ── Compact format replacement ───────────────────────────────────────────

/** Replace in compact date (no separators) */
export const ReplaceCompactDate: Story = {
	render: () => <Fixture
		pattern="@dymd" label="2024|0610| type 1225 → 20241225 (caret after 5)"
		valueFormat="ymd"
		initialValue="20240610"/>
};

/** Replace in compact time (no separators) */
export const ReplaceCompactTime: Story = {
	render: () => <Fixture
		pattern="@dhns" label="|1430|00 type 0915 → 091500 (caret after 5)"
		valueFormat="hns"
		initialValue="143000"/>
};

// ── Other patterns ───────────────────────────────────────────────────────

/** Replace in day-month pattern */
export const ReplaceDayMonthPattern: Story = {
	render: () => <Fixture
		pattern="@d/dm" label="|10|/06 type 25 → 25/06 (caret after 5)"
		valueFormat="d/m"
		initialValue="10/06"/>
};

/** Replace in month-day pattern */
export const ReplaceMonthDayPattern: Story = {
	render: () => <Fixture
		pattern="@d/md" label="|06|/10 type 12 → 12/10 (caret after 2)"
		valueFormat="m/d"
		initialValue="06/10"/>
};

/** Replace minute in minute-second pattern */
export const ReplaceMinuteSecond: Story = {
	render: () => <Fixture
		pattern="@d:ns" label="|30|:45 type 15 → 15:45 (caret after 5)"
		valueFormat="n:s"
		initialValue="30:45"/>
};

// ── Invalid old value recovery ───────────────────────────────────────────

/** Replace in invalid old value — combined parsable → recovery */
export const ReplaceInvalidRecover: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="2024x/|1x/9| type 12 → 2024/12/09 (reformatted)"
		valueFormat={HxModelDateFormat}
		initialValue="2024x/1x/9"/>
};

/** Replace in invalid old value — not parsable → pass through */
export const ReplaceInvalidPassThrough: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="ab|cd|ef type 123 → ab123ef (passed through)"
		valueFormat={HxModelDateFormat}
		initialValue="abcdef"/>
};
