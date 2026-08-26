import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Lao', ...baseMeta};

// ---------------------------------------------------------------------------
// Lao — lo-LA (Gregorian calendar)
// ---------------------------------------------------------------------------

export const LoLaBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="lo-LA"
			                        label="#1 Month of A.D. — lo-LA (Lao)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="lo-LA"
			                        label="Someday 2026 — lo-LA (Lao)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="lo-LA"
			                        label="Last day of A.D. — lo-LA (Lao)"/>
		</HxGrid>;
	}
};

/**
 * Lao language habits: Lao script with month names like ມິຖຸນາ (June).
 * The ICU week data starts the week on Sunday, so the popup week header
 * follows that order. Laos officially uses the Buddhist calendar (ພ.ສ.),
 * but the Buddhist provider covers th-* only, so lo-LA resolves to the
 * Gregorian calendar.
 */
export const LoLaLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="lo-LA"
			                        label="Tuesday, June 10 — lo-LA (Sunday-first week per ICU)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="lo-LA"
			                        label="Thursday, December 25 — lo-LA"/>
		</HxGrid>;
	}
};
