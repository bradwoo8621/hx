import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStory, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Buddhist', ...baseMeta};

// ---------------------------------------------------------------------------
// Buddhist calendar — th-TH
// ---------------------------------------------------------------------------

// --- First A.D. boundary ---

export const ThBuddhistFirstOfADAndLastOf9999: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="th-TH"
			             label="#1 Month of A.D. — th-TH (B.E. 544)"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="th-TH"
			             label="Last month of A.D. — th-TH (B.E. 10542)"/>
		</HxGrid>;
	}
};

// --- 1582 Gregorian reform ---

export const ThBuddhist1582: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/01/01'})} calendarLocale="th-TH"
			             label="Last year has Gregorian reform dates — th-TH"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/14'})} calendarLocale="th-TH"
			             label="Short months, aligned with Gregorian dates, #1 — th-TH"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/15'})} calendarLocale="th-TH"
			             label="Short months, aligned with Gregorian dates, #2 — th-TH"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/12/31'})} calendarLocale="th-TH"
			             label="Fully aligned with Gregorian dates — th-TH"/>
		</HxGrid>;
	}
};

// --- Julian leap years ---

export const ThBuddhistJulianLeap: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0100/02/27'})} calendarLocale="th-TH"
			             label="Julian Leap Year 0100 (B.E. 643)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0200/02/28'})} calendarLocale="th-TH"
			             label="Julian Leap Year 0200 (B.E. 743)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0300/03/01'})} calendarLocale="th-TH"
			             label="Julian Leap Year 0300 (B.E. 843)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0500/03/02'})} calendarLocale="th-TH"
			             label="Julian Leap Year 0500 (B.E. 1043)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0600/03/03'})} calendarLocale="th-TH"
			             label="Julian Leap Year 0600 (B.E. 1143)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0700/03/04'})} calendarLocale="th-TH"
			             label="Julian Leap Year 0700 (B.E. 1243)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0900/03/05'})} calendarLocale="th-TH"
			             label="Julian Leap Year 0900 (B.E. 1443)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1000/03/06'})} calendarLocale="th-TH"
			             label="Julian Leap Year 1000 (B.E. 1543)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1100/03/07'})} calendarLocale="th-TH"
			             label="Julian Leap Year 1100 (B.E. 1643)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1300/03/08'})} calendarLocale="th-TH"
			             label="Julian Leap Year 1300 (B.E. 1843)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1400/03/09'})} calendarLocale="th-TH"
			             label="Julian Leap Year 1400 (B.E. 1943)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1500/03/10'})} calendarLocale="th-TH"
			             label="Julian Leap Year 1500 (B.E. 2043)"/>
		</HxGrid>;
	}
};

// --- Modern dates ---

export const ThBuddhist: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '2000/01/01'})} calendarLocale="th-TH"
			             label="New Year's Day, B.E. 2543"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2020/01/01'})} calendarLocale="th-TH"
			             label="New Year's Day, B.E. 2563 (Leap Year)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="th-TH"
			             label="Someday 2026 (B.E. 2569)"/>
		</HxGrid>;
	}
};
