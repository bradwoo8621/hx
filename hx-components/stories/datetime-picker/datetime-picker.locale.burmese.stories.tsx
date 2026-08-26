import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Burmese', ...baseMeta};

// ---------------------------------------------------------------------------
// Burmese — my-MM (Gregorian calendar)
// ---------------------------------------------------------------------------

export const MyMmBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="my-MM"
			                        label="#1 Month of A.D. — my-MM (Burmese)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="my-MM"
			                        label="Someday 2026 — my-MM (Burmese)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="my-MM"
			                        label="Last day of A.D. — my-MM (Burmese)"/>
		</HxGrid>;
	}
};

/**
 * Burmese language habits: Myanmar script with its own digits (e.g. ၂၀၂၅ for
 * 2025) and month names like ဇွန် (June). The ICU week data starts the week
 * on Sunday (တနင်္ဂနွေ), so the popup week header follows that order.
 * Myanmar officially uses the Burmese calendar, but no provider covers
 * my-MM, so it resolves to the Gregorian calendar.
 */
export const MyMmLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="my-MM"
			                        label="Tuesday, June 10 — my-MM (Sunday-first week per ICU)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="my-MM"
			                        label="Thursday, December 25 — my-MM"/>
		</HxGrid>;
	}
};
