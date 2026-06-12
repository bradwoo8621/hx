import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../../src';
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
		initialValue="2024/06/10"/>
};

/** Full date with - separator */
export const DateFullDash: Story = {
	render: () => <Fixture
		pattern="@d-ymd" label="date with -: 2024-06-10"
		initialValue="2024-06-10"/>
};

/** Month + Day only */
export const DateMonthDay: Story = {
	render: () => <Fixture
		pattern="@d/md" label="month+day: 06/10"
		initialValue="06/10"/>
};

/** Day + Month only (reversed order) */
export const DateDayMonth: Story = {
	render: () => <Fixture
		pattern="@d/dm" label="day+month: 10/06"
		initialValue="10/06"/>
};

/** Year only */
export const DateYearOnly: Story = {
	render: () => <Fixture
		pattern="@d/y" label="year only: 2024"
		initialValue="2024"/>
};

/** Compact date (no separator) */
export const DateCompact: Story = {
	render: () => <Fixture
		pattern="@dymd" label="compact date: 20240610"
		initialValue="20240610"/>
};

// ── time only ─────────────────────────────────────────────────────────

/** Full time with : separator */
export const TimeFull: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="time: 14:30:00"
		initialValue="14:30:00"/>
};

/** Hour + Minute */
export const TimeHourMinute: Story = {
	render: () => <Fixture
		pattern="@d:hn" label="hour+minute: 14:30"
		initialValue="14:30"/>
};

/** Hour only */
export const TimeHourOnly: Story = {
	render: () => <Fixture
		pattern="@d:h" label="hour only: 14"
		initialValue="14"/>
};

/** Minute + Second */
export const TimeMinuteSecond: Story = {
	render: () => <Fixture
		pattern="@d:ns" label="minute+second: 30:45"
		initialValue="30:45"/>
};

/** Compact time (no separator) */
export const TimeCompact: Story = {
	render: () => <Fixture
		pattern="@dhns" label="compact time: 143000"
		initialValue="143000"/>
};

// ── date + time ───────────────────────────────────────────────────────

/** Full date and time */
export const DateTimeFull: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="datetime: 2024/06/10 14:30:00"
		initialValue="2024/06/10T14:30:00"/>
};

/** Date + Hour+Minute */
export const DateTimeHourMinute: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hn" label="date+hour+minute: 2024/06/10 14:30"
		initialValue="2024/06/10 14:30"/>
};

/** Date + Time with custom value format */
export const DateTimeCustomValueFormat: Story = {
	render: () => <Fixture
		pattern="@d/ymd :hns" label="custom value format y-m-d h:n:s: 2024-06-10 14:30:00"
		initialValue="2024-06-10 14:30:00"
		valueFormat="y-m-d h:n:s"/>
};

/** Day first date + time */
export const DateTimeDayFirst: Story = {
	render: () => <Fixture
		pattern="@d/d-m-y h:n" label="day first: 10-06-2024 14:30"
		initialValue="10-06-2024 14:30"/>
};

// ── null / undefined / empty ──────────────────────────────────────────

/** null model value → undefined display */
export const NullValue: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="null → undefined"
		initialValue={null}/>
};

/** undefined model value → undefined display */
export const UndefinedValue: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="undefined → undefined"
		initialValue={(void 0)}/>
};

/** empty string model value */
export const EmptyStringValue: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="empty string → empty string"
		initialValue={''}/>
};

// ── model value with different format than default ────────────────────

/** Model uses y-m-d format, display uses /ymd */
export const ModelWithDashFormat: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="model: 2024-06-10 → display: 2024/06/10"
		initialValue="2024-06-10"/>
};

/** Model uses h:n:s format, display uses :hns */
export const ModelTimeWithColon: Story = {
	render: () => <Fixture
		pattern="@d:hns" label="model: 14:30:00 → display: 14:30:00"
		initialValue="14:30:00"/>
};

/** Model with single-digit month */
export const ModelSingleDigitMonth: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="model: 2024/6/10 → display: 2024/06/10"
		initialValue="2024/6/10"/>
};

// ── non-date values ───────────────────────────────────────────────────

/** Non-date string passes through */
export const NonDateString: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="non-date: hello → hello"
		initialValue="hello"/>
};

/** Number value → stringified and displayed as-is */
export const NumberValue: Story = {
	render: () => <Fixture
		pattern="@d/ymd" label="number: 123 → 123"
		initialValue={123}/>
};
