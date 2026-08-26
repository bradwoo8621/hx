import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Spanish', ...baseMeta};

// ---------------------------------------------------------------------------
// Spanish — es-ES (Gregorian calendar)
// ---------------------------------------------------------------------------

export const EsEsBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="es-ES"
			                        label="#1 Month of A.D. — es-ES (Spanish)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="es-ES"
			                        label="Someday 2026 — es-ES (Spanish)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="es-ES"
			                        label="Last day of A.D. — es-ES (Spanish)"/>
		</HxGrid>;
	}
};

/**
 * Spanish language habits: Latin script with the "de" connective between
 * parts (10 de junio de 2025) and the week starting on Monday (lunes);
 * the popup week header follows that order.
 */
export const EsEsLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="es-ES"
			                        label="Tuesday, June 10 — es-ES (d/m/y order, Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="es-ES"
			                        label="Thursday, December 25 — es-ES"/>
		</HxGrid>;
	}
};
