import type {HxLanguageCode} from '../../contexts';
import {DateLocaleUtils} from './date-locale';

export class DateKoUtils {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	static calendar(): string | undefined {
		return 'gregory';
	}

	static supportedLanguages(): string[] {
		return [
			'ko',   // Japanese Imperial calendar (era-based)
			'ja-JP' // Japanese, Japan
		];
	}

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateKoUtils);
	}

	// noinspection JSUnusedGlobalSymbols
	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateKoUtils);
	}

	/** Returns {@code true} when the language uses the Japanese calendar. */
	// noinspection JSUnusedGlobalSymbols
	static accept(lang: HxLanguageCode): boolean {
		return lang === 'kr' || lang.startsWith('ja-');
	}
}