import {ERO} from '@hx/data';
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Islamic Civil', ...baseMeta};

// ---------------------------------------------------------------------------
// Islamic Civil calendar — a deterministic arithmetic variant of the Islamic
// calendar (alternating 29/30-day months with a 30-year leap cycle).
// Covers: ar-AE, ar-BH, ar-IQ, ar-KW, ar-LB, ar-QA, ar-SY (Gulf/Levant).
// Epoch: −640/05/18 = Gregorian 0001/01/01. Year 1 (1 AH) begins 0622/07/19.
// ---------------------------------------------------------------------------

const ALL_LOCALES = ['ar-AE', 'ar-BH', 'ar-IQ', 'ar-KW', 'ar-LB', 'ar-QA', 'ar-SY'];

// --- First A.D. boundary ---

export const IslamicCivilFirstOfADAndLastOf9999: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map(locale => (<React.Fragment key={locale}>
				<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale={locale}
				                        label={`#1 Month of A.D. — ${locale} (Islamic −640/05/18)`}/>
				<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale={locale}
				                        label={`Last month of A.D. — ${locale} (Islamic 9666/04/02)`}/>
				<HxSeparator gCols={12}/>
			</React.Fragment>))}
		</HxGrid>;
	}
};

// --- Era transition: year 0 → 1 AH ---

export const IslamicCivilEraTransition: Story = {
	render: (args) => {
		const dates = [
			{date: '0622/07/18', label: 'year 0, Dhu al-Hijjah 30'},
			{date: '0622/07/19', label: 'year 1 AH, Muharram 1'}
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

export const IslamicCivilLastYear: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map((locale, li) => (
				<React.Fragment key={locale}>
					<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '9999/10/02'})} calendarLocale={locale}
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

export const IslamicCivilModern: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map(locale => (
				<LocaleStoryForDateOnly key={locale} {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale={locale}
				                        label={`Modern date — ${locale}`}/>
			))}
		</HxGrid>;
	}
};
