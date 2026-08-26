import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Italian', ...baseMeta};

// ---------------------------------------------------------------------------
// Italian — it-IT (Gregorian calendar)
// ---------------------------------------------------------------------------

export const ItItBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="it-IT"
			                        label="#1 Month of A.D. — it-IT (Italian)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="it-IT"
			                        label="Someday 2026 — it-IT (Italian)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="it-IT"
			                        label="Last day of A.D. — it-IT (Italian)"/>
		</HxGrid>;
	}
};

/**
 * Italian language habits: Latin script with lowercase month names (giugno,
 * dicembre) and the week starting on Monday (lunedì); the popup week header
 * follows that order.
 */
export const ItItLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="it-IT"
			                        label="Tuesday, June 10 — it-IT (d/m/y order, Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="it-IT"
			                        label="Thursday, December 25 — it-IT"/>
		</HxGrid>;
	}
};
