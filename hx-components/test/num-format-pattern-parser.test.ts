import {describe, expect, it} from 'vite-plus/test';
import {
	HxFormatInputNumberPatternParser,
	type HxFormatInputNumberParsedPattern
} from '../src';

const config = (overrides: Partial<HxFormatInputNumberParsedPattern> = {}): HxFormatInputNumberParsedPattern => {
	return {
		type: 'number',
		unsigned: false,
		grouping: false,
		maxIntegerDigits: -1,
		maxFractionDigits: -1,
		fixedFraction: false,
		forceEn: false,
		...overrides
	};
};

describe('NumFormatPatternParser', () => {
	describe('Valid patterns', () => {
		it('@n — bare number, no flags', () => {
			expect(HxFormatInputNumberPatternParser.parse('@n')).toEqual(config());
		});

		it('@nu — unsigned', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nu')).toEqual(config({unsigned: true}));
		});

		it('@ng — grouping', () => {
			expect(HxFormatInputNumberPatternParser.parse('@ng')).toEqual(config({grouping: true}));
		});

		it('@nug — unsigned + grouping', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nug')).toEqual(config({unsigned: true, grouping: true}));
		});

		it('@nd10 — integer digits only', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nd10')).toEqual(config({maxIntegerDigits: 10}));
		});

		it('@nud10 — unsigned + integer digits', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nud10')).toEqual(config({unsigned: true, maxIntegerDigits: 10}));
		});

		it('@ngd10 — grouping + integer digits', () => {
			expect(HxFormatInputNumberPatternParser.parse('@ngd10')).toEqual(config({grouping: true, maxIntegerDigits: 10}));
		});

		it('@nf2 — fraction digits only', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nf2')).toEqual(config({maxFractionDigits: 2}));
		});

		it('@nf2x — fraction digits + fixed display', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nf2x')).toEqual(config({
				maxFractionDigits: 2,
				fixedFraction: true
			}));
		});

		it('@nuf2x — unsigned + fraction + fixed display', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nuf2x')).toEqual(config({
				unsigned: true,
				maxFractionDigits: 2,
				fixedFraction: true
			}));
		});

		it('@ngf5x — grouping + fraction + fixed display', () => {
			expect(HxFormatInputNumberPatternParser.parse('@ngf5x')).toEqual(config({
				grouping: true,
				maxFractionDigits: 5,
				fixedFraction: true
			}));
		});

		it('@nd10f2 — integer + fraction digits', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nd10f2')).toEqual(config({
				maxIntegerDigits: 10,
				maxFractionDigits: 2
			}));
		});

		it('@nd10f2x — integer + fraction + fixed display', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nd10f2x')).toEqual(config({
				maxIntegerDigits: 10,
				maxFractionDigits: 2,
				fixedFraction: true
			}));
		});

		it('@nugd10f2 — unsigned + grouping + integer + fraction', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nugd10f2')).toEqual(
				config({unsigned: true, grouping: true, maxIntegerDigits: 10, maxFractionDigits: 2})
			);
		});

		it('@nugd10f2x — all flags', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nugd10f2x')).toEqual(
				config({
					unsigned: true,
					grouping: true,
					maxIntegerDigits: 10,
					maxFractionDigits: 2,
					fixedFraction: true
				})
			);
		});

		it('@nd0 — zero integer digits', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nd0')).toEqual(config({maxIntegerDigits: 0}));
		});

		it('@nf0 — zero fraction digits', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nf0')).toEqual(config({maxFractionDigits: 0}));
		});

		it('@nf0x — zero fraction digits + fixed display', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nf0x')).toEqual(config({
				maxFractionDigits: 0,
				fixedFraction: true
			}));
		});

		it('parses large digit counts', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nd999')).toEqual(config({maxIntegerDigits: 999}));
			expect(HxFormatInputNumberPatternParser.parse('@nf99')).toEqual(config({maxFractionDigits: 99}));
		});
	});

	describe('Invalid patterns', () => {
		it('returns false for empty string', () => {
			expect(HxFormatInputNumberPatternParser.parse('')).toBe(false);
		});

		it('returns false for arbitrary string', () => {
			expect(HxFormatInputNumberPatternParser.parse('hello')).toBe(false);
		});

		it('returns false for @ alone', () => {
			expect(HxFormatInputNumberPatternParser.parse('@')).toBe(false);
		});

		it('returns false when x appears without f', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nx')).toBe(false);
		});

		it('returns false when x appears after d without f', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nd5x')).toBe(false);
		});

		it('returns false when g appears after f', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nf5g')).toBe(false);
		});

		it('returns false when d has no digits', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nd')).toBe(false);
		});

		it('returns false when f has no digits', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nd5f')).toBe(false);
		});

		it('returns false when pattern has trailing garbage', () => {
			expect(HxFormatInputNumberPatternParser.parse('@ngf5xabc')).toBe(false);
		});

		it('returns false for duplicate u', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nuu')).toBe(false);
		});

		it('returns false for duplicate g', () => {
			expect(HxFormatInputNumberPatternParser.parse('@ngg')).toBe(false);
		});

		it('returns false for d after f', () => {
			expect(HxFormatInputNumberPatternParser.parse('@nf5d10')).toBe(false);
		});
	});
});
