import {afterEach, describe, expect, it, vi} from 'vitest';
import {AnyUtils, FileUtils, HxFmt, HxLC, I18NUtils, StringChange, StringUtils} from '../src';

afterEach(() => {
	HxLC.switchTo('en');
});

describe('StringUtils', () => {
	it('detects empty and blank strings', () => {
		expect(StringUtils.isEmpty('')).toBe(true);
		expect(StringUtils.isEmpty(undefined)).toBe(true);
		expect(StringUtils.isEmpty('a')).toBe(false);
		expect(StringUtils.isBlank('')).toBe(true);
		expect(StringUtils.isBlank('   ')).toBe(true);
		expect(StringUtils.isBlank(' a ')).toBe(false);
		expect(StringUtils.isBlank(undefined)).toBe(true);
	});

	it('converts values to strings', () => {
		expect(StringUtils.asStr(undefined)).toBeUndefined();
		expect(StringUtils.asStr(null)).toBeNull();
		expect(StringUtils.asStr('a')).toBe('a');
		expect(StringUtils.asStr(1)).toBe('1');
		expect(StringUtils.asStr(true)).toBe('true');
		expect(StringUtils.asStr({})).toBe('[object Object]');
	});

	it('compares strings treating null and empty as equal context', () => {
		expect(StringUtils.isSameStr(undefined, '')).toBe(true);
		expect(StringUtils.isSameStr(null, '')).toBe(true);
		expect(StringUtils.isSameStr('a', 'a')).toBe(true);
		expect(StringUtils.isSameStr('a', 'b')).toBe(false);
	});

	it('strips whitespace and trims characters', () => {
		expect(StringUtils.stripWhitespace(' a b\tc\n')).toBe('abc');
		expect(StringUtils.trimStart('///abc', '/')).toBe('abc');
		expect(StringUtils.trimStart('/a/b', '/')).toBe('a/b');
		expect(StringUtils.trimEnd('abc///', '/')).toBe('abc');
	});

	it('detects numeric characters', () => {
		expect(StringUtils.hasNumericChar('abc1')).toBe(true);
		expect(StringUtils.hasNumericChar('abc')).toBe(false);
	});

	it('normalizes number strings', () => {
		expect(StringUtils.normalizeToNumber('')).toEqual([false, '', false, '', '']);
		expect(StringUtils.normalizeToNumber('abc')).toEqual([false, 'abc', false, '', '']);
		expect(StringUtils.normalizeToNumber('1-2')).toEqual([false, '1-2', false, '', '']);
		expect(StringUtils.normalizeToNumber('1.2.3')).toEqual([false, '1.2.3', false, '', '']);
		expect(StringUtils.normalizeToNumber('-0')).toEqual([true, '0', false, '0', '']);
		expect(StringUtils.normalizeToNumber('00123')).toEqual([true, '123', false, '123', '']);
		expect(StringUtils.normalizeToNumber('1.200')).toEqual([true, '1.2', false, '1', '2']);
		expect(StringUtils.normalizeToNumber('-1.5')).toEqual([true, '-1.5', true, '1', '5']);
		expect(StringUtils.normalizeToNumber('.5')).toEqual([true, '0.5', false, '0', '5']);
	});
});

describe('StringChange', () => {
	it('classifies no change', () => {
		const change = StringChange.of('abc', 'abc');
		expect(change.type).toBe('none');
		expect(change.isNoChange()).toBe(true);
	});

	it('classifies insertion', () => {
		const change = StringChange.of('ac', 'abc');
		expect(change.type).toBe('insert');
		expect(change.isInsert()).toBe(true);
		expect(change.prefix).toBe('a');
		expect(change.suffix).toBe('c');
		expect(change.inserted).toBe('b');
		expect(change.deleted).toBe('');
		expect(change.start).toBe(1);
	});

	it('classifies deletion', () => {
		const change = StringChange.of('abc', 'ac');
		expect(change.type).toBe('delete');
		expect(change.isDelete()).toBe(true);
		expect(change.deleted).toBe('b');
		expect(change.inserted).toBe('');
	});

	it('classifies a partial replacement', () => {
		const change = StringChange.of('abc', 'axc');
		expect(change.type).toBe('replace-part');
		expect(change.isReplacePart()).toBe(true);
		expect(change.deleted).toBe('b');
		expect(change.inserted).toBe('x');
	});

	it('classifies a full replacement', () => {
		const change = StringChange.of('abc', 'xyz');
		expect(change.type).toBe('replace-all');
		expect(change.isReplaceAll()).toBe(true);
		expect(change.prefix).toBe('');
		expect(change.suffix).toBe('');
	});
});

describe('AnyUtils', () => {
	it('detects empty values with optional trimming', () => {
		expect(AnyUtils.isEmpty(null, true)).toBe(true);
		expect(AnyUtils.isEmpty(undefined, true)).toBe(true);
		expect(AnyUtils.isEmpty('', true)).toBe(true);
		expect(AnyUtils.isEmpty('  ', true)).toBe(true);
		expect(AnyUtils.isEmpty('  ', false)).toBe(false);
		expect(AnyUtils.isEmpty(0, true)).toBe(false);
		expect(AnyUtils.isEmpty(false, true)).toBe(false);
	});
});

describe('FileUtils.sizeToStr', () => {
	it('formats sizes into a value and unit pair', () => {
		expect(FileUtils.sizeToStr()).toEqual([0, 'B']);
		expect(FileUtils.sizeToStr(100)).toEqual([100, 'B']);
		expect(FileUtils.sizeToStr(2048)).toEqual([2, 'kb']);
		expect(FileUtils.sizeToStr(1024 * 1024 * 2)).toEqual([2, 'mb']);
	});
});

describe('I18NUtils', () => {
	it('detects i18n keys', () => {
		expect(I18NUtils.isI18NKey('~key')).toEqual([true, 'key']);
		expect(I18NUtils.isI18NKey('~')).toEqual([false, '~']);
		expect(I18NUtils.isI18NKey('\\~key')).toEqual([false, '~key']);
		expect(I18NUtils.isI18NKey('plain')).toEqual([false, 'plain']);
	});

	it('adds and removes the i18n prefix', () => {
		expect(I18NUtils.addI18NPrefix('key')).toBe('~key');
		expect(I18NUtils.addI18NPrefix('~key')).toBe('~key');
		// an escaped leading tilde is literal text, so the i18n prefix escapes it again
		expect(I18NUtils.addI18NPrefix('\\~key')).toBe('~~key');
		expect(I18NUtils.delI18NPrefix('~key')).toBe('key');
		expect(I18NUtils.delI18NPrefix('key')).toBe('key');
	});
});

describe('HxFmt', () => {
	it('formats numbers with fixed fraction digits', () => {
		expect(HxFmt.format(1234.5, void 0, 'nf2')).toBe('1,234.50');
		expect(HxFmt.format(1234.567, void 0, 'nf0')).toBe('1,235');
	});

	it('formats numbers with dynamic fraction digits', () => {
		expect(HxFmt.format(1234.5, void 0, 'ng')).toBe('1,234.5');
	});

	it('returns an empty string for null and undefined values', () => {
		expect(HxFmt.format(null, void 0, 'nf2')).toBe('');
		expect(HxFmt.format(undefined, void 0, 'nf2')).toBe('');
	});

	it('returns the value unchanged when no format is given', () => {
		expect(HxFmt.format('value', void 0, undefined)).toBe('value');
		expect(HxFmt.format('value', void 0, '')).toBe('value');
	});

	it('formats dates with the predefined date codes', () => {
		expect(HxFmt.format('2024-02-03T10:20:30', void 0, 'df')).toBe('2024-02-03');
		expect(HxFmt.format('2024-02-03T10:20:30', void 0, 'tf')).toBe('10:20:30');
		expect(HxFmt.format('2024-02-03T10:20:30', void 0, 'dtf')).toBe('2024-02-03 10:20:30');
	});

	it('prefers a language specific registered format', () => {
		HxFmt.install('nf2', value => `de:${value}`, 'de');
		HxLC.switchTo('de');
		expect(HxFmt.format(1234.5, void 0, 'nf2')).toBe('de:1234.5');
		HxFmt.uninstall('nf2', 'de');
	});

	it('installs and uninstalls a custom format', () => {
		const func = vi.fn((value: unknown) => `#${value}`);
		HxFmt.install('custom', func);
		expect(HxFmt.format(7, void 0, 'custom')).toBe('#7');
		HxFmt.uninstall('custom');
		const error = vi.spyOn(console, 'error').mockImplementation(() => (void 0));
		expect(HxFmt.format(7, void 0, 'custom')).toBe(7);
		error.mockRestore();
	});

	it('accepts a format function directly', () => {
		expect(HxFmt.format(2, void 0, value => `${value}!`)).toBe('2!');
	});
});
