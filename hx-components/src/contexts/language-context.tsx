import {ERO} from '@hx/data';
// @ts-ignore
import React, {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import {HxContextDefaults} from './defaults';

const HxLanguageKey = 'HX-LANGUAGE';

/** follow BCP-47 standard, https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag */
export type HxLanguageCode = string;

export interface HxLanguageSubset {
	[key: string]: string | ReactNode | HxLanguageSubset;
}

export type HxLanguagePackage = Record<string, string | ReactNode | HxLanguageSubset>;
export type HxLanguages = Record<HxLanguageCode, HxLanguagePackage>;

export class StdHxLanguages {
	private static readonly Languages: Map<string, HxLanguagePackage> = new Map();

	static install(code: HxLanguageCode, languages: HxLanguagePackage): StdHxLanguages {
		StdHxLanguages.Languages.set(code, languages);
		return StdHxLanguages;
	}

	static uninstall(code: HxLanguageCode): StdHxLanguages {
		StdHxLanguages.Languages.delete(code);
		return StdHxLanguages;
	}

	static create(languages: HxLanguages): StdHxLanguages {
		Object.keys(languages).forEach(code => StdHxLanguages.install(code, languages[code]));
		return StdHxLanguages;
	}

	static switchTo(languages: HxLanguages): StdHxLanguages {
		StdHxLanguages.Languages.clear();
		StdHxLanguages.create(languages);
		return StdHxLanguages;
	}

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
	 * get fallback language code of given code
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

export type LanguageChangeListener = (languageCode: HxLanguageCode, type: 'language-code-change' | 'languages-change') => void;

export interface HxLanguageContext {
	/**
	 * switch to given language
	 * @param languageCode follows JavaScript language standard
	 */
	switchTo(languageCode: HxLanguageCode): void;
	/** get current language code */
	current(): HxLanguageCode;
	/** get i18n content by given key. return key itself if language package not found */
	get(key: string): ReactNode;
	/** listen the language change */
	on(listen: LanguageChangeListener): void;
	/** stop listen the language change */
	off(listen: LanguageChangeListener): void;
}

class LC implements HxLanguageContext {
	private static readonly SwitchTo = (languageCode: HxLanguageCode): void => {
		[
			...document.documentElement.querySelectorAll('div[data-hx-root]'),
			...document.documentElement.querySelectorAll('div[data-hx-portal-root]')
		].forEach(element => element.setAttribute('data-hx-language', languageCode));
		localStorage.setItem(HxLanguageKey, languageCode);
	};

	private static LanguageCode: HxLanguageCode = localStorage.getItem(HxLanguageKey)?.trim() || HxContextDefaults.languageCode;
	private static LanguagePack: HxLanguagePackage | undefined;
	private static LanguagePackSynchronized = false;
	private static Listeners: Map<LanguageChangeListener, void> = new Map();

	private static OriginLanguages: HxLanguages | undefined = (void 0);

	constructor(languages?: HxLanguages) {
		if (languages != null) {
			LC.OriginLanguages = languages;
			StdHxLanguages.create(languages);
		}
		this.syncLanguagePack();
	}

	/** synchronize language package */
	private syncLanguagePack() {
		LC.LanguagePackSynchronized = false;
		LC.LanguagePack = StdHxLanguages.get(LC.LanguageCode);
		LC.LanguagePackSynchronized = true;
	}

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

	current(): HxLanguageCode {
		return LC.LanguageCode;
	}

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

	on(listen: LanguageChangeListener): void {
		LC.Listeners.set(listen);
	}

	off(listen: LanguageChangeListener): void {
		LC.Listeners.delete(listen);
	}

	switchLanguages(languages: HxLanguages): void {
		if (languages === LC.OriginLanguages) {
			return;
		}

		LC.OriginLanguages = languages;
		StdHxLanguages.switchTo(languages);
		this.syncLanguagePack();
		// notify
		const languageCode = LC.LanguageCode;
		LC.Listeners.forEach((_, listen) => listen(languageCode, 'languages-change'));
	}
}

const Context = createContext<HxLanguageContext>({} as HxLanguageContext);
Context.displayName = 'HxLanguageContext';

export interface HxLanguageProviderProps {
	languages?: HxLanguages;
	children: ReactNode;
}

export const HxLanguageProvider = (props: HxLanguageProviderProps) => {
	const {languages, children} = props;

	const [context] = useState<HxLanguageContext>(() => new LC(languages));
	useEffect(() => {
		if (languages != null) {
			(context as LC).switchLanguages(languages);
		}
	}, [languages]);

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

export const useHxLanguage = () => useContext(Context);
