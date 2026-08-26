import {describe, expect, it} from 'vitest';
import {DateParseUtils, UTCDate} from '../src';
import {displayFormatToFunc, fallbackPattern, parseModelValue} from '../src/components/datetime-picker/utils';

const DEFAULT_PARTS = 'y/m/d h:n:s';
const NO_PARTS = {
	hasYear: false,
	hasMonth: false,
	hasDay: false,
	hasDate: false,
	hasHour: false,
	hasMinute: false,
	hasSecond: false,
	hasTime: false
};
const YMD_PARTS = {
	...NO_PARTS,
	hasYear: true, hasMonth: true, hasDay: true, hasDate: true
};
const HNS_PARTS = {
	...NO_PARTS,
	hasHour: true, hasMinute: true, hasSecond: true, hasTime: true
};
const FULL_PARTS = {
	...NO_PARTS,
	hasYear: true, hasMonth: true, hasDay: true, hasDate: true,
	hasHour: true, hasMinute: true, hasSecond: true, hasTime: true
};
const fmt = (format: string) => DateParseUtils.parseFormat(format);

describe('displayFormatToFunc', () => {
	describe('hx pattern (@d...)', () => {
		it('date with slash separators', () => {
			const [format, parts] = displayFormatToFunc('@d/ymd', (void 0), DEFAULT_PARTS);
			expect(parts).toEqual(YMD_PARTS);
			expect(format(UTCDate.of(2024, 5, 10))).toBe('2024/06/10');
		});

		it('date with dash separators', () => {
			const [format, parts] = displayFormatToFunc('@d-ymd', (void 0), DEFAULT_PARTS);
			expect(parts).toEqual(YMD_PARTS);
			expect(format(UTCDate.of(2024, 5, 10))).toBe('2024-06-10');
		});

		it('datetime with group and time separators', () => {
			const [format, parts] = displayFormatToFunc('@d/ymd :hns', (void 0), DEFAULT_PARTS);
			expect(parts).toEqual(FULL_PARTS);
			expect(format(UTCDate.of(2024, 5, 10, 14, 30, 0))).toBe('2024/06/10 14:30:00');
		});

		it('time with hours and minutes only', () => {
			const [format, parts] = displayFormatToFunc('@d:hn', (void 0), DEFAULT_PARTS);
			expect(parts).toEqual({...NO_PARTS, hasHour: true, hasMinute: true, hasTime: true});
			expect(format(UTCDate.of(2024, 5, 10, 14, 30, 0))).toBe('14:30');
		});

		it('year only', () => {
			const [, parts] = displayFormatToFunc('@dy', (void 0), DEFAULT_PARTS);
			expect(parts).toEqual({...NO_PARTS, hasYear: true, hasDate: true});
		});

		it('returns undefined for a null value', () => {
			const [format] = displayFormatToFunc('@d/ymd', (void 0), DEFAULT_PARTS);
			expect(format((void 0))).toBe((void 0));
		});
	});

	describe('dayjs format string', () => {
		it('auto-detects ymd parts', () => {
			const [format, parts] = displayFormatToFunc('YYYY-MM-DD', (void 0), DEFAULT_PARTS);
			expect(parts).toEqual(YMD_PARTS);
			expect(format(UTCDate.of(2024, 5, 10))).toBe('2024-06-10');
		});

		it('auto-detects time parts', () => {
			const [format, parts] = displayFormatToFunc('HH:mm:ss', (void 0), DEFAULT_PARTS);
			expect(parts).toEqual(HNS_PARTS);
			expect(format(UTCDate.of(2024, 5, 10, 14, 30, 0))).toBe('14:30:00');
		});

		it('detects lowercase h for 12-hour formats', () => {
			const [, parts] = displayFormatToFunc('h:mm a', (void 0), DEFAULT_PARTS);
			expect(parts).toEqual({...NO_PARTS, hasHour: true, hasMinute: true, hasTime: true});
		});

		it('detects M as month, not minute', () => {
			const [format, parts] = displayFormatToFunc('YYYY-MM', (void 0), DEFAULT_PARTS);
			expect(parts).toEqual({...NO_PARTS, hasYear: true, hasMonth: true, hasDate: true});
			expect(format(UTCDate.of(2024, 5, 10))).toBe('2024-06');
		});

		it('year only', () => {
			const [, parts] = displayFormatToFunc('YYYY', (void 0), DEFAULT_PARTS);
			expect(parts).toEqual({...NO_PARTS, hasYear: true, hasDate: true});
		});

		it('explicit availableParts overrides auto-detection', () => {
			const [, parts] = displayFormatToFunc('YYYY-MM-DD HH:mm:ss', 'y/m/d', DEFAULT_PARTS);
			expect(parts).toEqual(YMD_PARTS);
		});
	});

	describe('format function', () => {
		const fn = (value?: UTCDate) => value == null ? (void 0) : String(value.getFullYear());

		it('uses availableParts when given', () => {
			const [format, parts] = displayFormatToFunc(fn, 'y/m/d', DEFAULT_PARTS);
			expect(format).toBe(fn);
			expect(parts).toEqual(YMD_PARTS);
			expect(format(UTCDate.of(1980, 0, 1))).toBe('1980');
		});

		it('falls back to the default parts when availableParts is empty', () => {
			const [, parts] = displayFormatToFunc(fn, '  ', DEFAULT_PARTS);
			expect(parts).toEqual(FULL_PARTS);
		});
	});
});

describe('fallbackPattern', () => {
	it('passes through hx patterns verbatim', () => {
		expect(fallbackPattern('@d:hns', NO_PARTS, (void 0), DEFAULT_PARTS)).toBe('@d:hns');
	});

	it('derives a time-only pattern from a dayjs time format', () => {
		const [, parts] = displayFormatToFunc('HH:mm:ss', (void 0), DEFAULT_PARTS);
		expect(fallbackPattern('HH:mm:ss', parts, (void 0), DEFAULT_PARTS)).toBe('@d:hns');
	});

	it('hours and minutes only', () => {
		const [, parts] = displayFormatToFunc('HH:mm', (void 0), DEFAULT_PARTS);
		expect(fallbackPattern('HH:mm', parts, (void 0), DEFAULT_PARTS)).toBe('@d:hn');
	});

	it('year-month with dash separator', () => {
		const [, parts] = displayFormatToFunc('YYYY-MM', (void 0), DEFAULT_PARTS);
		expect(fallbackPattern('YYYY-MM', parts, (void 0), DEFAULT_PARTS)).toBe('@d-ym');
	});

	it('year-month with slash separator', () => {
		const [, parts] = displayFormatToFunc('YYYY/MM', (void 0), DEFAULT_PARTS);
		expect(fallbackPattern('YYYY/MM', parts, (void 0), DEFAULT_PARTS)).toBe('@d/ym');
	});

	it('year only', () => {
		const [, parts] = displayFormatToFunc('YYYY', (void 0), DEFAULT_PARTS);
		expect(fallbackPattern('YYYY', parts, (void 0), DEFAULT_PARTS)).toBe('@dy');
	});

	it('month-day plus hours-minutes keeps both separators', () => {
		const [, parts] = displayFormatToFunc('MM-DD HH:mm', (void 0), DEFAULT_PARTS);
		expect(fallbackPattern('MM-DD HH:mm', parts, (void 0), DEFAULT_PARTS)).toBe('@d-md :hn');
	});

	it('function formats derive the pattern from availableParts', () => {
		const fn = (value?: UTCDate) => value == null ? (void 0) : String(value.getFullYear());
		const [, timeParts] = displayFormatToFunc(fn, 'h:n:s', DEFAULT_PARTS);
		expect(fallbackPattern(fn, timeParts, 'h:n:s', DEFAULT_PARTS)).toBe('@d:hns');
		const [, dateParts] = displayFormatToFunc(fn, 'y/m', DEFAULT_PARTS);
		expect(fallbackPattern(fn, dateParts, 'y/m', DEFAULT_PARTS)).toBe('@d/ym');
	});
});

describe('parseModelValue', () => {
	it('parses a datetime string', () => {
		expect(parseModelValue('2024/06/10 14:30:00', fmt('y/m/d h:n:s'))).toEqual({
			year: '2024', month: '06', day: '10', hour: '14', minute: '30', second: '00'
		});
	});

	it('parses a date-only string', () => {
		expect(parseModelValue('2024-06-10', fmt('y-m-d'))).toEqual({
			year: '2024', month: '06', day: '10'
		});
	});

	it('parses a Date instance without zero padding', () => {
		expect(parseModelValue(new Date(2024, 5, 10, 14, 30, 0), fmt('y/m/d h:n:s'))).toEqual({
			year: '2024', month: '6', day: '10', hour: '14', minute: '30', second: '0'
		});
	});

	it('returns false for null', () => {
		expect(parseModelValue(null, fmt('y-m-d'))).toBe(false);
	});

	it('returns false for undefined', () => {
		expect(parseModelValue((void 0), fmt('y-m-d'))).toBe(false);
	});

	it('returns false for an empty string', () => {
		expect(parseModelValue('', fmt('y-m-d'))).toBe(false);
	});

	it('returns false for numbers and plain objects', () => {
		expect(parseModelValue(123, fmt('y-m-d'))).toBe(false);
		expect(parseModelValue({}, fmt('y-m-d'))).toBe(false);
	});
});
