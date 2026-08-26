import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Polish', ...baseMeta};

// ---------------------------------------------------------------------------
// Polish — pl-PL (Gregorian calendar)
// ---------------------------------------------------------------------------

export const PlPlBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="pl-PL"
			                        label="#1 Month of A.D. — pl-PL (Polish)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="pl-PL"
			                        label="Someday 2026 — pl-PL (Polish)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="pl-PL"
			                        label="Last day of A.D. — pl-PL (Polish)"/>
		</HxGrid>;
	}
};

/**
 * Polish language habits: Latin script with genitive month names
 * (czerwca for June) and the week starting on Monday (poniedziałek);
 * the popup week header follows that order and uses the Polish narrow
 * weekday labels (p, w, ś, c, p, s, n).
 */
export const PlPlLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="pl-PL"
			                        label="Tuesday, June 10 — pl-PL (d/m/y order, Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="pl-PL"
			                        label="Thursday, December 25 — pl-PL"/>
		</HxGrid>;
	}
};
