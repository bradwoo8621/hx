import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/English', ...baseMeta};

// ---------------------------------------------------------------------------
// English — en-US / en-GB (Gregorian calendar)
// ---------------------------------------------------------------------------

export const EnBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="en-US"
			                        label="#1 Month of A.D. — en-US (English)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="en-GB"
			                        label="Someday 2026 — en-GB (English)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="en-US"
			                        label="Last day of A.D. — en-US (English)"/>
		</HxGrid>;
	}
};

/**
 * English language habits differ by region: en-US writes month-first
 * (June 10, 2025) and starts the week on Sunday, while en-GB writes
 * day-first (10 June 2025) and starts the week on Monday; the popup
 * week headers follow each order.
 */
export const EnLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="en-US"
			                        label="Tuesday, June 10 — en-US (m/d/y order, Sunday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="en-GB"
			                        label="Tuesday, 10 June — en-GB (d/m/y order, Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="en-GB"
			                        label="Thursday, 25 December — en-GB"/>
		</HxGrid>;
	}
};
