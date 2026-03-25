// @ts-expect-error import React
import React, {type DispatchWithoutAction, type ReactNode, useState} from 'react';
import {useForceUpdate} from '../hooks';
import {HxContextDefaults} from './defaults';
import {
	type HxLanguageCode,
	HxLanguageProvider,
	type HxReactLanguageContext,
	type LanguageChangeListener,
	useHxLanguage
} from './language';
import {type HxReactThemeContext, type HxThemeCode, HxThemeProvider, useHxTheme} from './theme';

export interface HxContextProviderProps {
	children: ReactNode;
}

export const HxContextProvider = (props: HxContextProviderProps) => {
	const {children} = props;

	return <HxThemeProvider>
		<HxLanguageProvider>
			<div data-hx-root="">
				{children}
			</div>
		</HxLanguageProvider>
	</HxThemeProvider>;
};

export interface HxContext {
	theme: HxReactThemeContext;
	language: HxReactLanguageContext;
	forceUpdate: DispatchWithoutAction;
}

class DiscreetHxThemeContext implements HxReactThemeContext {
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

	system(): void {
		this.error();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	switchTo(_themeCode: string): void {
		this.error();
	}

	current(): HxThemeCode {
		this.error();
		return HxContextDefaults.themeCode;
	}
}

class DiscreetHxLanguageContext implements HxReactLanguageContext {
	private error(): void {
		console.error('HxLanguageContext not provided, use HxContextProvider or HxLanguageContext to wrap your react nodes first.');
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	on(_listen: LanguageChangeListener): void {
		this.error();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	off(_listen: LanguageChangeListener): void {
		this.error();
	}
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHxContext = (): HxContext => {
	const theme = useHxTheme();
	const language = useHxLanguage();
	const forceUpdate = useForceUpdate();

	const [context] = useState<HxContext>({
		theme: theme ?? new DiscreetHxThemeContext(),
		language: language ?? new DiscreetHxLanguageContext(),
		forceUpdate
	});

	return context;
};
