import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Ethiopic', ...baseMeta};

// ---------------------------------------------------------------------------
// Ethiopic (Incarnation Era / Amätä Məhrät) calendar — am-ET, ti-ET
// No 1582 reform and no Julian leap-year issues for this calendar.
// All-positive year numbering: B.I. 5500 → A.I. 1 (no year 0).
// B.I. era: 5493/05/08 (Gregorian 0001/01/01) … 5500/13/05 (Gregorian 8/08/26).
// ---------------------------------------------------------------------------

// --- First A.D. boundary ---

export const AmEthiopicFirstOfADAndLastOf9999: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="am-ET"
			                        label="#1 Month of A.D. — am-ET (Ethiopic, 5493/05/08)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="am-ET"
			                        label="Last month of A.D. — am-ET (Ethiopic, 9992)"/>
		</HxGrid>;
	}
};

export const TiEthiopicFirstOfADAndLastOf9999: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="ti-ET"
			                        label="#1 Month of A.D. — ti-ET (Ethiopic, 5493/05/08)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="ti-ET"
			                        label="Last month of A.D. — ti-ET (Ethiopic, 9992)"/>
		</HxGrid>;
	}
};

// --- Era transition: Before Incarnation → Anno Incarnationis (am-ET) ---

export const AmEthiopicEra: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0008/08/26'})} calendarLocale="am-ET"
			                        label="Last day of Before Incarnation (B.I. 5500/13/05)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0008/08/27'})} calendarLocale="am-ET"
			                        label="First day of Anno Incarnationis (A.I. 1/01/01)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale="am-ET"
			                        label="New Year's Day, first year, 21st century"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="am-ET"
			                        label="Someday 2026"/>
		</HxGrid>;
	}
};

// --- Era transition: Before Incarnation → Anno Incarnationis (ti-ET) ---

export const TiEthiopicEra: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0008/08/26'})} calendarLocale="ti-ET"
			                        label="Last day of Before Incarnation — ti-ET (B.I. 5500/13/05)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0008/08/27'})} calendarLocale="ti-ET"
			                        label="First day of Anno Incarnationis — ti-ET (A.I. 1/01/01)"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale="ti-ET"
			                        label="New Year's Day, first year, 21st century — ti-ET"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="ti-ET"
			                        label="Someday 2026 — ti-ET"/>
		</HxGrid>;
	}
};
