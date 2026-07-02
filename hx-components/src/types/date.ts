/**
 * y: 4 digits year
 * m: 2 digits month
 * d: 2 digits day
 * h: 2 digits hour
 * n: 2 digits minute
 * s: 2 digits second
 * any other chars will be kept as is
 */
export type HxDateFormat = string;
/**
 * y: 4 digits year
 * m: 2 digits month
 * d: 2 digits day
 * hns: not allowed
 * any other chars will be kept as is
 */
export type HxTimeFormat = string;
/**
 * ymd: not allowed
 * h: 2 digits hour
 * n: 2 digits minute
 * s: 2 digits second
 * any other chars will be kept as is
 */
export type HxDateTimeFormat = string;

export type HxDateTimeRelatedFormat = HxDateFormat | HxTimeFormat | HxDateTimeFormat;

export type HxDateTimeFormatDataChar = 'y' | 'm' | 'd' | 'h' | 'n' | 's';
export type HxDateTimeFormatFixedChar = string;

export interface HxParsedDateTimeFormat {
	// date part
	hasYear: boolean;
	hasMonth: boolean;
	hasDay: boolean;
	hasDate: boolean;
	// time part
	hasHour: boolean;
	hasMinute: boolean;
	hasSecond: boolean;
	hasTime: boolean;
	sequence: Array<HxDateTimeFormatDataChar | HxDateTimeFormatFixedChar>;
}

export interface HxDateTimeValue {
	/** 0 - 9999 */
	year?: number;
	/** 0 - 99, starts from 1 */
	month?: number;
	/** 0 - 99 */
	day?: number;
	/** 0 - 99 */
	hour?: number;
	/** 0 - 99 */
	minute?: number;
	/** 0 - 99 */
	second?: number;
}

export type HxDateFirstDayOfWeek = 'sun' | 'mon';
