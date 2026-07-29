import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Minguo', ...baseMeta};

// ---------------------------------------------------------------------------
// Minguo (ROC) calendar — zh-TW remaining cases
// (First AD, Julian leap years, and 1582 reform are in common files)
// ---------------------------------------------------------------------------

export const TwMinguo: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1900/01/01'})} calendarLocale="zh-TW"
			             label="New Year's Day, first year, 20th century"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1911/12/31'})} calendarLocale="zh-TW"
			             label="Last day of 民國前"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1912/01/01'})} calendarLocale="zh-TW"
			             label="First day of 民國"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="zh-TW" label="Someday 2026"/>
		</HxGrid>;
	}
};
