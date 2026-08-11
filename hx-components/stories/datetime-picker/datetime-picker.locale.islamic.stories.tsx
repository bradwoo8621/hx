import {ERO} from '@hx/data';
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Islamic', ...baseMeta};

// ---------------------------------------------------------------------------
// Islamic (astronomical / observational) calendar — the ICU 'islamic' variant
// Covers: ar-DZ, ar-MA, ar-TN (Maghreb)
// Day boundaries are timezone-sensitive in ICU; the picker normalizes to UTC
// days, so the dates below are UTC-day semantics.
// Epoch: −640/05/20 = Gregorian 0001/01/01. Year 1 (1 AH) begins 0622/07/18.
// ---------------------------------------------------------------------------

const ALL_LOCALES = ['ar-DZ', 'ar-MA', 'ar-TN'];

// --- First A.D. boundary ---

export const IslamicFirstOfADAndLastOf9999: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map(locale => (<React.Fragment key={locale}>
				<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale={locale}
				                        label={`#1 Month of A.D. — ${locale} (Islamic −640/05/20)`}/>
				<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale={locale}
				                        label={`Last month of A.D. — ${locale} (Islamic 9666/04/01)`}/>
				<HxSeparator gCols={12}/>
			</React.Fragment>))}
		</HxGrid>;
	}
};

// --- Era transition: year 0 → 1 AH ---

export const IslamicEraTransition: Story = {
	render: (args) => {
		const dates = [
			{date: '0622/07/17', label: 'year 0, Dhu al-Hijjah 30'},
			{date: '0622/07/18', label: 'year 1 AH, Muharram 1'}
		];
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map((locale, li) => (
				<React.Fragment key={locale}>
					{dates.map((d, di) => (
						<LocaleStoryForDateOnly key={`${li}-${di}`} {...args} $model={ERO.reactive({date: d.date})}
						                        calendarLocale={locale}
						                        label={`${d.label} — ${locale}`}/>
					))}
					{li < ALL_LOCALES.length - 1 && <HxSeparator key={`sep-${li}`} gCols={12}/>}
				</React.Fragment>
			))}
		</HxGrid>;
	}
};

// --- Last year (9666) boundaries ---

export const IslamicLastYear: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map((locale, li) => (
				<React.Fragment key={locale}>
					<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/10/04'})} calendarLocale={locale}
					                        label={`First day of Islamic 9666 — ${locale}`}/>
					<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale={locale}
					                        label={`Last day of Islamic 9666 — ${locale}`}/>
					{li < ALL_LOCALES.length - 1 && <HxSeparator key={`sep-${li}`} gCols={12}/>}
				</React.Fragment>
			))}
		</HxGrid>;
	}
};

// --- Modern dates ---

export const IslamicModern: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map(locale => (
				<LocaleStoryForDateOnly key={locale} {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale={locale}
				                        label={`Modern date — ${locale}`}/>
			))}
		</HxGrid>;
	}
};
