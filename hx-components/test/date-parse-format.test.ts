import {describe, expect, it} from 'vitest';
import {DateUtils} from '../src';

describe('DateUtils.parseFormat', () => {
	it('returns empty result for null', () => {
		const result = DateUtils.parseFormat(null as never);
		expect(result.hasYear).toBe(false);
		expect(result.hasMonth).toBe(false);
		expect(result.hasDay).toBe(false);
		expect(result.hasDate).toBe(false);
		expect(result.hasHour).toBe(false);
		expect(result.hasMinute).toBe(false);
		expect(result.hasSecond).toBe(false);
		expect(result.hasTime).toBe(false);
		expect(result.sequence).toEqual([]);
	});

	it('returns empty result for empty string', () => {
		const result = DateUtils.parseFormat('');
		expect(result.hasDate).toBe(false);
		expect(result.hasTime).toBe(false);
		expect(result.sequence).toEqual([]);
	});

	it('parses date-only format y-m-d', () => {
		const result = DateUtils.parseFormat('y-m-d');
		expect(result.hasYear).toBe(true);
		expect(result.hasMonth).toBe(true);
		expect(result.hasDay).toBe(true);
		expect(result.hasDate).toBe(true);
		expect(result.hasTime).toBe(false);
		expect(result.sequence).toEqual(['y', '-', 'm', '-', 'd']);
	});

	it('parses time-only format h:n:s', () => {
		const result = DateUtils.parseFormat('h:n:s');
		expect(result.hasHour).toBe(true);
		expect(result.hasMinute).toBe(true);
		expect(result.hasSecond).toBe(true);
		expect(result.hasDate).toBe(false);
		expect(result.hasTime).toBe(true);
		expect(result.sequence).toEqual(['h', ':', 'n', ':', 's']);
	});

	it('parses datetime format y-m-d h:n:s', () => {
		const result = DateUtils.parseFormat('y-m-d h:n:s');
		expect(result.hasDate).toBe(true);
		expect(result.hasTime).toBe(true);
		expect(result.sequence).toEqual(['y', '-', 'm', '-', 'd', ' ', 'h', ':', 'n', ':', 's']);
	});

	it('parses format with only month and year', () => {
		const result = DateUtils.parseFormat('y-m');
		expect(result.hasYear).toBe(true);
		expect(result.hasMonth).toBe(true);
		expect(result.hasDay).toBe(false);
		expect(result.hasDate).toBe(true);
		expect(result.sequence).toEqual(['y', '-', 'm']);
	});

	it('parses hour-only time format', () => {
		const result = DateUtils.parseFormat('h');
		expect(result.hasHour).toBe(true);
		expect(result.hasMinute).toBe(false);
		expect(result.hasSecond).toBe(false);
		expect(result.hasTime).toBe(true);
		expect(result.sequence).toEqual(['h']);
	});

	it('preserves arbitrary separators in sequence', () => {
		const result = DateUtils.parseFormat('y/m/d');
		expect(result.sequence).toEqual(['y', '/', 'm', '/', 'd']);
	});

	it('preserves Chinese separators in sequence', () => {
		const result = DateUtils.parseFormat('y年m月d日');
		expect(result.sequence).toEqual(['y', '年', 'm', '月', 'd', '日']);
	});
});
