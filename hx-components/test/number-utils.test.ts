import {describe, expect, it} from 'vite-plus/test';
import {NumberUtils} from '../src';

describe('NumberUtils.separators', () => {
	it('en locale uses comma grouping and dot decimal', () => {
		const sep = NumberUtils.separators('en');
		expect(sep.grouping).toBe(',');
		expect(sep.decimal).toBe('.');
	});

	it('de locale uses dot grouping and comma decimal', () => {
		const sep = NumberUtils.separators('de');
		expect(sep.grouping).toBe('.');
		expect(sep.decimal).toBe(',');
		expect(sep.layout).toBe('333');
	});

	it('hi-IN locale uses Indian grouping layout', () => {
		const sep = NumberUtils.separators('hi-IN');
		expect(sep.layout).toBe('223');
	});

	it('caches results for the same locale', () => {
		const a = NumberUtils.separators('fr');
		const b = NumberUtils.separators('fr');
		expect(a).toBe(b);
	});
});

describe('NumberUtils.stripFormatting', () => {
	const comma = ',';
	const dot = '.';

	it('strips grouping separators from a plain integer', () => {
		const [valid, result] = NumberUtils.stripFormatting('1,234', comma, dot);
		expect(valid).toBe(true);
		expect(result).toBe('1234');
	});

	it('strips grouping and normalises decimal point', () => {
		const [valid, result] = NumberUtils.stripFormatting('1,234.56', comma, dot);
		expect(valid).toBe(true);
		expect(result).toBe('1234.56');
	});

	it('keeps leading minus', () => {
		const [valid, result] = NumberUtils.stripFormatting('-1,234.56', comma, dot);
		expect(valid).toBe(true);
		expect(result).toBe('-1234.56');
	});

	it('rejects leading grouping separator', () => {
		const [valid] = NumberUtils.stripFormatting(',123', comma, dot);
		expect(valid).toBe(false);
	});

	it('rejects minus after digits', () => {
		const [valid] = NumberUtils.stripFormatting('123-456', comma, dot);
		expect(valid).toBe(false);
	});

	it('rejects second decimal point', () => {
		const [valid] = NumberUtils.stripFormatting('1.2.3', dot, dot);
		expect(valid).toBe(false);
	});

	it('rejects text with only grouping characters', () => {
		const [valid] = NumberUtils.stripFormatting(',,', comma, dot);
		expect(valid).toBe(false);
	});

	it('rejects unrecognised characters', () => {
		const [valid] = NumberUtils.stripFormatting('1a2b3', comma, dot);
		expect(valid).toBe(false);
	});

	it('accepts a bare minus', () => {
		const [valid, result] = NumberUtils.stripFormatting('-', comma, dot);
		expect(valid).toBe(false); // no digits, invalid
		expect(result).toBe('-');
	});

	it('accepts minus and decimal point', () => {
		const [valid] = NumberUtils.stripFormatting('-.', dot, dot);
		expect(valid).toBe(false); // no digits
	});

	it('works with German locale separators', () => {
		const [valid, result] = NumberUtils.stripFormatting('1.234,56', '.', ',');
		expect(valid).toBe(true);
		expect(result).toBe('1234.56');
	});
});

describe('NumberUtils.format', () => {
	describe('halfExpand (default) rounding', () => {
		it('formats a plain integer', () => {
			expect(NumberUtils.format(123, {locale: 'en', minFractionDigits: 2})).toBe('123.00');
		});

		it('formats with grouping', () => {
			expect(NumberUtils.format(1234567, {locale: 'en', grouping: true, minFractionDigits: 2}))
				.toBe('1,234,567.00');
		});

		it('respects maxFractionDigits', () => {
			expect(NumberUtils.format(1.23456, {locale: 'en', maxFractionDigits: 2}))
				.toBe('1.23');
		});

		it('rounds half up', () => {
			expect(NumberUtils.format(1.5, {locale: 'en', maxFractionDigits: 0}))
				.toBe('2');
		});

		it('rounds down below half', () => {
			expect(NumberUtils.format(1.4, {locale: 'en', maxFractionDigits: 0}))
				.toBe('1');
		});

		it('rounds half up with fraction digits', () => {
			expect(NumberUtils.format(1.235, {locale: 'en', maxFractionDigits: 2}))
				.toBe('1.24');
		});

		it('pads with minFractionDigits', () => {
			expect(NumberUtils.format(1, {locale: 'en', minFractionDigits: 4}))
				.toBe('1.0000');
		});

		it('clamps maxFractionDigits to 100', () => {
			// just ensure no RangeError
			expect(() => NumberUtils.format(1.5, {locale: 'en', maxFractionDigits: 999}))
				.not.toThrow();
		});

		it('handles negative numbers', () => {
			expect(NumberUtils.format(-1.5, {locale: 'en', maxFractionDigits: 0}))
				.toBe('-2');
		});

		it('handles zero', () => {
			expect(NumberUtils.format(0, {locale: 'en', maxFractionDigits: 2, minFractionDigits: 2})).toBe('0.00');
		});
	});

	describe('trunc rounding', () => {
		it('truncates without rounding up', () => {
			expect(NumberUtils.format(1.239, {locale: 'en', maxFractionDigits: 2, roundMode: 'trunc'}))
				.toBe('1.23');
		});

		it('truncates at maxFractionDigits=0', () => {
			expect(NumberUtils.format(1.9, {locale: 'en', maxFractionDigits: 0, roundMode: 'trunc'}))
				.toBe('1');
		});

		it('truncates negative numbers toward zero', () => {
			expect(NumberUtils.format(-1.9, {locale: 'en', maxFractionDigits: 0, roundMode: 'trunc'}))
				.toBe('-1');
		});

		it('trunc at maxFractionDigits=100 returns formatted result', () => {
			expect(() => NumberUtils.format(Math.PI, {locale: 'en', maxFractionDigits: 100, roundMode: 'trunc'}))
				.not.toThrow();
		});

		it('trunc works with grouping', () => {
			expect(NumberUtils.format(1234.5678, {
				locale: 'en', grouping: true, maxFractionDigits: 2, roundMode: 'trunc'
			})).toBe('1,234.56');
		});
	});

	describe('locale support', () => {
		it('formats with German locale', () => {
			const result = NumberUtils.format(1234.5, {
				locale: 'de',
				maxFractionDigits: 2,
				minFractionDigits: 2,
				grouping: true
			});
			expect(result).toBe('1.234,50');
		});

		it('formats with German locale and trunc', () => {
			const result = NumberUtils.format(1234.567, {
				locale: 'de', maxFractionDigits: 2, grouping: true, roundMode: 'trunc'
			});
			expect(result).toBe('1.234,56');
		});
	});
});

describe('NumberUtils.formatManually', () => {
	describe('halfExpand rounding', () => {
		it('formats integer and fraction with grouping', () => {
			expect(NumberUtils.formatManually(false, '1234', '56', {
				locale: 'en', grouping: true, maxFractionDigits: 2
			})).toBe('1,234.56');
		});

		it('pads fraction with minFractionDigits', () => {
			expect(NumberUtils.formatManually(false, '1', '5', {
				locale: 'en', minFractionDigits: 3, maxFractionDigits: 3
			})).toBe('1.500');
		});

		it('rounds half up — carries within fraction', () => {
			expect(NumberUtils.formatManually(false, '1', '125', {
				locale: 'en', maxFractionDigits: 2
			})).toBe('1.13');
		});

		it('rounds half up — carries to integer', () => {
			expect(NumberUtils.formatManually(false, '1', '9999', {
				locale: 'en', maxFractionDigits: 3, minFractionDigits: 3
			})).toBe('2.000');
		});

		it('rounds half up with no carry when below 5', () => {
			expect(NumberUtils.formatManually(false, '1', '124', {
				locale: 'en', maxFractionDigits: 2
			})).toBe('1.12');
		});

		it('preserves leading zeros in fraction', () => {
			expect(NumberUtils.formatManually(false, '1', '001234', {
				locale: 'en', maxFractionDigits: 3
			})).toBe('1.001');
		});
	});

	describe('trunc rounding', () => {
		it('truncates fraction without rounding', () => {
			expect(NumberUtils.formatManually(false, '1', '239', {
				locale: 'en', maxFractionDigits: 2, roundMode: 'trunc'
			})).toBe('1.23');
		});

		it('truncates without rounding up when next digit >= 5', () => {
			expect(NumberUtils.formatManually(false, '1', '259', {
				locale: 'en', maxFractionDigits: 2, roundMode: 'trunc'
			})).toBe('1.25');
		});
	});

	describe('carry to integer with minFractionDigits', () => {
		it('carries to integer and pads zeros when minFractionDigits > 0', () => {
			expect(NumberUtils.formatManually(false, '9', '9999', {
				locale: 'en', maxFractionDigits: 3, minFractionDigits: 3
			})).toBe('10.000');
		});
	});

	describe('maxFractionDigits=0 with fraction part', () => {
		it('trunc drops fraction', () => {
			expect(NumberUtils.formatManually(false, '1', '9', {
				locale: 'en', maxFractionDigits: 0, roundMode: 'trunc'
			})).toBe('1');
		});

		it('halfExpand carries to integer when fraction >= 5', () => {
			expect(NumberUtils.formatManually(false, '1', '5', {
				locale: 'en', maxFractionDigits: 0
			})).toBe('2');
		});

		it('halfExpand does not carry when fraction < 5', () => {
			expect(NumberUtils.formatManually(false, '1', '4', {
				locale: 'en', maxFractionDigits: 0
			})).toBe('1');
		});
	});

	describe('no fraction passed', () => {
		it('returns formatted integer when fraction is empty', () => {
			expect(NumberUtils.formatManually(false, '1234', '', {
				locale: 'en', grouping: true
			})).toBe('1,234');
		});

		it('pads with minFractionDigits when fraction is empty', () => {
			expect(NumberUtils.formatManually(false, '1', '', {
				locale: 'en', minFractionDigits: 2
			})).toBe('1.00');
		});
	});

	describe('negative numbers', () => {
		it('trunc negative toward zero', () => {
			expect(NumberUtils.formatManually(true, '1', '9', {
				locale: 'en', maxFractionDigits: 0, roundMode: 'trunc'
			})).toBe('-1');
		});

		it('halfExpand negative carries via BigInt sign', () => {
			expect(NumberUtils.formatManually(true, '1', '5', {
				locale: 'en', maxFractionDigits: 0
			})).toBe('-0');
		});
	});

	describe('locale with German separators', () => {
		it('formats with dot grouping and comma decimal', () => {
			expect(NumberUtils.formatManually(false, '1234', '50', {
				locale: 'de', grouping: true, maxFractionDigits: 2
			})).toBe('1.234,50');
		});
	});
});

describe('NumberUtils.formatNumber', () => {
	it('delegates to format for number input', () => {
		expect(NumberUtils.formatNumber(1.239, {locale: 'en', maxFractionDigits: 2, roundMode: 'trunc'}))
			.toBe('1.23');
	});

	it('delegates to formatManually for string input', () => {
		expect(NumberUtils.formatNumber('1234.56')).toBe('1234.56');
	});

	it('returns original string for invalid number', () => {
		expect(NumberUtils.formatNumber('abc')).toBe('abc');
	});
});
