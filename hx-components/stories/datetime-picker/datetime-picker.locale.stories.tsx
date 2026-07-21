import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {type CSSProperties} from 'react';
import {
	type HxDateTimeAnteroposterior,
	HxDateTimeAnteroposteriorUtils,
	HxDateTimePicker,
	type HxDateTimePickerProps
} from '../../src';

const meta: Meta<typeof HxDateTimePicker> = {
	title: 'Components/Basic/DateTimePicker/Locale',
	component: HxDateTimePicker,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		$model: {table: {disable: true}},
		$field: {table: {disable: true}},
		displayFormat: {
			control: 'text',
			description: 'hx pattern (@d/ymd), dayjs format string, or format function'
		},
		clearable: {control: 'boolean'},
		$disabled: {control: 'boolean'}
	}
};

export default meta;
type Story = StoryObj<typeof HxDateTimePicker>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Construct a Date for the given year, compensating for the JavaScript
 * 1900-offset quirk (years 0–99 map to 1900–1999 in the constructor).
 */
const makeDate = (year: number, month: number, day: number): Date => {
	const d = new Date();
	d.setFullYear(year, month - 1, day);
	return d;
};

/**
 * Compute anteroposterior using the exact same code path the picker uses.
 *
 * - Gregorian (`forceLang === 'gregory'`) → `gregorian(date)`
 * - Minguo  (`forceLang === 'zh-TW'`)      → `twMinguo(date)` which wraps
 *   the Gregorian computation with 民國 / 民國前 mapping.
 */
const computeAnteroposterior = (date: Date, forceLang: string | undefined): HxDateTimeAnteroposterior => {
	if (forceLang == null || forceLang === 'gregory') {
		return HxDateTimeAnteroposteriorUtils.gregorian(date);
	}
	return HxDateTimeAnteroposteriorUtils.twMinguo(date);
};

const isGregorian = (forceLang: string | undefined): boolean =>
	forceLang == null || forceLang === 'gregory';

const HEADER_STYLE: CSSProperties = {
	border: '1px solid #ccc',
	padding: '6px 12px',
	textAlign: 'left',
	fontFamily: 'monospace',
	fontSize: 13,
	fontWeight: 600,
	background: '#f0f0f0'
};

const CELL_STYLE: CSSProperties = {
	border: '1px solid #ccc',
	padding: '4px 12px',
	textAlign: 'left',
	fontFamily: 'monospace',
	fontSize: 13
};

const formatYear = (year: number, gregorian: boolean): string =>
	gregorian ? String(year).padStart(4, '0') : String(year);

const formatMonth = (month: number): string =>
	String(month).padStart(2, '0');

type RowData = {
	eraOfCalendar: string;
	yearOfCalendar: number;
	monthOfCalendar: number;
	yearOfGregory: number;
	monthOfGregory: number;
};

const DebugTable = ({ap, gregorian}: { ap: HxDateTimeAnteroposterior; gregorian: boolean }) => {
	const rows: Array<[string, RowData]> = [
		['Previous Year', ap.previousYear],
		['Previous Month', ap.previousMonth],
		['Current', ap.current],
		['Next Month', ap.nextMonth],
		['Next Year', ap.nextYear]
	];

	return (
		<table style={{borderCollapse: 'collapse'}}>
			<thead>
			<tr>
				<th style={HEADER_STYLE}>Navigation</th>
				<th style={HEADER_STYLE}>Era</th>
				<th style={HEADER_STYLE}>Calendar Year</th>
				<th style={HEADER_STYLE}>Calendar Month</th>
				<th style={HEADER_STYLE}>Gregory Year</th>
				<th style={HEADER_STYLE}>Gregory Month</th>
			</tr>
			</thead>
			<tbody>
			{rows.map(([label, data]) => (
				<tr key={label}>
					<td style={CELL_STYLE}>{label}</td>
					<td style={CELL_STYLE}>{data.eraOfCalendar || '(none)'}</td>
					<td style={CELL_STYLE}>{formatYear(data.yearOfCalendar, gregorian)}</td>
					<td style={CELL_STYLE}>{formatMonth(data.monthOfCalendar)}</td>
					<td style={CELL_STYLE}>{formatYear(data.yearOfGregory, true)}</td>
					<td style={CELL_STYLE}>{formatMonth(data.monthOfGregory)}</td>
				</tr>
			))}
			</tbody>
		</table>
	);
};

interface LocaleStoryArgs<T extends object> {
	date: Date;
	pickerArgs: HxDateTimePickerProps<T>;
}

const LocaleStory = <T extends object>({date, pickerArgs}: LocaleStoryArgs<T>) => {
	const forceLang = pickerArgs.forceLang as string | undefined;
	const gregorian = isGregorian(forceLang);
	const anteroposterior = computeAnteroposterior(date, forceLang);

	return (
		<div>
			<DebugTable ap={anteroposterior} gregorian={gregorian}/>
			<div style={{marginTop: 12}}>
				<HxDateTimePicker {...pickerArgs} />
			</div>
		</div>
	);
};

// ---------------------------------------------------------------------------
// Gregorian calendar
// ---------------------------------------------------------------------------

/** Earliest AD date — previous-year/previous-month navigation clamps to year 1. */
export const Gregory00010101: Story = {
	args: {
		$model: ERO.reactive({date: '0001/01/01'}),
		$field: 'date',
		forceLang: 'gregory',
		clearable: false
	},
	render: (args) => (
		<LocaleStory date={makeDate(1, 1, 1)} pickerArgs={args}/>
	)
};

/** Normal mid-era Gregorian date — year boundary (January). */
export const Gregory19800101: Story = {
	args: {
		$model: ERO.reactive({date: '1980/01/01'}),
		$field: 'date',
		forceLang: 'gregory',
		clearable: false
	},
	render: (args) => (
		<LocaleStory date={makeDate(1980, 1, 1)} pickerArgs={args}/>
	)
};

/** Modern Gregorian date — mid-year, no boundary edge cases. */
export const Gregory20260721: Story = {
	args: {
		$model: ERO.reactive({date: '2026/07/21'}),
		$field: 'date',
		forceLang: 'gregory',
		clearable: false
	},
	render: (args) => (
		<LocaleStory date={makeDate(2026, 7, 21)} pickerArgs={args}/>
	)
};

// ---------------------------------------------------------------------------
// Minguo (ROC) calendar — zh-TW
// ---------------------------------------------------------------------------

/** Earliest AD date under Minguo calendar — 民國前 era, previous-year clamps to year 1. */
export const Minguo00010101: Story = {
	args: {
		$model: ERO.reactive({date: '0001/01/01'}),
		$field: 'date',
		forceLang: 'zh-TW',
		clearable: false
	},
	render: (args) => (
		<LocaleStory date={makeDate(1, 1, 1)} pickerArgs={args}/>
	)
};

/** Late 民國前 era — year 1900, well before the ROC founding. */
export const Minguo19000101: Story = {
	args: {
		$model: ERO.reactive({date: '1900/01/01'}),
		$field: 'date',
		forceLang: 'zh-TW',
		clearable: false
	},
	render: (args) => (
		<LocaleStory date={makeDate(1900, 1, 1)} pickerArgs={args}/>
	)
};

/** Last day of 民國前 — 1911/12/31, the day before the ROC era begins. */
export const Minguo19111231: Story = {
	args: {
		$model: ERO.reactive({date: '1911/12/31'}),
		$field: 'date',
		forceLang: 'zh-TW',
		clearable: false
	},
	render: (args) => (
		<LocaleStory date={makeDate(1911, 12, 31)} pickerArgs={args}/>
	)
};

/** First day of 民國元年 — 1912/01/01, era transition boundary. */
export const Minguo19120101: Story = {
	args: {
		$model: ERO.reactive({date: '1912/01/01'}),
		$field: 'date',
		forceLang: 'zh-TW',
		clearable: false
	},
	render: (args) => (
		<LocaleStory date={makeDate(1912, 1, 1)} pickerArgs={args}/>
	)
};

/** Modern Minguo date — 民國115年, mid-year. */
export const Minguo20260721: Story = {
	args: {
		$model: ERO.reactive({date: '2026/07/21'}),
		$field: 'date',
		forceLang: 'zh-TW',
		clearable: false
	},
	render: (args) => (
		<LocaleStory date={makeDate(2026, 7, 21)} pickerArgs={args}/>
	)
};
