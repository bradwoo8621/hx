import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Indonesian', ...baseMeta};

// ---------------------------------------------------------------------------
// Indonesian — id-ID (Gregorian calendar)
// ---------------------------------------------------------------------------

export const IdIdBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="id-ID"
			                        label="#1 Month of A.D. — id-ID (Indonesian)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="id-ID"
			                        label="Someday 2026 — id-ID (Indonesian)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="id-ID"
			                        label="Last day of A.D. — id-ID (Indonesian)"/>
		</HxGrid>;
	}
};

/**
 * Indonesian language habits: Latin script with Indonesian month names (Juni,
 * Desember). The ICU week data starts the week on Sunday (Minggu), so the
 * popup week header follows that order. Indonesia also uses the Islamic
 * calendar for religious purposes, but the library resolves id-ID to the
 * Gregorian calendar.
 */
export const IdIdLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="id-ID"
			                        label="Tuesday, June 10 — id-ID (Sunday-first week per ICU)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="id-ID"
			                        label="Thursday, December 25 — id-ID"/>
		</HxGrid>;
	}
};
