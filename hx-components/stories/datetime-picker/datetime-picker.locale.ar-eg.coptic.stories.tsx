import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Coptic', ...baseMeta};

// ---------------------------------------------------------------------------
// Coptic (Anno Martyrum / Diocletian era) calendar — ar-EG
// No 1582 reform and no Julian leap-year issues for this calendar.
// The Coptic calendar has no year 0: −1 (Before Diocletian) → 1 (A.M.).
// ---------------------------------------------------------------------------

// Era transition: Before Diocletian → Anno Martyrum
export const ArEgCoptic: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0284/08/27'})} calendarLocale="ar-EG"
			             label="Two days before era start (−1/13/04)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0284/08/28'})} calendarLocale="ar-EG"
			             label="Last day of Before Diocletian (−1/13/05)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0284/08/29'})} calendarLocale="ar-EG"
			             label="First day of Anno Martyrum (1/01/01)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0284/08/30'})} calendarLocale="ar-EG"
			             label="Second day of Anno Martyrum (1/01/02)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale="ar-EG"
			             label="New Year's Day, first year, 21st century"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="ar-EG"
			             label="Someday 2026"/>
		</HxGrid>;
	}
};
