import {ERO} from '@hx/data';
import React from 'react';
import {HxGrid, type HxLanguageCode, HxSeparator} from '../../src';
import {baseMeta, LocaleStoryForDateOnly, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Persian', ...baseMeta};

// ---------------------------------------------------------------------------
// Persian (Jalaali / Solar Hijri) calendar
// Covers: fa-IR, fa-AF, ckb-IR, lrc-IR, mzn-IR, ps-AF, uz-Arab-AF
// 33-year leap cycle with 8 leap years. Includes year 0: …, −1, 0, 1, …
// Epoch: Persian −621/10/11 = Gregorian 0001/01/01.
// ---------------------------------------------------------------------------

const ALL_LOCALES = ['fa-IR', 'fa-AF', 'ckb-IR', 'lrc-IR', 'mzn-IR', 'ps-AF', 'uz-Arab-AF'];

// --- First A.D. boundary ---

export const FaPersianFirstOfADAndLastOf9999: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map(locale => (<>
				<LocaleStoryForDateOnly key={locale} {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale={locale}
				                        label={`#1 Month of A.D. — ${locale} (Persian −621/10/11)`}/>
				<HxSeparator gCols={12}/>
				<LocaleStoryForDateOnly key={`${locale}-9999`} {...args} $model={ERO.reactive({date: '9999/12/31'})}
				                        calendarLocale={locale}
				                        label={`Last month of A.D. — ${locale} (Persian 9378)`}/>
			</>))}
		</HxGrid>;
	}
};

// --- Era transition: B.H. (−1, 0) → A.H. (1) ---

export const FaPersianEraTransition: Story = {
	render: (args) => {
		const dates = [
			{date: '0621/03/20', label: 'B.H. year −1 Esfand 29'},
			{date: '0622/03/20', label: 'B.H. year 0 Esfand 29'},
			{date: '0622/03/21', label: 'A.H. year 1 Farvardin 1'}
		];
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map((locale, li) => (
				<React.Fragment key={locale}>
					{dates.map((d, di) => (
						<LocaleStoryForDateOnly key={`${li}-${di}`} {...args} $model={ERO.reactive({date: d.date})}
						                        calendarLocale={locale as HxLanguageCode}
						                        label={`${d.label} — ${locale}`}/>
					))}
					{li < ALL_LOCALES.length - 1 && <HxSeparator key={`sep-${li}`} gCols={12}/>}
				</React.Fragment>
			))}
		</HxGrid>;
	}
};

// --- 33-year leap cycle ---
//
// Leap remainder set: {1, 5, 9, 13, 17, 22, 26, 30}.
// Esfand (month 12) has 30 days in leap years, 29 in common years.

export const FaPersianLeapYear: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0619/03/21'})} calendarLocale="fa-IR"
			                        label="B.H. year −3 Esfand 30, leap year (mod 30) — fa-IR"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0620/03/20'})} calendarLocale="fa-IR"
			                        label="B.H. year −2 Esfand 29, common year — fa-IR"/>
			<HxSeparator gCols={12}/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2025/03/20'})} calendarLocale="fa-IR"
			                        label="A.H. 1403 Esfand 30, leap year (mod 17) — fa-IR"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/03/20'})} calendarLocale="fa-IR"
			                        label="A.H. 1404 Esfand 29, common year — fa-IR"/>
			<HxSeparator gCols={12}/>
			{ALL_LOCALES.map(locale => (
				<LocaleStoryForDateOnly key={locale} {...args} $model={ERO.reactive({date: '2025/03/20'})} calendarLocale={locale}
				                        label={`A.H. 1403 Esfand 30, leap year — ${locale}`}/>
			))}
		</HxGrid>;
	}
};

// --- Modern dates ---

export const FaPersianModern: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			{ALL_LOCALES.map(locale => (
				<LocaleStoryForDateOnly key={locale} {...args} $model={ERO.reactive({date: '2026/01/01'})} calendarLocale={locale}
				                        label={`New Year's Day, 21st century — ${locale}`}/>
			))}
		</HxGrid>;
	}
};
