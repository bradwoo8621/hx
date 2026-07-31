import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Ethiopic', ...baseMeta};

// ---------------------------------------------------------------------------
// Ethiopic (Incarnation Era / Amätä Məhrät) calendar — am-ET
// No 1582 reform and no Julian leap-year issues for this calendar.
// All-positive year numbering: B.I. 5500 → A.I. 1 (no year 0).
// B.I. era: 5493/05/08 (Gregorian 0001/01/01) … 5500/13/05 (Gregorian 8/08/26).
// ---------------------------------------------------------------------------

// Era transition: Before Incarnation → Anno Incarnationis
export const AmEtEthiopic: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0008/08/25'})} calendarLocale="am-ET"
			             label="Two days before era start (B.I. 5500/13/04)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0008/08/26'})} calendarLocale="am-ET"
			             label="Last day of Before Incarnation (B.I. 5500/13/05)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0008/08/27'})} calendarLocale="am-ET"
			             label="First day of Anno Incarnationis (A.I. 1/01/01)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0008/08/28'})} calendarLocale="am-ET"
			             label="Second day of Anno Incarnationis (A.I. 1/01/02)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale="am-ET"
			             label="New Year's Day, first year, 21st century"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="am-ET"
			             label="Someday 2026"/>
		</HxGrid>;
	}
};
