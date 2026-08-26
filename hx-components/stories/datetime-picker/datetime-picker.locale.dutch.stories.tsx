import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Dutch', ...baseMeta};

// ---------------------------------------------------------------------------
// Dutch — nl-NL (Gregorian calendar)
// ---------------------------------------------------------------------------

export const NlNlBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="nl-NL"
			                        label="#1 Month of A.D. — nl-NL (Dutch)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="nl-NL"
			                        label="Someday 2026 — nl-NL (Dutch)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="nl-NL"
			                        label="Last day of A.D. — nl-NL (Dutch)"/>
		</HxGrid>;
	}
};

/**
 * Dutch language habits: Latin script with lowercase month names (juni,
 * december) and the week starting on Monday (maandag); the popup week
 * header follows that order.
 */
export const NlNlLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="nl-NL"
			                        label="Tuesday, June 10 — nl-NL (d/m/y order, Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="nl-NL"
			                        label="Thursday, December 25 — nl-NL"/>
		</HxGrid>;
	}
};
