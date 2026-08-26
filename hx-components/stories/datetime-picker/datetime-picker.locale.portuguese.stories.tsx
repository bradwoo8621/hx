import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Portuguese', ...baseMeta};

// ---------------------------------------------------------------------------
// Portuguese — pt-BR (Gregorian calendar)
// ---------------------------------------------------------------------------

export const PtBrBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="pt-BR"
			                        label="#1 Month of A.D. — pt-BR (Brazilian Portuguese)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="pt-BR"
			                        label="Someday 2026 — pt-BR (Brazilian Portuguese)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="pt-BR"
			                        label="Last day of A.D. — pt-BR (Brazilian Portuguese)"/>
		</HxGrid>;
	}
};

/**
 * Portuguese language habits: Latin script with lowercase month names
 * (junho, dezembro) and the week starting on Sunday (domingo) per the ICU
 * week data; the popup week header follows that order.
 */
export const PtBrLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="pt-BR"
			                        label="Tuesday, June 10 — pt-BR (d/m/y order, Sunday-first week per ICU)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="pt-BR"
			                        label="Thursday, December 25 — pt-BR"/>
		</HxGrid>;
	}
};
