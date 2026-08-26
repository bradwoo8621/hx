import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Mongolian', ...baseMeta};

// ---------------------------------------------------------------------------
// Mongolian — mn-MN (Gregorian calendar)
// ---------------------------------------------------------------------------

export const MnMnBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="mn-MN"
			                        label="#1 Month of A.D. — mn-MN (Mongolian)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="mn-MN"
			                        label="Someday 2026 — mn-MN (Mongolian)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="mn-MN"
			                        label="Last day of A.D. — mn-MN (Mongolian)"/>
		</HxGrid>;
	}
};

/**
 * Mongolian language habits: Cyrillic script with ordinal month names
 * (зургаадугаар сар for June) and weekday names like мягмар гараг
 * (Tuesday); the week starts on Monday (Даваа), and the popup week header
 * follows that order.
 */
export const MnMnLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="mn-MN"
			                        label="Tuesday, June 10 — mn-MN (Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="mn-MN"
			                        label="Thursday, December 25 — mn-MN"/>
		</HxGrid>;
	}
};
