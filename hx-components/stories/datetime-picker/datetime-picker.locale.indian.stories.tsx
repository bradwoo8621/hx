import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStory, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Indian', ...baseMeta};

// ---------------------------------------------------------------------------
// Indian (Saka) national calendar — hi-IN, en-IN
// No 1582 reform and no Julian leap-year issues for this calendar.
// The Saka calendar includes year 0: …, −1, 0, 1, …
// Epoch: Saka −78/10/11 = Gregorian 0001/01/01.
// ---------------------------------------------------------------------------

// --- First A.D. boundary ---

export const HiIndianFirstOfADAndLastOf9999: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="hi-IN"
			             label="#1 Month of A.D. — hi-IN (Saka −78/10/11)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="hi-IN"
			             label="Last month of A.D. — hi-IN (Saka 9921)"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="en-IN"
			             label="#1 Month of A.D. — en-IN (Saka −78/10/11)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="en-IN"
			             label="Last month of A.D. — en-IN (Saka 9921)"/>
		</HxGrid>;
	}
};

// --- Era transition: Before Saka → Saka ---

export const HiIndianSaka: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0078/03/21'})} calendarLocale="hi-IN"
			             label="Last day of Before Saka (−1/12/30, Gregorian 78/03/21) — hi-IN"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0078/03/22'})} calendarLocale="hi-IN"
			             label="First day of Saka era (0/01/01, Gregorian 78/03/22) — hi-IN"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0078/03/21'})} calendarLocale="en-IN"
			             label="Last day of Before Saka — en-IN"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0078/03/22'})} calendarLocale="en-IN"
			             label="First day of Saka era — en-IN"/>
		</HxGrid>;
	}
};

// --- Saka leap years ---
//
// Saka new year is March 22 (March 21 in leap years).
// The last day of Chaitra (month 1) is always April 20 — showing 31 vs 30 days.
// Before-Saka years are negative: −2 is leap (Gregorian 76), −1 is common.

export const HiIndianLeapYear: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{/* --- Before Saka --- */}
			<LocaleStory {...args} $model={ERO.reactive({date: '0076/04/20'})} calendarLocale="hi-IN"
			             label="Saka −2/01/31, leap year (Gregorian 76 is leap) — hi-IN"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0077/04/20'})} calendarLocale="hi-IN"
			             label="Saka −1/01/30, common year — hi-IN"/>
			<HxSeparator gCols={12}/>
			{/* --- Saka era --- */}
			<LocaleStory {...args} $model={ERO.reactive({date: '2024/04/20'})} calendarLocale="hi-IN"
			             label="Saka 1946/01/31, leap year — hi-IN"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2025/04/20'})} calendarLocale="hi-IN"
			             label="Saka 1947/01/30, common year — hi-IN"/>
			<HxSeparator gCols={12}/>
			{/* --- en-IN --- */}
			<LocaleStory {...args} $model={ERO.reactive({date: '0076/04/20'})} calendarLocale="en-IN"
			             label="Saka −2/01/31, leap year — en-IN"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0077/04/20'})} calendarLocale="en-IN"
			             label="Saka −1/01/30, common year — en-IN"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2024/04/20'})} calendarLocale="en-IN"
			             label="Saka 1946/01/31, leap year — en-IN"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2025/04/20'})} calendarLocale="en-IN"
			             label="Saka 1947/01/30, common year — en-IN"/>
		</HxGrid>;
	}
};

// --- Modern dates ---

export const HiIndianModern: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale="hi-IN"
			             label="New Year's Day, 21st century — hi-IN"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="hi-IN"
			             label="Someday 2026 — hi-IN"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale="en-IN"
			             label="New Year's Day, 21st century — en-IN"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="en-IN"
			             label="Someday 2026 — en-IN"/>
		</HxGrid>;
	}
};
