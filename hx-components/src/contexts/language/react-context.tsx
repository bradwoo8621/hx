// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import {HxLanguageKey} from '../consts';
import type {HxLanguageCode} from '../types';
import {HxLanguageContext} from './context';
import type {LanguageChangeListener} from './types';

export interface HxReactLanguageContext {
	/**
	 * Initialize the language from persisted settings, falling back to the default language
	 */
	initialize(): void;

	/**
	 * Switch to the given language and notify listeners
	 * @param languageCode - Target language code
	 */
	switchTo(languageCode: HxLanguageCode): void;

	/**
	 * Get the currently active language code
	 */
	current(): HxLanguageCode;

	/**
	 * Register a language change listener
	 * @param listener - Callback function called with the language code and change type
	 */
	on(listener: LanguageChangeListener): void;

	/**
	 * Remove a language change listener
	 * @param listener - Previously registered listener function
	 */
	off(listener: LanguageChangeListener): void;

	/**
	 * Get internationalized content by key, supports nested paths and returns the key itself when not found
	 * @param key - Key of the content to get
	 */
	get(key: string): ReactNode;
}

class HxRLC implements HxReactLanguageContext {
	/** @inheritdoc */
	initialize(): void {
		HxLanguageContext.initialize();
	}

	/** @inheritdoc */
	switchTo(languageCode: HxLanguageCode): void {
		HxLanguageContext.switchTo(languageCode);
	}

	/** @inheritdoc */
	current(): HxLanguageCode {
		return HxLanguageContext.current();
	}

	/** @inheritdoc */
	on(listener: LanguageChangeListener): void {
		HxLanguageContext.on(listener);
	}

	/** @inheritdoc */
	off(listener: LanguageChangeListener): void {
		HxLanguageContext.off(listener);
	}

	/** @inheritdoc */
	get(key: string): ReactNode {
		return HxLanguageContext.get(key);
	}
}

/** Internationalization context instance */
const Context = createContext<HxReactLanguageContext>((void 0) as unknown as HxReactLanguageContext);
Context.displayName = 'HxLanguageContext';

/**
 * Property interface for HxLanguageProvider component
 */
export interface HxLanguageProviderProps {
	/** Child components */
	children: ReactNode;
}

/**
 * Internationalization context provider component
 * Wraps application root component to provide internationalization functionality
 */
export const HxLanguageProvider = (props: HxLanguageProviderProps) => {
	const {children} = props;

	const [context] = useState<HxReactLanguageContext>(() => new HxRLC());
	useEffect(() => {
		context.initialize();

		const onStorageChange = (ev: StorageEvent) => {
			if (ev.storageArea !== localStorage) {
				return;
			}
			const key = ev.key?.trim() ?? '';
			const newValue = ev.newValue?.trim() ?? '';
			if (key.length === 0) {
				// cleared
				context.initialize();
			} else if (key === HxLanguageKey) {
				if (newValue.length === 0) {
					// cleared
					context.initialize();
				} else {
					context.switchTo(newValue);
				}
			}
		};
		window.addEventListener('storage', onStorageChange);
		return () => {
			window.removeEventListener('storage', onStorageChange);
		};
	}, [context]);

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

/**
 * Hook for accessing internationalization context
 * Use in components to call internationalization related methods
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxLanguage = () => useContext(Context);
