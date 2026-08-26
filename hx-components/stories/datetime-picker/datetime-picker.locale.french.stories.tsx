import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, LocaleStoryForFullDate, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/French', ...baseMeta};

// ---------------------------------------------------------------------------
// French — fr-FR (Gregorian calendar)
// ---------------------------------------------------------------------------

export const FrFrBoundaries: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="fr-FR"
			                        label="#1 Month of A.D. — fr-FR (French)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="fr-FR"
			                        label="Someday 2026 — fr-FR (French)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale="fr-FR"
			                        label="Last day of A.D. — fr-FR (French)"/>
		</HxGrid>;
	}
};

/**
 * French language habits: Latin script with lowercase month names (juin,
 * décembre) and the week starting on Monday (lundi); the popup week header
 * follows that order. The popup also uses the French narrow weekday labels
 * (L, M, M, J, V, S, D).
 */
export const FrFrLanguage: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/06/10'})} lang="fr-FR"
			                        label="Tuesday, June 10 — fr-FR (d/m/y order, Monday-first week)"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForFullDate {...args} $model={ERO.reactive({date: '2025/12/25'})} lang="fr-FR"
			                        label="Thursday, December 25 — fr-FR"/>
		</HxGrid>;
	}
};
