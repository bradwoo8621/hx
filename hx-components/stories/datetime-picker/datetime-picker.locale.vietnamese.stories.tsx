import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Vietnamese', ...baseMeta};

// ---------------------------------------------------------------------------
// Vietnamese — vi-VN (Gregorian calendar)
// ---------------------------------------------------------------------------

export const ViVnBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="vi-VN"
			                        label="#1 Month of A.D. — vi-VN (Vietnamese)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="vi-VN"
			                        label="Someday 2026 — vi-VN (Vietnamese)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="vi-VN"
			                        label="Last day of A.D. — vi-VN (Vietnamese)"/>
		</HxGrid>;
	}
};

/**
 * Vietnamese language habits: Latin script with "tháng" month names, and the
 * week starts on Monday (Thứ 2); the popup week header follows that order.
 */
export const ViVnLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="vi-VN"
			                        label="Tuesday, June 10 — vi-VN (d/m/y order, Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="vi-VN"
			                        label="Thursday, December 25 — vi-VN"/>
		</HxGrid>;
	}
};
