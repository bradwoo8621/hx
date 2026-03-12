// @ts-ignore
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import {HxContextDefaults} from './defaults';

const HxLanguageKey = 'HX-LANGUAGE';

export type HxLanguageCode = string;

export interface HxLanguageContext {
	/**
	 * switch to given language
	 * @param languageCode follows JavaScript language standard
	 */
	switchTo(languageCode: HxLanguageCode): void;
	/** get current language code */
	current(): HxLanguageCode;
}

class LC implements HxLanguageContext {
	private static readonly SwitchTo = (languageCode: HxLanguageCode): void => {
		[
			...document.documentElement.querySelectorAll('div[data-hx-root]'),
			...document.documentElement.querySelectorAll('div[data-hx-portal-root]')
		].forEach(element => element.setAttribute('data-hx-language', languageCode));
		localStorage.setItem(HxLanguageKey, languageCode);
	};

	private static LanguageCode: HxLanguageCode;

	constructor() {
		LC.LanguageCode = localStorage.getItem(HxLanguageKey)?.trim() || HxContextDefaults.languageCode;
	}

	switchTo(languageCode: HxLanguageCode): void {
		LC.LanguageCode = languageCode;
		LC.SwitchTo(languageCode);
	}

	current(): HxLanguageCode {
		return LC.LanguageCode;
	}
}

const Context = createContext<HxLanguageContext>({} as HxLanguageContext);
Context.displayName = 'HxLanguageContext';

export const HxLanguageProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [context] = useState<HxLanguageContext>(() => new LC());

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

export const useHxLanguage = () => useContext(Context);
