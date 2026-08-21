import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type {RefObject} from 'react';
import type {HxDateTimeRelatedFormat, HxParsedDateTimeFormat} from '../../types';
import {DateParseUtils, type HxParsedDataTime} from '../../utils';
import {type HxFormatInputDateTimePattern, HxFormatInputDateTimePatternParser} from '../format-input';
import type {HxDateTimePickerDisplayFormat, HxDateTimePickerDisplayFormatFunc} from './types';

dayjs.extend(utc);

/**
 * Convert a display format into a tuple of [format function, available parts].
 *
 * Handles three format types:
 * - `HxFormatInputDateTimePattern` (e.g. `@d/ymd :hns`): auto-detects available parts from the pattern,
 *   converts to a dayjs format function.
 * - dayjs format string (e.g. `YYYY-MM-DD HH:mm:ss`): auto-detects available parts from format tokens
 *   unless `availableParts` is explicitly provided; wraps in a `dayjs.format()` function.
 * - Function: uses as-is; `availableParts` is required in this case.
 *
 * @param format - the display format to convert
 * @param availableParts - explicit available parts definition; used for function formats,
 *   overrides auto-detection for dayjs strings
 * @param defaultAvailableParts - fallback when `availableParts` is not set for function formats
 * @returns a tuple of `[formatFunc, parts]`
 */
export const displayFormatToFunc = (
	format: HxDateTimePickerDisplayFormat,
	availableParts: HxDateTimeRelatedFormat | null | undefined, defaultAvailableParts: HxDateTimeRelatedFormat
): [HxDateTimePickerDisplayFormatFunc, Omit<HxParsedDateTimeFormat, 'sequence'>] => {
	// format is hx format or dayjs format
	if (typeof format === 'string') {
		const parsed = HxFormatInputDateTimePatternParser.parse(format);
		let f: string;
		let parts: Omit<HxParsedDateTimeFormat, 'sequence'> = {
			hasYear: false,
			hasMonth: false,
			hasDay: false,
			hasDate: false,
			hasHour: false,
			hasMinute: false,
			hasSecond: false,
			hasTime: false
		};
		if (parsed === false) {
			// dayjs format
			f = format;
			if (availableParts == null || availableParts.trim().length === 0) {
				parts.hasYear = format.indexOf('Y') != -1;
				parts.hasMonth = format.indexOf('M') != -1;
				parts.hasDay = format.indexOf('D') != -1 || format.indexOf('d') != -1;
				parts.hasDate = parts.hasYear || parts.hasMonth || parts.hasDay;
				parts.hasHour = format.indexOf('H') != -1 || format.indexOf('h') != -1;
				parts.hasMinute = format.indexOf('m') != -1;
				parts.hasSecond = format.indexOf('s') != -1;
				parts.hasTime = parts.hasHour || parts.hasMinute || parts.hasSecond;
			} else {
				parts = DateParseUtils.parseFormat(availableParts.trim());
				// @ts-expect-error sequence is useless, delete it
				delete parts.sequence;
			}
		} else {
			// hx display format
			const ymd: Array<string> = [];
			if (parsed.year != null && parsed.year >= 0) {
				ymd.push('YYYY');
				parts.hasYear = true;
				parts.hasDate = true;
			}
			if (parsed.month != null && parsed.month >= 0) {
				ymd.push('MM');
				parts.hasMonth = true;
				parts.hasDate = true;
			}
			if (parsed.day != null && parsed.day >= 0) {
				ymd.push('DD');
				parts.hasDay = true;
				parts.hasDate = true;
			}
			const hns: Array<string> = [];
			if (parsed.hour != null && parsed.hour >= 0) {
				hns.push('HH');
				parts.hasHour = true;
				parts.hasTime = true;
			}
			if (parsed.minute != null && parsed.minute >= 0) {
				hns.push('mm');
				parts.hasMinute = true;
				parts.hasTime = true;
			}
			if (parsed.second != null && parsed.second >= 0) {
				hns.push('ss');
				parts.hasSecond = true;
				parts.hasTime = true;
			}
			if (ymd.length > 0 && hns.length > 0) {
				f = ymd.join(parsed.dateSeparator || '') + (parsed.groupSeparator ? ' ' : '') + hns.join(parsed.timeSeparator || '');
			} else if (ymd.length > 0) {
				f = ymd.join(parsed.dateSeparator || '');
			} else if (hns.length > 0) {
				f = hns.join(parsed.timeSeparator || '');
			} else {
				// guard, never happen
				f = format;
			}
		}
		return [
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			(value, _context) => {
				if (value == null) {
					return (void 0);
				} else {
					return dayjs.utc(value.cloneAsJsDate()).format(f);
				}
			},
			parts
		];
	}
	// format is function
	else {
		const parts = DateParseUtils.parseFormat(availableParts?.trim() || defaultAvailableParts);
		// @ts-expect-error sequence is useless, delete it
		delete parts.sequence;
		return [format, parts];
	}
};

const computeFallbackPattern = (parts: Omit<HxParsedDateTimeFormat, 'sequence'>, concatenationCharsEvidence: string): HxFormatInputDateTimePattern => {
	const arr = ['@d'];
	if (parts.hasDate) {
		// check / or -
		if (concatenationCharsEvidence.includes('/')) {
			arr.push('/');
		} else if (concatenationCharsEvidence.includes('-')) {
			arr.push('-');
		}
		if (parts.hasYear) {
			arr.push('y');
		}
		if (parts.hasMonth) {
			arr.push('m');
		}
		if (parts.hasDay) {
			arr.push('d');
		}
	}
	if (parts.hasDate && parts.hasTime) {
		if (concatenationCharsEvidence.includes(' ')) {
			arr.push(' ');
		}
	}
	if (parts.hasTime) {
		if (concatenationCharsEvidence.includes(':')) {
			arr.push(':');
		}
		if (parts.hasHour) {
			arr.push('h');
		}
		if (parts.hasMinute) {
			arr.push('n');
		}
		if (parts.hasSecond) {
			arr.push('s');
		}
	}
	return arr.join('') as HxFormatInputDateTimePattern;
};
export const fallbackPattern = (
	format: HxDateTimePickerDisplayFormat, parts: Omit<HxParsedDateTimeFormat, 'sequence'>,
	availableParts: HxDateTimeRelatedFormat | null | undefined, defaultAvailableParts: HxDateTimeRelatedFormat
): HxFormatInputDateTimePattern => {
	let pattern: HxFormatInputDateTimePattern;
	const typeOfDisplayFormat = typeof format;
	// display format is pattern for format datetime input
	if (typeOfDisplayFormat === 'string' && (format as string).startsWith('@d')) {
		pattern = format as HxFormatInputDateTimePattern;
	}
	// display format is function
	else if (typeOfDisplayFormat === 'function') {
		pattern = computeFallbackPattern(parts, availableParts?.trim() || defaultAvailableParts);
	}
	// display format is dayjs format
	else {
		pattern = computeFallbackPattern(parts, format as string);
	}

	return pattern;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseModelValue = (value: any, valueFormat: HxParsedDateTimeFormat): false | HxParsedDataTime => {
	if (typeof value === 'string') {
		return DateParseUtils.parseValue(value, valueFormat);
	} else if (value instanceof Date) {
		return {
			year: String(value.getFullYear()),
			month: String(value.getMonth() + 1),
			day: String(value.getDate()),
			hour: String(value.getHours()),
			minute: String(value.getMinutes()),
			second: String(value.getSeconds())
		};
	} else {
		return false;
	}
};

export const initYearsMonthsPanelHeight = (divRef: RefObject<HTMLDivElement>) => {
	const div = divRef.current;
	if (div == null) {
		return;
	}

	const parent = div.parentElement! as HTMLDivElement;

	const headerPanel = parent.querySelector(':scope > div[data-hx-dtp-panel-header]')! as HTMLDivElement;
	const {height: headerHeight} = headerPanel.getBoundingClientRect();
	div.style.setProperty('--header-height', headerHeight + 'px');

	const daysPanel = parent.querySelector(':scope > div[data-hx-dtp-panel-days]')! as HTMLDivElement;
	const {height: daysHeight} = daysPanel.getBoundingClientRect();
	div.style.setProperty('--days-panel-height', daysHeight + 'px');

	const timePanel = parent.querySelector(':scope > div[data-hx-dtp-panel-time]') as HTMLDivElement | null;
	if (timePanel != null) {
		const {height: timeHeight} = timePanel.getBoundingClientRect();
		div.style.setProperty('--time-panel-height', timeHeight + 'px');
	} else {
		// keep the unit px to make sure calculation works in CSS
		div.style.setProperty('--time-panel-height', '0px');
	}
};
