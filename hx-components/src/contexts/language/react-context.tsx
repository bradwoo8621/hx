// @ts-ignore
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import {HxLanguageContext} from './context';
import type {HxLanguageCode, LanguageChangeListener} from './types';

export interface HxReactLanguageContext {
	switchTo(languageCode: HxLanguageCode): void;
	current(): HxLanguageCode;
	on(listener: LanguageChangeListener): void;
	off(listener: LanguageChangeListener): void;
	get(key: string): ReactNode;
}

class HxRLC implements HxReactLanguageContext {
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

	get(key: string): React.ReactNode {
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

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

/**
 * Hook for accessing internationalization context
 * Use in components to call internationalization related methods
 */
export const useHxLanguage = () => useContext(Context);
