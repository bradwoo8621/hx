import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Malay', ...baseMeta};

// ---------------------------------------------------------------------------
// Malay — ms-MY (Gregorian calendar)
// ---------------------------------------------------------------------------

export const MsMyBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="ms-MY"
			                        label="#1 Month of A.D. — ms-MY (Malay)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="ms-MY"
			                        label="Someday 2026 — ms-MY (Malay)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="ms-MY"
			                        label="Last day of A.D. — ms-MY (Malay)"/>
		</HxGrid>;
	}
};

/**
 * Malay language habits: Latin script with Malay month names (Jun, Disember),
 * and the week starts on Monday (Isnin); the popup week header follows that
 * order. Malaysia also uses the Islamic calendar for religious purposes, but
 * the library resolves ms-MY to the Gregorian calendar.
 */
export const MsMyLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="ms-MY"
			                        label="Tuesday, June 10 — ms-MY (Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="ms-MY"
			                        label="Thursday, December 25 — ms-MY"/>
		</HxGrid>;
	}
};
