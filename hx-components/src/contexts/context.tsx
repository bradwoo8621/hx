// @ts-ignore
import React, {type ReactNode} from 'react';
import {HxContextDefaults} from './defaults';
import {
	type HxLanguageCode,
	type HxLanguageContext,
	HxLanguageProvider,
	type HxLanguages,
	type LanguageChangeListener,
	useHxLanguage
} from './language-context';
import {type HxThemeCode, type HxThemeContext, HxThemeProvider, useHxTheme} from './theme-context';

export interface HxContextProviderProps {
	languages?: HxLanguages;
	children: ReactNode;
}

export const HxContextProvider = (props: HxContextProviderProps) => {
	const {languages, children} = props;

	return <HxThemeProvider>
		<HxLanguageProvider languages={languages}>
			<div data-hx-root="">
				{children}
			</div>
		</HxLanguageProvider>
	</HxThemeProvider>;
};

export interface HxContext {
	theme: HxThemeContext;
	language: HxLanguageContext;
}

class DiscreetHxThemeContext implements HxThemeContext {
	private error(): void {
		console.error('HxThemeContext not provided, use HxContextProvider or HxThemeProvider to wrap your react nodes first.');
	}

	clear(): void {
		this.error();
	}

	dark(): void {
		this.error();
	}

	light(): void {
		this.error();
	}

	switchTo(_themeCode: string): void {
		this.error();
	}

	system(): void {
		this.error();
	}

	current(): HxThemeCode {
		this.error();
		return HxContextDefaults.themeCode;
	}
}

class DiscreetHxLanguageContext implements HxLanguageContext {
	private error(): void {
		console.error('HxLanguageContext not provided, use HxContextProvider or HxLanguageContext to wrap your react nodes first.');
	}

	switchTo(_languageCode: HxLanguageCode): void {
		this.error();
	}

	current(): HxLanguageCode {
		this.error();
		return HxContextDefaults.languageCode;
	}

	get(key: string): ReactNode {
		this.error();
		return key;
	}

	on(_listen: LanguageChangeListener): void {
		this.error();
	}

	off(_listen: LanguageChangeListener): void {
		this.error();
	}
}

export const useHxContext = (): HxContext => {
	const theme = useHxTheme();
	const language = useHxLanguage();

	return {
		theme: theme ?? new DiscreetHxThemeContext(),
		language: language ?? new DiscreetHxLanguageContext()
	};
};
