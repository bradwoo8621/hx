import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStory, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Hebrew', ...baseMeta};

// ---------------------------------------------------------------------------
// Hebrew (Anno Mundi) calendar
// Covers: he, he-IL
// 19-year Metonic cycle with 7 leap years (13 months).
// Leap remainders: {0, 3, 6, 8, 11, 14, 17} of year % 19.
// Epoch: Hebrew 3761/04/18 = Gregorian 0001/01/01.
// ---------------------------------------------------------------------------

const ALL_LOCALES = ['he', 'he-IL'];

// --- First A.D. boundary ---

export const FirstAD: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map(locale => (
				<LocaleStory key={locale} {...args} $model={ERO.reactive({date: '0001/01/01'})}
				             calendarLocale={locale}
				             label={`#1 Month of A.D. — ${locale} (Hebrew 3761/04/18)`}/>
			))}
		</HxGrid>;
	}
};

// --- Leap year (Adar II / month 13) ---
//
// Hebrew year 3762 = Gregorian year 2; 3762 % 19 = 0 → leap year (13 months).
// Adar I  = month 12 (30 days), Adar II = month 13 (29 days).

export const LeapYear: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0002/09/06'})} calendarLocale="he-IL"
			             label="Hebrew 3762/01/01 (Tishrei 1, leap year start) — he-IL"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0003/03/05'})} calendarLocale="he-IL"
			             label="Hebrew 3762/12/30 (Adar I 30) — he-IL"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0003/03/06'})} calendarLocale="he-IL"
			             label="Hebrew 3762/13/01 (Adar II 1, leap month) — he-IL"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0003/04/03'})} calendarLocale="he-IL"
			             label="Hebrew 3762/13/29 (Adar II 29, last day of leap year) — he-IL"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0002/09/06'})} calendarLocale="he"
			             label="Hebrew 3762/01/01 (Tishrei 1) — he"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0003/03/06'})} calendarLocale="he"
			             label="Hebrew 3762/13/01 (Adar II 1) — he"/>
		</HxGrid>;
	}
};

// --- Common year (12 months) for contrast ---

export const CommonYear: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map(locale => (
				<LocaleStory key={locale} {...args} $model={ERO.reactive({date: '0001/09/06'})}
				             calendarLocale={locale}
				             label={`Hebrew 3761/12/30 (Elul 30, last day of common year) — ${locale}`}/>
			))}
		</HxGrid>;
	}
};

// --- Modern dates ---

export const Modern: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map(locale => (
				<LocaleStory key={locale} {...args} $model={ERO.reactive({date: '2026/01/01'})}
				             calendarLocale={locale}
				             label={`New Year's Day, 21st century — ${locale}`}/>
			))}
		</HxGrid>;
	}
};
