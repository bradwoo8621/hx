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

/**
 * Grammar: [y{N}][m{N}][d{N}][h{N}][n{N}][s{N}]
 * Each optional part specifies a default value for the corresponding component.
 * N range (inclusive): minimum 0; maximum bounded by digit width and logical limit:
 *   y: 0–9999, m: 0–12, d: 0–31, h: 0–23, n: 0–59, s: 0–59
 * Values outside range are not rejected:
 *  - negative becomes 0,
 *  - above-maximum is truncated to fit the component's digit width
 * The part char [ymdhns], is case-insensitive.
 */
export type HxDateTimeDefaultValuesInStr = string;

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
