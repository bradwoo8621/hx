import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleFormatUtils, UTCDate} from '../facade';
import type {HxFormattedYear} from '../interfaces';
import {type DateLocaleNotGregorianProvider} from '../interfaces';

export class DateKoreanUtils implements DateLocaleNotGregorianProvider {
	static readonly INSTANCE = new DateKoreanUtils();

	protected constructor() {
	}

	// noinspection JSUnusedGlobalSymbols
	static enable() {
		DateLocaleFormatUtils.enableNotGregorianLocaleProvider(DateKoreanUtils.INSTANCE);
	}

	static disable() {
		DateLocaleFormatUtils.disableNotGregorianLocaleProvider(DateKoreanUtils.INSTANCE);
	}

	/** Returns {@code true} when the language uses the Korean calendar. */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'ko-KR'
			|| lang === 'ko'
			|| lang === 'ko-KP'
			|| lang.startsWith('ko-');
	}

	/**
	 * Formats the year for a Korean calendar date, stripping the trailing
	 * {@code "년"} literal when present.
	 *
	 * <p>Korean {@link Intl.DateTimeFormat} outputs years with a {@code "년"}
	 * suffix (e.g. {@code "2026년"}). This method removes that suffix to
	 * produce a bare numeric year.</p>
	 *
	 * @param date    - Gregorian date (unused; falls back to {@code getFullYear()})
	 * @param partsOf - Intl.DateTimeFormat parts callback
	 * @param _lang   - locale (unused)
	 * @returns the year string without the {@code "년"} suffix
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	yearAs(date: UTCDate, partsOf: () => Array<Intl.DateTimeFormatPart>, _lang: HxLanguageCode): HxFormattedYear {
		const yearAndLiteral = DateLocaleFormatUtils.findYearAndLiteralFromFormattedParts(partsOf);
		if (yearAndLiteral.found) {
			// eslint-disable-next-line prefer-const
			let {year, literal} = yearAndLiteral;
			if (literal === '년') {
				literal = '';
			}
			return [year, literal].join('');
		} else {
			return String(date.getFullYear());
		}
	}
}
