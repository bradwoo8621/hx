import type {HxLanguageCode} from '../../../contexts';
import type {ComputedYears} from '../interfaces';
import {DateLocaleFormatUtils} from './date-locale-format.ts';
import {DateLocaleGregorianProvider} from './date-locale-gregorian.ts';
import {DateMoveUtils} from './date-move.ts';
import {UTCDate} from './utc-date.ts';

export class DateLocaleNotGregorianHelper {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	static yearsAround(baseDate: UTCDate, currentDate: UTCDate,
	                   yearOfCalendarRange: { min: number, max: number },
	                   formatYear: typeof DateLocaleFormatUtils['formatYear'] | null | undefined,
	                   lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		if (gregorian) {
			return DateLocaleGregorianProvider.yearsAround(baseDate, currentDate, lang);
		}

		// get current year
		const [, currentYear] = DateLocaleFormatUtils.formatDateInNumeric(currentDate, lang, false);
		// format given base date to calendar
		const [, year] = DateLocaleFormatUtils.formatDateInNumeric(baseDate, lang, false);
		const baseYear = year;
		const maxStartYear = yearOfCalendarRange.max - DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE + 1;
		const minStartYear = yearOfCalendarRange.min;
		const startYear = Math.min(maxStartYear, Math.max(minStartYear, year - Math.floor((DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE - 1) / 2)));
		// move to 1st day, 1st month, start year
		const baseDay = DateMoveUtils.moveToJan1OfCalendar(DateMoveUtils.asHxDate(baseDate), startYear - year, lang, false);

		return {
			forward: startYear !== maxStartYear,
			backward: startYear !== minStartYear,
			years: new Array(DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE)
				.fill(1)
				.map((_, index) => {
					const firstDayOfThisYear = DateMoveUtils.moveYear(baseDay, index, lang, false);
					const value = DateMoveUtils.asJsDate(firstDayOfThisYear);
					const [, year] = DateLocaleFormatUtils.formatDateInNumeric(value, lang, false);
					return {
						key: `${firstDayOfThisYear.year}-${firstDayOfThisYear.month}-${firstDayOfThisYear.day}`,
						label: (formatYear ?? DateLocaleFormatUtils.formatYear)(value, lang, false),
						value,
						offset: year - baseYear,
						thisYear: year === currentYear
					};
				})
		};
	}
}
