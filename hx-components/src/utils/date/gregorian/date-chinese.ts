import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleFormatUtils, UTCDate} from '../facade';
import type {ComputedMonths, DateLocaleNotGregorianProvider, HxFormattedYear} from '../interfaces';

export class DateChineseUtils implements DateLocaleNotGregorianProvider {
	static readonly INSTANCE = new DateChineseUtils();

	protected constructor() {
	}

	// noinspection JSUnusedGlobalSymbols
	static enable() {
		DateLocaleFormatUtils.enableNotGregorianLocaleProvider(DateChineseUtils.INSTANCE);
	}

	static disable() {
		DateLocaleFormatUtils.disableNotGregorianLocaleProvider(DateChineseUtils.INSTANCE);
	}

	/** Returns {@code true} when the language uses the Chinese calendar. */
	accept(lang: HxLanguageCode): boolean {
		if (lang === 'zh' || lang === 'zh-Hans' || lang.startsWith('zh-Hans-')) {
			return true;
		}
		if (lang === 'zh-TW'
			|| lang === 'zh-Hant-TW'
			|| lang.startsWith('zh-TW-')
			|| lang.startsWith('zh-Hant-TW-')) {
			return false;
		}
		return lang.startsWith('zh-');
	}

	/**
	 * Extracts the formatted year and strips the following {@code 年} literal
	 * from {@link Intl.DateTimeFormat} parts.
	 *
	 * <p>For Chinese locales, the Intl output appends a {@code 年} suffix
	 * (e.g. {@code "2025年"}) which is removed here since the year is
	 * displayed standalone. Falls back to the Gregorian full year when the
	 * formatted parts cannot be parsed.</p>
	 *
	 * @param date     - the Gregorian date
	 * @param partsOf  - callback that returns the formatted parts array
	 * @param _lang    - locale (unused; the logic is locale-independent)
	 * @returns the year string without the literal suffix (e.g. {@code "2025"})
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	yearAs(date: UTCDate, partsOf: () => Array<Intl.DateTimeFormatPart>, _lang: HxLanguageCode): HxFormattedYear {
		const yearAndLiteral = DateLocaleFormatUtils.findYearAndLiteralFromFormattedParts(partsOf);
		if (yearAndLiteral.found) {
			// eslint-disable-next-line prefer-const
			let {year, literal} = yearAndLiteral;
			if (literal === '年') {
				literal = '';
			}
			return [year, literal].join('');
		} else {
			return String(date.getFullYear());
		}
	}

	monthsOfYear(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		const year = date.getFullYear();
		const monthIndex = date.getMonthIndex();
		return new Array(12)
			.fill(1)
			.map((_, index) => UTCDate.of(year, index, 1))
			.map(month => {
				return {
					key: `${year}-${month.getMonthIndex() + 1}-1`,
					label: DateLocaleFormatUtils.formatMonthLong(month, lang, gregorian),
					value: month,
					offset: month.getMonthIndex() - monthIndex,
					bc: false,
					y10k: false
				};
			});
	}
}
