import {beforeEach, describe, expect, it, vi} from 'vitest';
import {HxFmt, type HxFormatFunc, HxFormatSettings, HxLanguageContext} from '../src';

describe('HxFormatSettings (HxFmt)', () => {
	// Clear custom formats and cache before each test
	beforeEach(() => {
		// Reset language context
		vi.spyOn(HxLanguageContext, 'current').mockReturnValue('en');
		vi.spyOn(HxLanguageContext, 'parentOf').mockImplementation((code) => {
			if (code === 'zh-CN') return 'zh';
			if (code === 'zh') return undefined;
			return undefined;
		});

		// Clear custom formats and cache
		// @ts-expect-error Access private property for testing
		HxFormatSettings.CustomMap.clear();
		// @ts-expect-error Access private property for testing
		HxFormatSettings.CacheMap.clear();
	});

	describe('Predefined number formatting', () => {
		it('nf0 format: 0 decimal places with thousands separator', () => {
			expect(HxFmt.format(123456.789, undefined, 'nf0')).toBe('123,457');
			expect(HxFmt.format('123456.789', undefined, 'nf0')).toBe('123,457');
			expect(HxFmt.format(0, undefined, 'nf0')).toBe('0');
			expect(HxFmt.format(-1234.5, undefined, 'nf0')).toBe('-1,235');
		});

		it('nf2 format: 2 decimal places with thousands separator', () => {
			expect(HxFmt.format(123456.789, undefined, 'nf2')).toBe('123,456.79');
			expect(HxFmt.format('123456.789', undefined, 'nf2')).toBe('123,456.79');
			expect(HxFmt.format(0, undefined, 'nf2')).toBe('0.00');
			expect(HxFmt.format(1.2, undefined, 'nf2')).toBe('1.20');
		});

		it('nf6 format: 6 decimal places with thousands separator', () => {
			expect(HxFmt.format(123.456789123, undefined, 'nf6')).toBe('123.456789');
			expect(HxFmt.format(123.4, undefined, 'nf6')).toBe('123.400000');
		});

		it('ng format: thousands separator only, no fixed decimal places', () => {
			expect(HxFmt.format(123456.789, undefined, 'ng')).toBe('123,456.789');
			expect(HxFmt.format(123456, undefined, 'ng')).toBe('123,456');
			expect(HxFmt.format(0.123456, undefined, 'ng')).toBe('0.123456');
		});

		it('handles non-numeric values in number formatting', () => {
			expect(HxFmt.format(null, undefined, 'nf2')).toBe('');
			expect(HxFmt.format(undefined, undefined, 'nf2')).toBe('');
			expect(HxFmt.format('not a number', undefined, 'nf2')).toBe('not a number');
			expect(HxFmt.format(true, undefined, 'nf2')).toBe('true');
			expect(HxFmt.format(false, undefined, 'nf2')).toBe('false');
			expect(HxFmt.format({key: 'value'}, undefined, 'nf2')).toBe('{"key":"value"}');
			expect(HxFmt.format(() => 'test', undefined, 'nf2')).toBe('() => "test"');
		});
	});

	describe('Predefined date/time formatting', () => {
		const testDate = new Date('2023-10-15T14:30:45Z');
		const testTimestamp = testDate.getTime();

		it('df format: date format YYYY-MM-DD', () => {
			// Date object
			expect(HxFmt.format(testDate, undefined, 'df')).toBe('2023-10-15');
			// Date string
			expect(HxFmt.format('2023-10-15T14:30:45', undefined, 'df')).toBe('2023-10-15');
			expect(HxFmt.format('2023-10-15T14:30:45Z', undefined, 'df')).toBe('2023-10-15');
			expect(HxFmt.format('2023-10-15T14:30:45-07:00', undefined, 'df')).toBe('2023-10-15');
			expect(HxFmt.format('2023-10-15T14:30:45+05:00', undefined, 'df')).toBe('2023-10-15');
			// Numeric timestamp
			expect(HxFmt.format(testTimestamp, undefined, 'df')).toBe('1697380245000');
		});

		it('tf format: time format HH:mm:ss', () => {
			expect(HxFmt.format(testDate, undefined, 'tf')).toBe('22:30:45');
			expect(HxFmt.format('2023-10-15T14:30:45', undefined, 'tf')).toBe('14:30:45');
			expect(HxFmt.format('2023-10-15T14:30:45Z', undefined, 'tf')).toBe('14:30:45');
			expect(HxFmt.format('2023-10-15T14:30:45-07:00', undefined, 'tf')).toBe('14:30:45');
			expect(HxFmt.format('2023-10-15T14:30:45+05:00', undefined, 'tf')).toBe('14:30:45');
			expect(HxFmt.format(testTimestamp, undefined, 'tf')).toBe('1697380245000');
		});

		it('dtf format: date time format YYYY-MM-DD HH:mm:ss', () => {
			expect(HxFmt.format(testDate, undefined, 'dtf')).toBe('2023-10-15 22:30:45');
			expect(HxFmt.format('2023-10-15 14:30:45', undefined, 'dtf')).toBe('2023-10-15 14:30:45');
			expect(HxFmt.format('2023-10-15 14:30:45Z', undefined, 'dtf')).toBe('2023-10-15 14:30:45');
			expect(HxFmt.format('2023-10-15T14:30:45-07:00', undefined, 'dtf')).toBe('2023-10-15 14:30:45');
			expect(HxFmt.format('2023-10-15T14:30:45+05:00', undefined, 'dtf')).toBe('2023-10-15 14:30:45');
			expect(HxFmt.format(testTimestamp, undefined, 'dtf')).toBe('1697380245000');
		});

		it('handles invalid date values', () => {
			expect(HxFmt.format('invalid date', undefined, 'df')).toBe('invalid date');
			expect(HxFmt.format(null, undefined, 'df')).toBe('');
			expect(HxFmt.format(undefined, undefined, 'df')).toBe('');
			expect(HxFmt.format(true, undefined, 'df')).toBe('true');
			expect(HxFmt.format({}, undefined, 'df')).toBe('{}');
		});
	});

	describe('Custom format functionality', () => {
		it('install global custom format', () => {
			const customFormat: HxFormatFunc = (value) => `¥${value}`;
			HxFmt.install('currency', customFormat);

			expect(HxFmt.format(123, undefined, 'currency')).toBe('¥123');
			expect(HxFmt.format('456', undefined, 'currency')).toBe('¥456');
		});

		it('install language-specific custom format', () => {
			const enCurrency: HxFormatFunc = (value) => `$${value}`;
			const zhCurrency: HxFormatFunc = (value) => `¥${value}`;

			HxFmt.install('currency', enCurrency, 'en');
			HxFmt.install('currency', zhCurrency, 'zh-CN');

			// English environment
			vi.spyOn(HxLanguageContext, 'current').mockReturnValue('en');
			expect(HxFmt.format(123, undefined, 'currency')).toBe('$123');

			// Chinese environment
			vi.spyOn(HxLanguageContext, 'current').mockReturnValue('zh-CN');
			expect(HxFmt.format(123, undefined, 'currency')).toBe('¥123');
		});

		it('uninstall custom format', () => {
			const customFormat: HxFormatFunc = (value) => `TEST:${value}`;
			HxFmt.install('test', customFormat);

			expect(HxFmt.format('hello', undefined, 'test')).toBe('TEST:hello');

			HxFmt.uninstall('test');
			// After uninstall, format is not found, returns original value and logs error
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
			});
			expect(HxFmt.format('hello', undefined, 'test')).toBe('hello');
			expect(consoleErrorSpy).toHaveBeenCalled();
			consoleErrorSpy.mockRestore();
		});

		it('use format function directly', () => {
			const customFunc: HxFormatFunc = (value, _context) => `Func:${value}-no-context`;
			expect(HxFmt.format(123, undefined, customFunc)).toBe('Func:123-no-context');
		});
	});

	describe('Language fallback mechanism', () => {
		it('falls back to parent language when format not found for current language', () => {
			const zhCurrency: HxFormatFunc = (value) => `¥${value}`;
			HxFmt.install('currency', zhCurrency, 'zh');

			// zh-CN is not installed, should fallback to zh
			vi.spyOn(HxLanguageContext, 'current').mockReturnValue('zh-CN');
			expect(HxFmt.format(123, undefined, 'currency')).toBe('¥123');
		});

		it('uses global format without language suffix when no language matches', () => {
			const globalFormat: HxFormatFunc = (value) => `GLOBAL:${value}`;
			HxFmt.install('test', globalFormat);

			vi.spyOn(HxLanguageContext, 'current').mockReturnValue('unknown-lang');
			expect(HxFmt.format('value', undefined, 'test')).toBe('GLOBAL:value');
		});
	});

	describe('Edge cases and error handling', () => {
		it('returns original value for empty format definition', () => {
			expect(HxFmt.format('test', undefined, '')).toBe('test');
			expect(HxFmt.format(123, undefined, null)).toBe(123);
			expect(HxFmt.format(456, undefined, undefined)).toBe(456);
		});

		it('returns original value and logs error for non-existent format code', () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
			});
			expect(HxFmt.format('test', undefined, 'non-existent-format')).toBe('test');
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Failed to format value caused by format function not found by given definition.',
				'test',
				'non-existent-format'
			);
			consoleErrorSpy.mockRestore();
		});

		it('returns empty string for null/undefined values', () => {
			expect(HxFmt.format(null, undefined, 'nf2')).toBe('');
			expect(HxFmt.format(undefined, undefined, 'df')).toBe('');
		});
	});

	describe('Caching mechanism', () => {
		it('uses cache for repeated calls with same format, does not recreate function', () => {
			// First call
			const result1 = HxFmt.format(12345, undefined, 'nf2');
			// @ts-expect-error Access private property
			const cacheSize1 = HxFormatSettings.CacheMap.size;

			// Second call with same format
			const result2 = HxFmt.format(67890, undefined, 'nf2');
			// @ts-expect-error Access private property
			const cacheSize2 = HxFormatSettings.CacheMap.size;

			expect(result1).toBe('12,345.00');
			expect(result2).toBe('67,890.00');
			expect(cacheSize2).toBe(cacheSize1); // Cache size unchanged, using cached value
		});

		it('clears relevant cache when installing new format', () => {
			const oldFormat: HxFormatFunc = (value) => `OLD:${value}`;
			HxFmt.install('test-format', oldFormat);

			// First call, caches old format
			expect(HxFmt.format('val', undefined, 'test-format')).toBe('OLD:val');
			// @ts-expect-error
			const cacheSizeBefore = HxFormatSettings.CacheMap.size;

			// Install new format to overwrite
			const newFormat: HxFormatFunc = (value) => `NEW:${value}`;
			HxFmt.install('test-format', newFormat);

			// @ts-expect-error
			const cacheSizeAfter = HxFormatSettings.CacheMap.size;
			expect(cacheSizeAfter).toBeLessThan(cacheSizeBefore); // Relevant cache cleared

			// Call uses new format
			expect(HxFmt.format('val', undefined, 'test-format')).toBe('NEW:val');
		});
	});
});
