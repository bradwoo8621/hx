import {isValidElement} from 'react';
import {HxContextDefaults} from '../defaults';
import type {HxLanguageCode, HxLanguagePackage, HxLanguages, HxLanguageSubset} from './types';
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
	 * Installed language package could be modified in later merging
	 *
	 * @param code Language code, follows BCP-47 standard
	 * @param languages Language package content
	 * @returns Returns the StdHxLanguages class itself for method chaining
	 */
	static install(code: HxLanguageCode, languages: HxLanguagePackage): void {
		StdHxLanguages.Languages.set(code, languages);
	}

	/**
	 * plain object is not leaf, other is
	 */
	private static isLeaf(value: unknown): boolean {
		return value == null || typeof value !== 'object' || Array.isArray(value) || isValidElement(value);
	}

	private static deepMerge<T extends HxLanguagePackage | HxLanguageSubset>(source: T, target: T): void {
		Object.keys(source).forEach(key => {
			const sourceValue = source[key];
			if (StdHxLanguages.isLeaf(sourceValue)) {
				target[key] = sourceValue;
				return;
			}

			const targetValue = target[key];
			if (StdHxLanguages.isLeaf(targetValue)) {
				target[key] = sourceValue;
				return;
			}

			StdHxLanguages.deepMerge(sourceValue as HxLanguageSubset, targetValue as HxLanguageSubset);
		});
	}

	/**
	 * Merged language package could be modified in later merging
	 */
	static merge(code: HxLanguageCode, languages: HxLanguagePackage): void {
		const existing = StdHxLanguages.Languages.get(code);
		if (existing == null) {
			StdHxLanguages.install(code, languages);
		} else {
			StdHxLanguages.deepMerge(languages, existing);
		}
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Uninstall the language package for the specified language code
	 * @param code Language code to uninstall
	 * @returns Returns the StdHxLanguages class itself for method chaining
	 */
	static uninstall(code: HxLanguageCode): void {
		StdHxLanguages.Languages.delete(code);
	}

	/**
	 * Install (not merge) multiple language packages in batch.
	 * @param languages Collection of language packages
	 * @returns Returns the StdHxLanguages class itself for method chaining
	 */
	static create(languages: HxLanguages): void {
		Object.keys(languages).forEach(code => StdHxLanguages.install(code, languages[code]));
	}

	/**
	 * Replace all current language packages with a new collection
	 * First clears all installed language packages, then installs the new collection
	 * @param languages New collection of language packages
	 * @returns Returns the StdHxLanguages class itself for method chaining
	 */
	static switchTo(languages: HxLanguages): void {
		StdHxLanguages.Languages.clear();
		StdHxLanguages.create(languages);
	}

	/**
	 * Get the language package for the specified language code.
	 * If the specified language doesn't exist, automatically tries to fall back to a more generic language.
	 *
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
