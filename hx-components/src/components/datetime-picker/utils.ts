import type {HxDateTimeRelatedFormat, HxParsedDateTimeFormat} from '../../types';
import {DateUtils, type HxParsedDataTime} from '../../utils';
import {HxFormatInputDateTimePatternParser} from '../format-input';
import type {HxDateTimePickerDisplayFormat, HxDateTimePickerDisplayFormatFunc} from './types';

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
				parts = DateUtils.parseFormat(availableParts.trim());
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
					return value.format(f);
				}
			},
			parts
		];
	} else {
		const parts = DateUtils.parseFormat(availableParts?.trim() || defaultAvailableParts);
		// @ts-expect-error sequence is useless, delete it
		delete parts.sequence;
		return [format, parts];
	}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseModelValue = (value: any, valueFormat: HxParsedDateTimeFormat): false | HxParsedDataTime => {
	if (typeof value === 'string') {
		return DateUtils.parseValue(value, valueFormat);
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
