import {ERO} from '@hx/data';
// @ts-ignore
import React, {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import {HxContextDefaults} from './defaults';

/** Key for storing language setting in localStorage */
const HxLanguageKey = 'HX-LANGUAGE';

/**
 * Language code type, follows BCP-47 standard
 * @see https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag
 */
export type HxLanguageCode = string;

/**
 * Language subset type, supports nested structure
 * Can be string, React node, or another nested subset
 */
export interface HxLanguageSubset {
	[key: string]: string | ReactNode | HxLanguageSubset;
}

/** Complete language package type for a single language */
export type HxLanguagePackage = Record<string, string | ReactNode | HxLanguageSubset>;

/** Multiple language packages collection, key is language code, value is the language package */
export type HxLanguages = Record<HxLanguageCode, HxLanguagePackage>;

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
			return StdHxLanguages.get(StdHxLanguages.fallback(code));
		} else {
			return pack;
		}
	}

	/**
	 * Get the fallback language code for the given language code
	 * Example: "zh-CN" → "zh" → default language
	 * Supports "-", "_", "." as separators
	 * @param code Language code to get fallback for
	 * @returns Fallback language code, returns undefined if already at default language
	 */
	static fallback(code: HxLanguageCode): HxLanguageCode | undefined {
		let lastPartIndex = code.lastIndexOf('-');
		if (lastPartIndex < 0) {
			lastPartIndex = code.lastIndexOf('_');
		}
		if (lastPartIndex < 0) {
			lastPartIndex = code.lastIndexOf('.');
		}
		if (lastPartIndex === -1) {
			if (code === HxContextDefaults.languageCode) {
				return (void 0);
			} else {
				return HxContextDefaults.languageCode;
			}
		} else {
			return code.substring(0, lastPartIndex);
		}
	}
}

/**
 * Language change listener function type
 * @param languageCode The language code after change
 * @param type Change type: 'language-code-change' when switching language, 'languages-change' when language packages themselves change
 */
export type LanguageChangeListener = (languageCode: HxLanguageCode, type: 'language-code-change' | 'languages-change') => void;

/**
 * Internationalization context interface
 * Defines core operation methods for internationalization functionality
 */
export interface HxLanguageContext {
	/**
	 * Switch to the specified language
	 * @param languageCode Target language code, follows BCP-47 standard
	 */
	switchTo(languageCode: HxLanguageCode): void;
	/** Get the currently active language code */
	current(): HxLanguageCode;
	/**
	 * Get internationalized content by key
	 * @param key Key of the content to get, supports nested paths (e.g. "button.submit")
	 * @returns Internationalized content, returns the key itself if language package is not found
	 */
	get(key: string): ReactNode;
	/**
	 * Listen for language change events
	 * @param listen Listener function
	 */
	on(listen: LanguageChangeListener): void;
	/**
	 * Stop listening for language change events
	 * @param listen Listener function to remove
	 */
	off(listen: LanguageChangeListener): void;
}

/**
 * Concrete implementation class for HxLanguageContext
 * Internal private class, not exposed publicly
 */
class LC implements HxLanguageContext {
	/**
	 * Side effect operations when switching language
	 * Updates data-hx-language attribute on all hx root elements and saves to localStorage
	 * @param languageCode Target language code
	 */
	private static readonly SwitchTo = (languageCode: HxLanguageCode): void => {
		[
			...document.documentElement.querySelectorAll('div[data-hx-root]'),
			...document.documentElement.querySelectorAll('div[data-hx-portal-root]')
		].forEach(element => element.setAttribute('data-hx-language', languageCode));
		localStorage.setItem(HxLanguageKey, languageCode);
	};

	/** Currently active language code, defaults from localStorage, uses default language if not present */
	private static LanguageCode: HxLanguageCode = localStorage.getItem(HxLanguageKey)?.trim() || HxContextDefaults.languageCode;
	/** Language package for the current language */
	private static LanguagePack: HxLanguagePackage | undefined;
	/** Flag indicating if language pack is synchronized */
	private static LanguagePackSynchronized = false;
	/** Collection of all language change listeners */
	private static Listeners: Map<LanguageChangeListener, void> = new Map();

	/** Original language packages passed in, used for change comparison */
	private static OriginLanguages: HxLanguages | undefined = (void 0);

	/**
	 * Constructor
	 * @param languages Initial collection of language packages
	 */
	constructor(languages?: HxLanguages) {
		if (languages != null) {
			LC.OriginLanguages = languages;
			StdHxLanguages.create(languages);
		}
		this.syncLanguagePack();
	}

	/** Synchronize the language package for current language */
	private syncLanguagePack() {
		LC.LanguagePackSynchronized = false;
		LC.LanguagePack = StdHxLanguages.get(LC.LanguageCode);
		LC.LanguagePackSynchronized = true;
	}

	/**
	 * Switch to the specified language
	 * @param languageCode Target language code
	 */
	switchTo(languageCode: HxLanguageCode): void {
		if (languageCode == null) {
			return;
		}
		languageCode = languageCode.trim();
		if (languageCode.length === 0) {
			return;
		}
		if (LC.LanguageCode !== languageCode) {
			LC.LanguageCode = languageCode;
			LC.SwitchTo(languageCode);
			this.syncLanguagePack();
			LC.Listeners.forEach((_, listen) => listen(languageCode, 'language-code-change'));
		}
	}

	/** Get the currently active language code */
	current(): HxLanguageCode {
		return LC.LanguageCode;
	}

	/**
	 * Get internationalized content by key
	 * @param key Key of the content to get, supports nested paths
	 * @returns Internationalized content, returns the key itself if not found
	 */
	get(key: string): ReactNode {
		if (!LC.LanguagePackSynchronized) {
			this.syncLanguagePack();
		}
		const pack = LC.LanguagePack;
		if (pack == null) {
			return key;
		} else {
			return ERO.getValue(pack, key);
		}
	}

	/**
	 * Add a language change listener
	 * @param listen Listener function
	 */
	on(listen: LanguageChangeListener): void {
		LC.Listeners.set(listen);
	}

	/**
	 * Remove a language change listener
	 * @param listen Listener function to remove
	 */
	off(listen: LanguageChangeListener): void {
		LC.Listeners.delete(listen);
	}

	/**
	 * Switch the entire language packages collection
	 * Called when the Provider's languages property changes
	 * @param languages New collection of language packages
	 */
	switchLanguages(languages: HxLanguages): void {
		if (languages === LC.OriginLanguages) {
			return;
		}

		LC.OriginLanguages = languages;
		StdHxLanguages.switchTo(languages);
		this.syncLanguagePack();
		// Notify all listeners that language packages have changed
		const languageCode = LC.LanguageCode;
		LC.Listeners.forEach((_, listen) => listen(languageCode, 'languages-change'));
	}
}

/** Internationalization context instance */
const Context = createContext<HxLanguageContext>({} as HxLanguageContext);
Context.displayName = 'HxLanguageContext';

/**
 * Property interface for HxLanguageProvider component
 */
export interface HxLanguageProviderProps {
	/** Initial collection of language packages */
	languages?: HxLanguages;
	/** Child components */
	children: ReactNode;
}

/**
 * Internationalization context provider component
 * Wraps application root component to provide internationalization functionality
 */
export const HxLanguageProvider = (props: HxLanguageProviderProps) => {
	const {languages, children} = props;

	const [context] = useState<HxLanguageContext>(() => new LC(languages));

	// Update language packages when languages property changes
	useEffect(() => {
		if (languages != null) {
			(context as LC).switchLanguages(languages);
		}
	}, [languages]);

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

/**
 * Hook for accessing internationalization context
 * Use in components to call internationalization related methods
 */
export const useHxLanguage = () => useContext(Context);
