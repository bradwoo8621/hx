import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStoryForDateOnly} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Gregory', ...baseMeta};

// ---------------------------------------------------------------------------
// Gregorian calendar
// ---------------------------------------------------------------------------

export const Gregory: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg" minWidth={800}>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="gregory"
			                        label="#1 Month of A.D."/>
			<div/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1980/01/01'})} calendarLocale="gregory"
			                        label="New Year's Day, some year, 20th century"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="gregory"
			                        label="Someday 2026"/>
		</HxGrid>;
	}
};
