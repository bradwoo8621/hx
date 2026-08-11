import type {HxDateTimeValue, HxDateWeekendDay} from '../../../types';
import {UTCDate} from '../facade';

export type HxDate = Required<Pick<HxDateTimeValue, 'year' | 'month' | 'day'>>;

export type HxDateTimeFormatCalendar =
	| 'buddhist' // Thai Buddhist calendar (B.E.)
	| 'chinese' // Chinese lunar calendar
	| 'coptic' // Coptic calendar, Egypt
	| 'dangi' // Dangi calendar, Korea (lunar variant)
	| 'ethioaa' // Ethiopic Amete Alem (epoch follows Alexandrian)
	| 'ethiopic' // Ethiopic Amete Mihret
	| 'gregory' // Gregorian calendar
	| 'hebrew' // Hebrew calendar, Israel
	| 'indian' // Indian national calendar (Saka)
	| 'islamic' // Islamic calendar, Algeria / Morocco / Tunisia
	| 'islamic-civil' // Islamic civil (tabular), Lebanon / Syria / Iraq / Gulf states
	| 'islamic-umalqura' // Umm al-Qura calendar, Saudi Arabia
	| 'islamic-tbla' // Islamic astronomical calendar
	| 'islamic-rgsa' // Islamic calendar based on Saudia Arabia sighting
	| 'iso8601' // ISO 8601 (Gregorian variant)
	| 'japanese' // Japanese Imperial calendar (era-based)
	| 'persian' // Persian solar calendar, Iran / Afghanistan
	| 'roc' // Minguo calendar, Taiwan
	| string; // And others
export type HxFormattedEra = string;
export type HxFormattedYear = string;
export type HxFormattedMonth = string;
export type HxFormattedDay = string;
export type HxFormattedWeekday = string;
// starts from Sunday
export type HxFormattedWeekdays = Array<HxFormattedWeekday>;

export interface ComputedWeek {
	week: Array<{
		key: HxDateWeekendDay;
		label: string;
		weekend: boolean;
	}>;
	// follow JS Date's date value
	weekends: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>;
}

export interface ComputedDay {
	key: string; // y-m-d in numbers
	label: string;
	weekend: boolean;
	value: UTCDate;
	thisMonth: boolean;
}

export type ComputedDays = Array<ComputedDay>;

export interface ComputedMonth {
	key: string; // y-m-1 in numbers
	label: string;
	value: UTCDate;
	offset: number;
	bc: boolean;
	y10k: boolean;
}

export type ComputedMonths = Array<ComputedMonth>;

export interface ComputedYear {
	key: string; // y-1-1 in numbers
	label: string;
	value: UTCDate;
	offset: number;
	available: boolean;
}

export type ComputedYears = Array<ComputedYear>;
