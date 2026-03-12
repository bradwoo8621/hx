// @ts-ignore
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import {HxContextDefaults} from './defaults';

const HxLanguageKey = 'HX-LANGUAGE';

export type HxLanguageCode = string;

export type LanguageChangeListener = (languageCode: HxLanguageCode) => void;

export interface HxLanguageContext {
	/**
	 * switch to given language
	 * @param languageCode follows JavaScript language standard
	 */
	switchTo(languageCode: HxLanguageCode): void;
	/** get current language code */
	current(): HxLanguageCode;
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
	private static Listeners: Map<LanguageChangeListener, void> = new Map();

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
			LC.Listeners.forEach((_, listen) => listen(languageCode));
		}
	}

	current(): HxLanguageCode {
		return LC.LanguageCode;
	}

	on(listen: LanguageChangeListener): void {
		LC.Listeners.set(listen);
	}

	off(listen: LanguageChangeListener): void {
		LC.Listeners.delete(listen);
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
