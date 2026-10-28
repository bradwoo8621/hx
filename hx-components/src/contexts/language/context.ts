import {ERO} from '@hx/data';
import {type ReactNode} from 'react';
import {HxLanguageKey} from '../consts';
import {HxContextDefaults} from '../defaults';
import type {HxLanguageCode} from '../types';
import {StdHxLanguages} from './packages';
import type {HxLanguagePackage, HxLanguages, LanguageChangeListener} from './types';
import {fallbackLanguage} from './utils';

/**
 * Internationalization context interface
 * Defines core operation methods for internationalization functionality.
 *
 * it is singleton, all functions are static, and when you call
 * - "switchTo" to switch language code,
 * - "setLanguages" to switch language packages
 * will notify all listeners including
 * - via "on" manually,
 * - components within language context which listen language event.
 *
 * - make sure calling "off" when your listener is useless, if it is registered by call "on" manually.
 */
export class HxLanguageContext {
	private static CurrentLanguageCode: HxLanguageCode | undefined = (void 0);
	/** Language package for the current language */
	private static LanguagePack: HxLanguagePackage | undefined;
	/** Flag indicating if language pack is synchronized */
	private static LanguagePackSynchronized = false;
	/** Collection of all language change listeners */
	private static Listeners: Map<LanguageChangeListener, void> = new Map();

	/** Original language packages passed in, used for change comparison */
	private static OriginLanguages: HxLanguages | undefined = (void 0);

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/** Synchronize the language package for current language */
	private static syncLanguagePack(): void {
		HxLanguageContext.LanguagePackSynchronized = false;
		HxLanguageContext.LanguagePack = StdHxLanguages.get(HxLanguageContext.current());
		HxLanguageContext.LanguagePackSynchronized = true;
	}

	private static doSwitch(languageCode: HxLanguageCode, syncToLocalStorage: boolean): void {
		if (languageCode == null) {
			return;
		}
		languageCode = languageCode.trim();
		if (languageCode.length === 0) {
			return;
		}

		[
			...document.documentElement.querySelectorAll('div[data-hx-root]'),
			...document.documentElement.querySelectorAll('div[data-hx-portal-root]')
		].forEach(element => element.setAttribute('data-hx-language', languageCode));
		if (HxLanguageContext.current() !== languageCode) {
			HxLanguageContext.CurrentLanguageCode = languageCode;
			if (syncToLocalStorage && localStorage.getItem(HxLanguageKey) !== languageCode) {
				localStorage.setItem(HxLanguageKey, languageCode);
			}
			HxLanguageContext.syncLanguagePack();
			HxLanguageContext.Listeners.forEach((_, listen) => listen(languageCode, 'language-code-change'));
		} else {
			HxLanguageContext.syncLanguagePack();
		}
	}

	static initialize(): void {
		const code = localStorage.getItem(HxLanguageKey)?.trim() ?? '';
		if (code.length === 0) {
			HxLanguageContext.switchToDefault();
		} else {
			HxLanguageContext.switchTo(code);
		}
	}

	private static switchToDefault(): void {
		localStorage.removeItem(HxLanguageKey);
		HxLanguageContext.doSwitch(HxContextDefaults.languageCode, false);
	}

	/**
	 * Switch to the specified language
	 * @param languageCode Target language code
	 */
	static switchTo(languageCode: HxLanguageCode): void {
		HxLanguageContext.doSwitch(languageCode, true);
	}

	/** Get the currently active language code */
	static current(): HxLanguageCode {
		if (HxLanguageContext.CurrentLanguageCode == null) {
			HxLanguageContext.CurrentLanguageCode = localStorage.getItem(HxLanguageKey)?.trim() || HxContextDefaults.languageCode;
		}
		return HxLanguageContext.CurrentLanguageCode;
	}

	/**
	 * Get internationalized content by key
	 * @param key Key of the content to get, supports nested paths
	 * @returns Internationalized content, returns the key itself if not found
	 */
	static get(key: string): ReactNode {
		if (!HxLanguageContext.LanguagePackSynchronized) {
			HxLanguageContext.syncLanguagePack();
		}
		const pack = HxLanguageContext.LanguagePack;
		if (pack == null) {
			return key;
		} else {
			return ERO.getValue(pack, key);
		}
	}

	/**
	 * Add a language change listener
	 * @param listener Listener function
	 */
	static on(listener: LanguageChangeListener): void {
		HxLanguageContext.Listeners.set(listener);
	}

	/**
	 * Remove a language change listener
	 * @param listener Listener function to remove
	 */
	static off(listener: LanguageChangeListener): void {
		HxLanguageContext.Listeners.delete(listener);
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Switch the entire language packages collection
	 * Called when the Provider's languages property changes
	 * @param languages New collection of language packages
	 */
	static setLanguages(languages: HxLanguages): void {
		if (languages === HxLanguageContext.OriginLanguages) {
			return;
		}

		HxLanguageContext.OriginLanguages = languages;
		StdHxLanguages.switchTo(languages);
		HxLanguageContext.syncLanguagePack();
		// Notify all listeners that language packages have changed
		const languageCode = HxLanguageContext.current();
		HxLanguageContext.Listeners.forEach((_, listen) => listen(languageCode, 'languages-change'));
	}

	/**
	 * get parent language of given language
	 */
	static parentOf(code: HxLanguageCode): HxLanguageCode | undefined {
		return fallbackLanguage(code);
	}
}

// noinspection JSUnusedGlobalSymbols
export const HxLC = HxLanguageContext;
