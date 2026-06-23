import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput, HxModelDateFormat, HxModelDateTimeFormat, HxModelTimeFormat} from '../../src';
import {Fixture} from './format-input-datetime.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - DateTime/Display',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// ── date only ─────────────────────────────────────────────────────────

/** Full date with / separator, default value format */
export const DateFullSlash: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="date with /: 2024/06/10"
		valueFormat={HxModelDateFormat}
		initialValue="2024/06/10"/>
};

/** Full date with - separator */
export const DateFullDash: Story = {
	render: () => <Fixture
		pattern="@d-ymd" label="date with -: 2024-06-10"
		valueFormat={HxModelDateFormat}
		initialValue="2024-06-10"/>
};

/** Month + Day only */
export const DateMonthDay: Story = {
	render: () => <Fixture
		pattern="@d/md" label="month+day: 06/10"
		valueFormat="m/d"
		initialValue="06/10"/>
};

/** Day + Month only (reversed order) */
export const DateDayMonth: Story = {
	render: () => <Fixture
		pattern="@d/dm" label="day+month: 06/10"
		valueFormat="m/d"
		initialValue="10/06"/>
};

/** Year only */
export const DateYearOnly: Story = {
	render: () => <Fixture
		pattern="@d/y" label="year only: 2024"
		valueFormat="y"
		initialValue="2024"/>
};

/** Compact date (no separator) */
export const DateCompact: Story = {
	render: () => <Fixture
		pattern="@dymd" label="compact date: 20240610"
		valueFormat="ymd"
		initialValue="20240610"/>
};

// ── time only ─────────────────────────────────────────────────────────

/** Full time with : separator */
export const TimeFull: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="time: 14:30:00"
		valueFormat={HxModelTimeFormat}
		initialValue="14:30:00"/>
};

/** Hour + Minute */
export const TimeHourMinute: Story = {
	render: () => <Fixture
		pattern="@d:hn" label="hour+minute: 14:30"
		valueFormat="h:n"
		initialValue="14:30"/>
};

/** Hour only */
export const TimeHourOnly: Story = {
	render: () => <Fixture
		pattern="@d:h" label="hour only: 14"
		valueFormat="h"
		initialValue="14"/>
};

/** Minute + Second */
export const TimeMinuteSecond: Story = {
	render: () => <Fixture
		pattern="@d:ns" label="minute+second: 30:45"
		valueFormat="n:s"
		initialValue="30:45"/>
};

/** Compact time (no separator) */
export const TimeCompact: Story = {
	render: () => <Fixture
		pattern="@dhns" label="compact time: 143000"
		valueFormat="hns"
		initialValue="143000"/>
};

/** Time with dot separator */
export const TimeDot: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="dot time: 14.30.00 → 14:30:00"
		valueFormat="h.n.s"
		initialValue="14.30.00"/>
};

// ── date + time ───────────────────────────────────────────────────────

/** Full date and time */
export const DateTimeFull: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="datetime: 2024/06/10 14:30:00"
		valueFormat={HxModelDateTimeFormat}
		initialValue="2024/06/10T14:30:00"/>
};

/** Date + Hour+Minute */
export const DateTimeHourMinute: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hn" label="date+hour+minute: 2024/06/10 14:30"
		valueFormat="y/m/d h:n"
		initialValue="2024/06/10 14:30"/>
};

/** Date + Time with custom value format */
export const DateTimeCustomValueFormat: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="custom value format y-m-d h:n:s: 2024-06-10 14:30:00"
		valueFormat="y-m-d h:n:s"
		initialValue="2024-06-10 14:30:00"/>
};

/** Day first date + time */
export const DateTimeDayFirst: Story = {
	render: () => <Fixture
		pattern="@d/d-m-y h:n" label="day first: 10-06-2024 14:30"
		valueFormat="d-m-y h:n"
		initialValue="10-06-2024 14:30"/>
};

// ── null / undefined / empty ──────────────────────────────────────────

/** null model value → undefined display */
export const NullValue: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="null → undefined"
		valueFormat={HxModelDateFormat}
		initialValue={null}/>
};

/** undefined model value → undefined display */
export const UndefinedValue: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="undefined → undefined"
		valueFormat={HxModelDateFormat}
		initialValue={(void 0)}/>
};

/** empty string model value */
export const EmptyStringValue: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="empty string → empty string"
		valueFormat={HxModelDateFormat}
		initialValue={''}/>
};

// ── model value with different format than default ────────────────────

/** Model uses y-m-d format, display uses /ymd */
export const ModelWithDashFormat: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="model: 2024-06-10 → display: 2024/06/10"
		valueFormat="y-m-d"
		initialValue="2024-06-10"/>
};

/** Model uses h:n:s format, display uses :hns */
export const ModelTimeWithColon: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="model: 14:30:00 → display: 14:30:00"
		valueFormat="h:n:s"
		initialValue="14:30:00"/>
};

/** Model with single-digit month */
export const ModelSingleDigitMonth: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="model: 2024/6/10 → display: 2024/06/10"
		valueFormat="y-m-d"
		initialValue="2024/6/10"/>
};

// ── partial match ─────────────────────────────────────────────────────

/** Partial: datetime pattern, model has only date */
export const PartialDateTimeDateOnly: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="model: 2024/06/10 → display: 2024/06/10 __:__:__"
		valueFormat={HxModelDateTimeFormat}
		initialValue="2024/06/10"/>
};

/** Partial: date pattern, model has only year */
export const PartialDateYearOnly: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="model: 2024 → display: 2024/__/__"
		valueFormat="y"
		initialValue="2024"/>
};

/** Partial: date pattern, model has only year-month */
export const PartialDateYearMonth: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="model: 2024/06 → display: 2024/06/__"
		valueFormat="y/m"
		initialValue="2024/06"/>
};

/** Partial: time pattern, model has only hour */
export const PartialTimeHourOnly: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="model: 14 → display: 14:__:__"
		valueFormat="h"
		initialValue="14"/>
};

/** Partial: time pattern, model has only hour-minute */
export const PartialTimeHourMinute: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="model: 14:30 → display: 14:30:__"
		valueFormat="h:n"
		initialValue="14:30"/>
};

// ── char placeholder on empty ─────────────────────────────────────────

/** charPlaceholderOnEmpty: null value shows underscores */
export const PlaceholderOnEmptyNull: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="null + placeholder → ____/__/__"
		valueFormat={HxModelDateFormat}
		charPlaceholderOnEmpty={true}
		initialValue={null}/>
};

/** charPlaceholderOnEmpty: empty string shows underscores */
export const PlaceholderOnEmptyBlank: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="empty string + placeholder → ____/__/__"
		valueFormat={HxModelDateFormat}
		charPlaceholderOnEmpty={true}
		initialValue={''}/>
};

/** charPlaceholderOnEmpty disabled: null returns undefined */
export const PlaceholderOffNull: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="null without placeholder → undefined"
		valueFormat={HxModelDateFormat}
		charPlaceholderOnEmpty={false}
		initialValue={null}/>
};

// ── other separators ───────────────────────────────────────────────────

/** Chinese date separators */
export const ChineseDate: Story = {
	render: () => <Fixture
		pattern="@dymd" label="Chinese: 2024年06月10日 → 20240610"
		valueFormat="y年m月d日"
		initialValue="2024年06月10日"/>
};

/** Dot-separated date (German style) */
export const DotSeparatedDate: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="German style: 2024.06.10 → 2024/06/10"
		valueFormat="y.m.d"
		initialValue="2024.06.10"/>
};

/** Letter-separated date (e.g. JUN) */
export const LetterSeparatedDate: Story = {
	render: () => <Fixture
		pattern="@d-ymd" label="letter sep: 2024JUN10 → 2024-06-10"
		valueFormat="yJUNd"
		initialValue="2024JUN10"/>
};

/** Time with letter separator */
export const LetterSeparatedTime: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="letter sep: 14H30M00 → 14:30:00"
		valueFormat="hHnMs"
		initialValue="14H30M00"/>
};

// ── non-date values ───────────────────────────────────────────────────

/** Non-date string passes through */
export const NonDateString: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="non-date: hello → hello"
		valueFormat={HxModelDateFormat}
		initialValue="hello"/>
};

/** Number value → stringified and displayed as-is */
export const NumberValue: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="number: 123 → 0123/__/__"
		valueFormat={HxModelDateFormat}
		initialValue={123}/>
};
