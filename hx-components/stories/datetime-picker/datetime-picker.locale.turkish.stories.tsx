import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Turkish', ...baseMeta};

// ---------------------------------------------------------------------------
// Turkish — tr-TR (Gregorian calendar)
// ---------------------------------------------------------------------------

export const TrTrBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="tr-TR"
			                        label="#1 Month of A.D. — tr-TR (Turkish)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="tr-TR"
			                        label="Someday 2026 — tr-TR (Turkish)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="tr-TR"
			                        label="Last day of A.D. — tr-TR (Turkish)"/>
		</HxGrid>;
	}
};

/**
 * Turkish language habits: Latin script, date-first ordering with the
 * weekday at the end (10 Haziran 2025 Salı), and the week starting on
 * Monday (Pazartesi); the popup week header follows that order. Turkey
 * adopted the Gregorian calendar in 1926 (the Islamic calendar was used
 * before), and the library resolves tr-TR to the Gregorian calendar.
 */
export const TrTrLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="tr-TR"
			                        label="Tuesday, June 10 — tr-TR (d/m/y order, Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="tr-TR"
			                        label="Thursday, December 25 — tr-TR"/>
		</HxGrid>;
	}
};
