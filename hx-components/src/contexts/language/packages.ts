import {HxContextDefaults} from '../defaults';
import type {HxLanguageCode, HxLanguagePackage, HxLanguages} from './types';
import {fallbackLanguage} from './utils';

/**
 * Standard internationalization manager
 * Static class for globally managing all installed language packages, supports method chaining
 */
export class StdHxLanguages {
	/** Stores all installed language packages, key is language code, value is the language package */
	private static readonly Languages: Map<string, HxLanguagePackage> = new Map();

	/**
	 * Install a language package for the specified language code
	 * @param code Language code, follows BCP-47 standard
	 * @param languages Language package content
	 * @returns Returns the StdHxLanguages class itself for method chaining
	 */
	static install(code: HxLanguageCode, languages: HxLanguagePackage): StdHxLanguages {
		StdHxLanguages.Languages.set(code, languages);
		return StdHxLanguages;
	}

	/**
	 * Uninstall the language package for the specified language code
	 * @param code Language code to uninstall
	 * @returns Returns the StdHxLanguages class itself for method chaining
	 */
	static uninstall(code: HxLanguageCode): StdHxLanguages {
		StdHxLanguages.Languages.delete(code);
		return StdHxLanguages;
	}

	/**
	 * Install multiple language packages in batch
	 * @param languages Collection of language packages
	 * @returns Returns the StdHxLanguages class itself for method chaining
	 */
	static create(languages: HxLanguages): StdHxLanguages {
		Object.keys(languages).forEach(code => StdHxLanguages.install(code, languages[code]));
		return StdHxLanguages;
	}

	/**
	 * Replace all current language packages with a new collection
	 * First clears all installed language packages, then installs the new collection
	 * @param languages New collection of language packages
	 * @returns Returns the StdHxLanguages class itself for method chaining
	 */
	static switchTo(languages: HxLanguages): StdHxLanguages {
		StdHxLanguages.Languages.clear();
		StdHxLanguages.create(languages);
		return StdHxLanguages;
	}

	/**
	 * Get the language package for the specified language code
	 * If the specified language doesn't exist, automatically tries to fall back to a more generic language
	 * @param code Language code to get, uses default language if not provided
	 * @returns Language package object, returns undefined if not found
	 */
	static get(code?: HxLanguageCode): HxLanguagePackage | undefined {
		if (code == null || code.trim().length === 0 || code === HxContextDefaults.languageCode) {
			return StdHxLanguages.Languages.get(HxContextDefaults.languageCode);
		}

		const pack = StdHxLanguages.Languages.get(code);
		if (pack == null) {
			return StdHxLanguages.get(fallbackLanguage(code));
		} else {
			return pack;
		}
	}
}
