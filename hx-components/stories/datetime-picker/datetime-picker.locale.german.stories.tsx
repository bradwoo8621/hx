import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/German', ...baseMeta};

// ---------------------------------------------------------------------------
// German — de-DE (Gregorian calendar)
// ---------------------------------------------------------------------------

export const DeDeBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="de-DE"
			                        label="#1 Month of A.D. — de-DE (German)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="de-DE"
			                        label="Someday 2026 — de-DE (German)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="de-DE"
			                        label="Last day of A.D. — de-DE (German)"/>
		</HxGrid>;
	}
};

/**
 * German language habits: Latin script with dotted ordinal days
 * (10. Juni) and the week starting on Monday (Montag); the popup week
 * header follows that order.
 */
export const DeDeLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="de-DE"
			                        label="Tuesday, June 10 — de-DE (d/m/y order, Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="de-DE"
			                        label="Thursday, December 25 — de-DE"/>
		</HxGrid>;
	}
};
