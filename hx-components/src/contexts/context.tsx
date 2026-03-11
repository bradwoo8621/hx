// @ts-ignore
import React, {type ReactNode} from 'react';
import {type HxThemeContext, HxThemeProvider, useHxTheme} from './theme-context';

export const HxContextProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	return <HxThemeProvider>
		<div data-hx-root="">
			{children}
		</div>
	</HxThemeProvider>;
};

export interface HxContext {
	theme: HxThemeContext;
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
}

export const useHxContext = (): HxContext => {
	const theme = useHxTheme();

	return {
		theme: theme ?? new DiscreetHxThemeContext()
	};
};
