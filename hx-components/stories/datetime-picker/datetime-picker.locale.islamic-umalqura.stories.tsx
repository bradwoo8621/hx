import {ERO} from '@hx/data';
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, LocaleStory, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Islamic Umm al-Qura', ...baseMeta};

// ---------------------------------------------------------------------------
// Islamic Umm al-Qura calendar — the Saudi observational calendar (table-based).
// Covers: ar-OM, ar-SA, ar-SD, ar-YE.
// Epoch: −640/05/18 = Gregorian 0001/01/01. Year 1 (1 AH) begins 0622/07/19.
// ---------------------------------------------------------------------------

const ALL_LOCALES = ['ar-OM', 'ar-SA', 'ar-SD', 'ar-YE'];

// --- First A.D. boundary ---

export const IslamicUmalquraFirstOfADAndLastOf9999: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map(locale => (<React.Fragment key={locale}>
				<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale={locale}
				             label={`#1 Month of A.D. — ${locale} (Islamic −640/05/18)`}/>
				<LocaleStory {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale={locale}
				             label={`Last month of A.D. — ${locale} (Islamic 9666/04/02)`}/>
				<HxSeparator gCols={12}/>
			</React.Fragment>))}
		</HxGrid>;
	}
};

// --- Era transition: year 0 → 1 AH ---

export const IslamicUmalquraEraTransition: Story = {
	render: (args) => {
		const dates = [
			{date: '0622/07/18', label: 'year 0, Dhu al-Hijjah 30'},
			{date: '0622/07/19', label: 'year 1 AH, Muharram 1'}
		];
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map((locale, li) => (
				<React.Fragment key={locale}>
					{dates.map((d, di) => (
						<LocaleStory key={`${li}-${di}`} {...args} $model={ERO.reactive({date: d.date})}
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

export const IslamicUmalquraLastYear: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map((locale, li) => (
				<React.Fragment key={locale}>
					<LocaleStory {...args} $model={ERO.reactive({date: '9999/10/02'})} calendarLocale={locale}
					             label={`First day of Islamic 9666 — ${locale}`}/>
					<LocaleStory {...args} $model={ERO.reactive({date: '9999/12/31'})} calendarLocale={locale}
					             label={`Last day of Islamic 9666 — ${locale}`}/>
					{li < ALL_LOCALES.length - 1 && <HxSeparator key={`sep-${li}`} gCols={12}/>}
				</React.Fragment>
			))}
		</HxGrid>;
	}
};

// --- Modern dates ---

export const IslamicUmalquraModern: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map(locale => (
				<LocaleStory key={locale} {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale={locale}
				             label={`Modern date — ${locale}`}/>
			))}
		</HxGrid>;
	}
};
