import {beforeAll, describe, expect, it, vi} from 'vitest';

// Force the ES2020 fallback path (engines without roundingMode support) by
// patching Intl.NumberFormat BEFORE the first format call triggers the lazy
// support probe in NumberUtils. Vitest isolates test files, so this patch never
// leaks into other test files.
const OriginalNumberFormat = Intl.NumberFormat;

class PatchedNumberFormat extends OriginalNumberFormat {
	resolvedOptions(): Intl.ResolvedNumberFormatOptions {
		const options = super.resolvedOptions();
		return {...options, roundingMode: 'halfExpand'};
	}
}

vi.stubGlobal('Intl', {...Intl, NumberFormat: PatchedNumberFormat});

// import must stay after the stub: module loading itself is safe (the probe is
// lazy), but keeping the order obvious avoids accidental early probes
const {NumberUtils} = await import('../src/utils/number');

describe('NumberUtils.format trunc ES2020 fallback', () => {
	beforeAll(() => {
		// guard against a false positive: had the patch not applied, the lazy probe
		// would cache "supported" and every case below would silently run the
		// native path instead of the fallback this file exists to cover
		const probe = new Intl.NumberFormat('en', {roundingMode: 'trunc'});
		expect(probe.resolvedOptions().roundingMode).toBe('halfExpand');
	});

	it('truncates without rounding pollution at the carry window', () => {
		expect(NumberUtils.format(0.1995, {locale: 'en', maxFractionDigits: 2, roundMode: 'trunc'})).toBe('0.19');
		expect(NumberUtils.format(1.9995, {locale: 'en', maxFractionDigits: 2, roundMode: 'trunc'})).toBe('1.99');
		expect(NumberUtils.format(2.0997, {locale: 'en', maxFractionDigits: 2, roundMode: 'trunc'})).toBe('2.09');
	});

	it('expands negative exponents with leading zeros', () => {
		expect(NumberUtils.format(1.5e-7, {locale: 'en', maxFractionDigits: 10, roundMode: 'trunc'})).toBe('0.00000015');
		expect(NumberUtils.format(9.99e-7, {locale: 'en', maxFractionDigits: 10, roundMode: 'trunc'})).toBe('0.000000999');
		expect(NumberUtils.format(-1.5e-7, {locale: 'en', maxFractionDigits: 10, roundMode: 'trunc'})).toBe('-0.00000015');
		expect(NumberUtils.format(1e-6, {locale: 'en', maxFractionDigits: 8, roundMode: 'trunc'})).toBe('0.000001');
	});

	it('expands positive exponents by padding the mantissa', () => {
		// 2 ** 70 prints as 1.1805916207174113e+21; the Number-world truth is the
		// shortest round-trip string expanded with zeros, same as Intl does
		expect(NumberUtils.format(2 ** 70, {locale: 'en', maxFractionDigits: 5, roundMode: 'trunc', grouping: false}))
			.toBe('1180591620717411300000');
		expect(NumberUtils.format(1.5e21, {locale: 'en', maxFractionDigits: 2, roundMode: 'trunc', grouping: false}))
			.toBe('1500000000000000000000');
	});

	it('truncates from the shortest round-trip representation of the double', () => {
		expect(NumberUtils.format(11345.2345462456789, {locale: 'en', maxFractionDigits: 6, roundMode: 'trunc'}))
			.toBe('11345.234546');
		expect(NumberUtils.format(.113452345462456789e5, {locale: 'en', maxFractionDigits: 6, roundMode: 'trunc'}))
			.toBe('11345.234546');
		expect(NumberUtils.format(11345.2345462456789, {locale: 'en', maxFractionDigits: 20, roundMode: 'trunc'}))
			.toBe('11345.23454624568');
	});

	it('keeps the Math.trunc path for maxFractionDigits=0', () => {
		expect(NumberUtils.format(123.9, {locale: 'en', maxFractionDigits: 0, roundMode: 'trunc'})).toBe('123');
		expect(NumberUtils.format(-123.9, {locale: 'en', maxFractionDigits: 0, roundMode: 'trunc'})).toBe('-123');
	});
});
