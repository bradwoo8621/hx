import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleFormatUtils, UTCDate} from '../facade';
import type {ComputedMonths, DateLocaleNotGregorianProvider, HxFormattedYear} from '../interfaces';

export class DateChineseUtils implements DateLocaleNotGregorianProvider {
	static readonly INSTANCE = new DateChineseUtils();

	/**
	 * Prevents external instantiation; access via {@link INSTANCE}.
	 */
	protected constructor() {
	}

	/**
	 * Registers the Chinese calendar with the locale provider.
	 *
	 * <p>No move provider is registered: the Chinese lunisolar calendar tracks
	 * the Gregorian year, so year/month navigation uses the Gregorian move logic.</p>
	 */
	// noinspection JSUnusedGlobalSymbols
	static enable() {
		DateLocaleFormatUtils.enableNotGregorianLocaleProvider(DateChineseUtils.INSTANCE);
	}

	/**
	 * Unregisters the Chinese calendar from the locale provider.
	 */
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

	/**
	 * Computes the 12-month grid for the months panel in the Chinese calendar.
	 *
	 * <p>The grid follows the Gregorian year's 12 months, while the month labels
	 * are formatted in the Chinese (lunisolar) calendar via
	 * {@link DateLocaleFormatUtils#formatMonthLong}.</p>
	 *
	 * @param somedayOfYear      - the reference date; its year and month determine the grid and the offsets
	 * @param currentDate - the current value date; its year marks the "this month" cell
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the 12 months of the reference date's year
	 */
	monthsOfYear(somedayOfYear: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		const year = somedayOfYear.getFullYear();
		const monthIndex = somedayOfYear.getMonthIndex();
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
					y10k: false,
					thisMonth: somedayOfYear.getMonthIndex() === currentDate.getMonthIndex()
				};
			});
	}
}
