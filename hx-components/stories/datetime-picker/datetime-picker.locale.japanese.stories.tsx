import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese Imperial calendar — ja-JP
// ---------------------------------------------------------------------------

// --- First A.D. boundary ---

export const JaJapaneseFirstAD: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="ja-JP"
			             label="#1 Month of A.D. — ja-JP"/>
		</HxGrid>;
	}
};

// --- 1582 Gregorian reform ---

export const JaJapanese1582: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/01/01'})} calendarLocale="ja-JP"
			             label="Last year has Gregorian reform dates — ja-JP"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/14'})} calendarLocale="ja-JP"
			             label="Short months, aligned with Gregorian dates, #1 — ja-JP"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/15'})} calendarLocale="ja-JP"
			             label="Short months, aligned with Gregorian dates, #2 — ja-JP"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/12/31'})} calendarLocale="ja-JP"
			             label="Fully aligned with Gregorian dates — ja-JP"/>
		</HxGrid>;
	}
};

// --- Julian leap years ---

export const JaJapaneseJulianLeap: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0100/02/27'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 0100"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0200/02/28'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 0200"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0300/03/01'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 0300"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0500/03/02'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 0500"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0600/03/03'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 0600"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0700/03/04'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 0700"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0900/03/05'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 0900"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1000/03/06'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 1000"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1100/03/07'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 1100"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1300/03/08'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 1300"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1400/03/09'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 1400"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1500/03/10'})} calendarLocale="ja-JP"
			             label="Julian Leap Year 1500"/>
		</HxGrid>;
	}
};
