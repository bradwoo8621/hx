import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Ethiopic/Tigrinya', ...baseMeta};

// ---------------------------------------------------------------------------
// Ethiopic (Incarnation Era / Amätä Məhrät) calendar — ti-ET (Tigrinya)
// ---------------------------------------------------------------------------

export const TiEtEthiopic: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0008/08/26'})} calendarLocale="ti-ET"
			             label="Last day of Before Incarnation — ti-ET (B.I. 5500/13/05)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0008/08/27'})} calendarLocale="ti-ET"
			             label="First day of Anno Incarnationis — ti-ET (A.I. 1/01/01)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale="ti-ET"
			             label="New Year's Day, first year, 21st century — ti-ET"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="ti-ET"
			             label="Someday 2026 — ti-ET"/>
		</HxGrid>;
	}
};
