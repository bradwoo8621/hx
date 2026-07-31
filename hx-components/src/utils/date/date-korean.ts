import type {HxLanguageCode} from '../../contexts';
import {DateLocaleUtils} from './date-locale';
import type {HxFormattedYear} from './date-types';

export class DateKoreanUtils {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	// noinspection JSUnusedGlobalSymbols
	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateKoreanUtils);
	}

	// noinspection JSUnusedGlobalSymbols
	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateKoreanUtils);
	}

	/** Returns {@code true} when the language uses the Korean calendar. */
	// noinspection JSUnusedGlobalSymbols
	static accept(lang: HxLanguageCode): boolean {
		return lang === 'ko-KR'
			|| lang === 'ko'
			|| lang === 'ko-KP'
			|| lang.startsWith('ko-');
	}

	/**
	 * Ignores the literal part after year part, if it is 년.
	 */
	// noinspection JSUnusedGlobalSymbols
	static yearAs(_lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedYear {
		const yearAndLiteral = DateLocaleUtils.findYearAndLiteralFromFormattedParts(partsOf);
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
