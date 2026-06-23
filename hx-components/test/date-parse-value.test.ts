import {describe, expect, it} from 'vite-plus/test';
import type {HxParsedDateTimeFormat} from '../src';
import {DateUtils} from '../src';

const fmt = (format: string): HxParsedDateTimeFormat => DateUtils.parseFormat(format);

describe('DateUtils.parseValue', () => {
	describe('null / empty input', () => {
		it('returns false for null', () => {
			expect(DateUtils.parseValue(null as never, fmt('y-m-d'))).toBe(false);
		});

		it('returns false for undefined', () => {
			expect(DateUtils.parseValue(undefined as never, fmt('y-m-d'))).toBe(false);
		});

		it('returns false for empty string', () => {
			expect(DateUtils.parseValue('', fmt('y-m-d'))).toBe(false);
		});

		it('returns false for blank string', () => {
			expect(DateUtils.parseValue('   ', fmt('y-m-d'))).toBe(false);
		});
	});

	describe('date parsing (y-m-d)', () => {
		const format = fmt('y-m-d');

		it('parses standard date with hyphens', () => {
			expect(DateUtils.parseValue('2026-06-11', format)).toEqual({
				year: '2026', month: '06', day: '11'
			});
		});

		it('parses with slash separators', () => {
			expect(DateUtils.parseValue('2026/06/11', format)).toEqual({
				year: '2026', month: '06', day: '11'
			});
		});

		it('parses single-digit month and day', () => {
			expect(DateUtils.parseValue('2026/6/1', format)).toEqual({
				year: '2026', month: '6', day: '1'
			});
		});

		it('parses without any separators', () => {
			expect(DateUtils.parseValue('20260611', format)).toEqual({
				year: '2026', month: '06', day: '11'
			});
		});

		it('greedily extracts: year 4, month 2, day remainder', () => {
			expect(DateUtils.parseValue('2026611', format)).toEqual({
				year: '2026', month: '61', day: '1'
			});
		});

		it('parses with Chinese separators', () => {
			const cnFormat = fmt('y年m月d日');
			expect(DateUtils.parseValue('2026年06月11日', cnFormat)).toEqual({
				year: '2026', month: '06', day: '11'
			});
		});

		it('year takes exactly 4 digits, month and day up to 2', () => {
			expect(DateUtils.parseValue('2026061', format)).toEqual({
				year: '2026', month: '06', day: '1'
			});
		});
	});

	describe('time parsing (h:n:s)', () => {
		const format = fmt('h:n:s');

		it('parses standard time with colons', () => {
			expect(DateUtils.parseValue('14:30:00', format)).toEqual({
				hour: '14', minute: '30', second: '00'
			});
		});

		it('parses time without separators', () => {
			expect(DateUtils.parseValue('143000', format)).toEqual({
				hour: '14', minute: '30', second: '00'
			});
		});

		it('parses single-digit hour', () => {
			expect(DateUtils.parseValue('9:30:00', format)).toEqual({
				hour: '9', minute: '30', second: '00'
			});
		});
	});

	describe('datetime parsing (y-m-d h:n:s)', () => {
		const format = fmt('y-m-d h:n:s');

		it('parses full datetime', () => {
			expect(DateUtils.parseValue('2026-06-11 14:30:00', format)).toEqual({
				year: '2026', month: '06', day: '11',
				hour: '14', minute: '30', second: '00'
			});
		});

		it('parses datetime with T separator', () => {
			expect(DateUtils.parseValue('2026-06-11T14:30:00', format)).toEqual({
				year: '2026', month: '06', day: '11',
				hour: '14', minute: '30', second: '00'
			});
		});
	});

	describe('partial formats', () => {
		it('parses year-month only', () => {
			expect(DateUtils.parseValue('2026-06', fmt('y-m'))).toEqual({
				year: '2026', month: '06'
			});
		});

		it('parses hour-minute only', () => {
			expect(DateUtils.parseValue('14:30', fmt('h:n'))).toEqual({
				hour: '14', minute: '30'
			});
		});

		it('parses year only', () => {
			expect(DateUtils.parseValue('2026', fmt('y'))).toEqual({
				year: '2026'
			});
		});
	});

	describe('missing components', () => {
		it('returns false when day is missing', () => {
			expect(DateUtils.parseValue('2026-06', fmt('y-m-d'))).toBe(false);
		});

		it('returns false when year is missing', () => {
			expect(DateUtils.parseValue('06-11', fmt('y-m-d'))).toBe(false);
		});

		it('returns false when month is missing', () => {
			expect(DateUtils.parseValue('2026--11', fmt('y-m-d'))).toBe(false);
		});
	});

	describe('partial match allowed', () => {
		it('parses date without day', () => {
			expect(DateUtils.parseValue('2026-06', fmt('y-m-d'), true)).toEqual({
				year: '2026', month: '06'
			});
		});

		it('parses date without month and day', () => {
			expect(DateUtils.parseValue('2026', fmt('y-m-d'), true)).toEqual({
				year: '2026'
			});
		});

		it('parses datetime without time part', () => {
			expect(DateUtils.parseValue('2026-06-11', fmt('y-m-d h:n:s'), true)).toEqual({
				year: '2026', month: '06', day: '11'
			});
		});

		it('parses time without seconds', () => {
			expect(DateUtils.parseValue('14:30', fmt('h:n:s'), true)).toEqual({
				hour: '14', minute: '30'
			});
		});

		it('parses time without minutes and seconds', () => {
			expect(DateUtils.parseValue('14', fmt('h:n:s'), true)).toEqual({
				hour: '14'
			});
		});

		it('parses date skipping mid component', () => {
			expect(DateUtils.parseValue('2026--11', fmt('y-m-d'), true)).toEqual({
				year: '2026', day: '11'
			});
		});

		it('trailing digits still fail', () => {
			expect(DateUtils.parseValue('2026-06-11 123', fmt('y-m-d'), true)).toBe(false);
		});
	});

	describe('trailing characters', () => {
		it('rejects trailing text characters', () => {
			expect(DateUtils.parseValue('2026-06-11extra', fmt('y-m-d'))).toEqual(false);
		});

		it('returns false when trailing characters contain digits', () => {
			expect(DateUtils.parseValue('2026-06-11 123', fmt('y-m-d'))).toBe(false);
		});

		it('returns false for value with extra numeric component', () => {
			expect(DateUtils.parseValue('2026-06-11-12', fmt('y-m-d'))).toBe(false);
		});
	});

	describe('timezone handling', () => {
		it('Z suffix is silently ignored (non-digit trailing)', () => {
			expect(DateUtils.parseValue('2026-06-11T14:30:00Z', fmt('y-m-d h:n:s'))).toEqual({
				year: '2026', month: '06', day: '11',
				hour: '14', minute: '30', second: '00'
			});
		});

		it('timezone offset +HH:MM fails (trailing digits)', () => {
			expect(DateUtils.parseValue('2026-06-11T14:30:00+08:00', fmt('y-m-d h:n:s'))).toBe(false);
		});

		it('timezone offset -HH:MM fails (trailing digits)', () => {
			expect(DateUtils.parseValue('2026-06-11T14:30:00-05:00', fmt('y-m-d h:n:s'))).toBe(false);
		});

		it('Z suffix on date-only string is silently ignored', () => {
			expect(DateUtils.parseValue('2026-06-11Z', fmt('y-m-d'))).toEqual({
				year: '2026', month: '06', day: '11'
			});
		});

		it('rejects UTC text suffix', () => {
			expect(DateUtils.parseValue('14:30:00 UTC', fmt('h:n:s'))).toEqual(false);
		});

		it('rejects timezone abbreviation like CST', () => {
			expect(DateUtils.parseValue('14:30:00 CST', fmt('h:n:s'))).toEqual(false);
		});

		it('trailing timezone with plus-minus offset fails', () => {
			expect(DateUtils.parseValue('14:30 GMT+8', fmt('h:n'))).toBe(false);
		});
	});
});
