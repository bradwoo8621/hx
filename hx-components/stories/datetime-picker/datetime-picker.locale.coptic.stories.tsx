import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Coptic', ...baseMeta};

// ---------------------------------------------------------------------------
// Coptic (Anno Martyrum / Diocletian era) calendar — ar-EG
// No 1582 reform and no Julian leap-year issues for this calendar.
// The Coptic calendar has no year 0: −1 (Before Diocletian) → 1 (A.M.).
// ---------------------------------------------------------------------------

// --- First A.D. boundary ---

export const ArCopticFirstOfADAndLastOf9999: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="ar-EG"
			                        label="#1 Month of A.D. — ar-EG (Coptic, −284/05/08)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="ar-EG"
			                        label="Last month of A.D. — ar-EG (Coptic, 9716)"/>
		</HxGrid>;
	}
};

// --- Era transition: Before Diocletian → Anno Martyrum ---

export const ArCopticEra: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0284/08/27'})} calendarLocale="ar-EG"
			                        label="Two days before era start (−1/13/04)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0284/08/28'})} calendarLocale="ar-EG"
			                        label="Last day of Before Diocletian (−1/13/05)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0284/08/29'})} calendarLocale="ar-EG"
			                        label="First day of Anno Martyrum (1/01/01)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0284/08/30'})} calendarLocale="ar-EG"
			                        label="Second day of Anno Martyrum (1/01/02)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale="ar-EG"
			                        label="New Year's Day, first year, 21st century"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="ar-EG"
			                        label="Someday 2026"/>
		</HxGrid>;
	}
};
