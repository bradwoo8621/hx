import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils, DateUtils} from '../facade';

export type GregoryDay = { year: number, month: number, day: number };
export type CalendarDay = { era?: string, year: number, month: number, day: number };
export type ADay = { gregory: GregoryDay, calendar: CalendarDay };
export type AMonth = { first: ADay, last: ADay };
export type CalendarYear = { months: Array<AMonth> };

export class DataMoveTestHelper {
	/**
	 * Compute calendar months and years backward from today for a given locale.
	 *
	 * Walks backward month-by-month from the current date, recording each month's
	 * first and last day in both Gregorian and the target calendar. Stops when the
	 * first day of A.D. (0001-01-01) is reached.
	 *
	 * @param lang - locale whose calendar to use
	 * @returns an array of calendar years, each containing their months
	 */
	static computeCalendarYearsAndMonths(lang: HxLanguageCode): Array<CalendarYear> {
		const toGregory = (date: Date): GregoryDay => {
			return {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
		};
		const toCalendar = (date: Date): CalendarDay => {
			const [
				eraOfCalendar, yearOfCalendar, monthOfCalendar, dayOfCalendar
			] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			return {era: eraOfCalendar, year: yearOfCalendar, month: monthOfCalendar, day: dayOfCalendar};
		};

		const calendarYears: Array<CalendarYear> = [];
		let calendarYear: CalendarYear;
		let aMonth: AMonth;
		let calendarDay: CalendarDay;

		// go!
		const date = new Date();
		// compute today in calendar of given language

		// last month, according to current date
		calendarDay = toCalendar(date);
		// @ts-expect-error ignore type check
		aMonth = {last: {gregory: toGregory(date), calendar: calendarDay}};
		calendarYear = {months: [aMonth]};
		calendarYears.push(calendarYear);
		// move to first day of this calendar month
		date.setDate(date.getDate() - calendarDay.day + 1);
		calendarDay = toCalendar(date);
		aMonth.first = {gregory: toGregory(date), calendar: calendarDay};

		// backward
		while (true) {
			if (DateUtils.firstDayOfAd(date)) {
				break;
			}

			// move to last day of previous month
			date.setDate(date.getDate() - 1);
			DateUtils.backToAdWhenBc(date);
			calendarDay = toCalendar(date);
			// @ts-expect-error ignore type check
			aMonth = {last: {gregory: toGregory(date), calendar: calendarDay}};
			if (aMonth.last.calendar.month > calendarYear.months[calendarYear.months.length - 1].last.calendar.month) {
				// jump to previous year
				calendarYear = {months: [aMonth]};
				calendarYears.push(calendarYear);
			} else {
				calendarYear.months.push(aMonth);
			}

			// move to first of previous month
			date.setDate(date.getDate() - calendarDay.day + 1);
			DateUtils.backToAdWhenBc(date);
			calendarDay = toCalendar(date);
			// very carefully, since there might some days jumping in-month, such as the disappeared 10 days in Oct. 1582.
			// so simply set day to 1st might introduce this issue,
			// have to fixed it.
			// the evidence is if the calendar day is not 1. so check it.
			//
			// but if date jumps into B.C., and back to first day of A.D. this logic should be ignored,
			// just take this day as the first day of calendar month
			if (!DateUtils.firstDayOfAd(date) && calendarDay.day !== 1) {
				while (true) {
					date.setDate(date.getDate() + 1);
					calendarDay = toCalendar(date);
					if (calendarDay.day === 1) {
						break;
					}
				}
			}
			aMonth.first = {gregory: toGregory(date), calendar: calendarDay};

			if (DateUtils.firstDayOfAd(date)) {
				break;
			}
		}

		calendarYears.forEach(year => {
			year.months.forEach(month => {
				if (month.first.calendar.era == null || month.first.calendar.era.trim() === '') {
					delete month.first.calendar.era;
				}
				if (month.last.calendar.era == null || month.last.calendar.era.trim() === '') {
					delete month.last.calendar.era;
				}
			});
		});

		return calendarYears;
	}

	/** Compute Buddhist (th-TH) calendar years. */
	static calendarYearsOfBuddhist(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('th-TH');
	}

	/** Compute Coptic (ar-EG) calendar years. */
	static calendarYearsOfCoptic(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('ar-EG');
	}

	/** Compute Ethiopic (am-ET) calendar years. */
	static calendarYearsOfEthiopic_Am_ET(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('am-ET');
	}

	/** Compute Ethiopic (ti-ET) calendar years. */
	static calendarYearsOfEthiopic_Ti_ET(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('ti-ET');
	}

	/** Compute Hebrew (he-IL) calendar years. */
	static calendarYearsOfHebrew(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('he-IL');
	}

	/** Compute Japanese (ja-JP) calendar years. */
	static calendarYearsOfJapanese(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('ja-JP');
	}

	/** Compute Indian national (hi-IN) calendar years. */
	static calendarYearsOfIndian(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('hi-IN');
	}

	/** Compute Islamic tabular (ar-DZ) calendar years. */
	static calendarYearsOfIslamic(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('ar-DZ');
	}

	/** Compute Islamic Civil (ar-AE) calendar years. */
	static calendarYearsOfIslamicCivil(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('ar-AE');
	}

	/** Compute Umm Al-Qura (ar-OM) calendar years. */
	static calendarYearsOfIslamicUmalqura(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('ar-OM');
	}

	/** Compute Persian (mzn-IR) calendar years. */
	static calendarYearsOfPersian_Mzn_IR(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('mzn-IR');
	}

	/** Compute Persian (lrc-IR) calendar years. */
	static calendarYearsOfPersian_Lrc_IR(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('lrc-IR');
	}

	/** Compute Persian (ckb-IR) calendar years. */
	static calendarYearsOfPersian_Ckb_IR(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('ckb-IR');
	}

	/** Compute Persian (fa-IR) calendar years. */
	static calendarYearsOfPersian_Fa_IR(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('fa-IR');
	}

	/** Compute Persian (ps-AF) calendar years. */
	static calendarYearsOfPersian_Ps_AF(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('ps-AF');
	}

	/** Compute Persian (uz-Arab-AF) calendar years. */
	static calendarYearsOfPersian_Uz_Arab_AF(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('uz-Arab-AF');
	}

	/** Compute ROC (zh-TW) calendar years. */
	static calendarYearsOfTaiwanRoc(): Array<CalendarYear> {
		return DataMoveTestHelper.computeCalendarYearsAndMonths('zh-TW');
	}
}
