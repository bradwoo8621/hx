// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import {HxLanguageKey} from '../consts';
import type {HxLanguageCode} from '../types';
import {HxLanguageContext} from './context';
import type {LanguageChangeListener} from './types';

export interface HxReactLanguageContext {
	initialize(): void;
	switchTo(languageCode: HxLanguageCode): void;
	current(): HxLanguageCode;
	on(listener: LanguageChangeListener): void;
	off(listener: LanguageChangeListener): void;
	get(key: string): ReactNode;
}

class HxRLC implements HxReactLanguageContext {
	initialize(): void {
		HxLanguageContext.initialize();
	}

	switchTo(languageCode: HxLanguageCode): void {
		HxLanguageContext.switchTo(languageCode);
	}

	current(): HxLanguageCode {
		return HxLanguageContext.current();
	}

	on(listener: LanguageChangeListener): void {
		HxLanguageContext.on(listener);
	}

	off(listener: LanguageChangeListener): void {
		HxLanguageContext.off(listener);
	}

	get(key: string): ReactNode {
		return HxLanguageContext.get(key);
	}
}

/** Internationalization context instance */
const Context = createContext<HxReactLanguageContext>({} as HxReactLanguageContext);
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
