import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Russian', ...baseMeta};

// ---------------------------------------------------------------------------
// Russian — ru-RU (Gregorian calendar)
// ---------------------------------------------------------------------------

export const RuRuBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="ru-RU"
			                        label="#1 Month of A.D. — ru-RU (Russian)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="ru-RU"
			                        label="Someday 2026 — ru-RU (Russian)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="ru-RU"
			                        label="Last day of A.D. — ru-RU (Russian)"/>
		</HxGrid>;
	}
};

/**
 * Russian language habits: Cyrillic script with genitive month names
 * (июня for June) and the year marked with "г." (года); the week starts
 * on Monday (понедельник), and the popup week header follows that order.
 */
export const RuRuLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="ru-RU"
			                        label="Tuesday, June 10 — ru-RU (d/m/y order, Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="ru-RU"
			                        label="Thursday, December 25 — ru-RU"/>
		</HxGrid>;
	}
};
