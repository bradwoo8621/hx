import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Minguo', ...baseMeta};

// ---------------------------------------------------------------------------
// Minguo (ROC) calendar — zh-TW
// ---------------------------------------------------------------------------

// --- First A.D. boundary ---

export const ZhRocFirstOfADAndLastOf9999: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="zh-TW"
			                        label="#1 Month of A.D. — zh-TW (Minguo)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="zh-TW"
			                        label="Last month of A.D. — zh-TW (ROC 8088)"/>
		</HxGrid>;
	}
};

// --- 1582 Gregorian reform ---

export const ZhRoc1582: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1582/01/01'})} calendarLocale="zh-TW"
			                        label="Last year has Gregorian reform dates — zh-TW"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1582/10/14'})} calendarLocale="zh-TW"
			                        label="Short months, aligned with Gregorian dates, #1 — zh-TW"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1582/10/15'})} calendarLocale="zh-TW"
			                        label="Short months, aligned with Gregorian dates, #2 — zh-TW"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1582/12/31'})} calendarLocale="zh-TW"
			                        label="Fully aligned with Gregorian dates — zh-TW"/>
		</HxGrid>;
	}
};

// --- Julian leap years ---

export const ZhRocJulianLeap: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0100/02/27'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 0100 (ROC -1812)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0200/02/28'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 0200 (ROC -1712)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0300/03/01'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 0300 (ROC -1612)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0500/03/02'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 0500 (ROC -1412)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0600/03/03'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 0600 (ROC -1312)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0700/03/04'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 0700 (ROC -1212)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0900/03/05'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 0900 (ROC -1012)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1000/03/06'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 1000 (ROC -912)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1100/03/07'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 1100 (ROC -812)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1300/03/08'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 1300 (ROC -612)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1400/03/09'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 1400 (ROC -512)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1500/03/10'})} calendarLocale="zh-TW"
			                        label="Julian Leap Year 1500 (ROC -412)"/>
		</HxGrid>;
	}
};

// --- Era transition: 民國前 → 民國 ---

export const ZhRocEra: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1900/01/01'})} calendarLocale="zh-TW"
			                        label="New Year's Day, first year, 20th century"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1911/12/31'})} calendarLocale="zh-TW"
			                        label="Last day of 民國前"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1912/01/01'})} calendarLocale="zh-TW"
			                        label="First day of 民國"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="zh-TW"
			                        label="Someday 2026"/>
		</HxGrid>;
	}
};
