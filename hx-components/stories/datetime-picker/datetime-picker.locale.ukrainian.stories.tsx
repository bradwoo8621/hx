import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Ukrainian', ...baseMeta};

// ---------------------------------------------------------------------------
// Ukrainian — uk-UA (Gregorian calendar)
// ---------------------------------------------------------------------------

export const UkUaBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="uk-UA"
			                        label="#1 Month of A.D. — uk-UA (Ukrainian)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="uk-UA"
			                        label="Someday 2026 — uk-UA (Ukrainian)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="uk-UA"
			                        label="Last day of A.D. — uk-UA (Ukrainian)"/>
		</HxGrid>;
	}
};

/**
 * Ukrainian language habits: Cyrillic script with genitive month names
 * (червня for June), the year marked with "р." (року), and the week
 * starting on Monday (понеділок); the popup week header follows that
 * order.
 */
export const UkUaLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="uk-UA"
			                        label="Tuesday, June 10 — uk-UA (d/m/y order, Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="uk-UA"
			                        label="Thursday, December 25 — uk-UA"/>
		</HxGrid>;
	}
};
