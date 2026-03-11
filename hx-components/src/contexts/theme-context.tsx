// @ts-ignore
import React, {createContext, type ReactNode, useContext, useState} from 'react';

export interface ThemeContext {
	/** start system theme monitor */
	system: () => void;
	/** will quit system theme change monitor */
	light: () => void;
	/** will quit system theme change monitor */
	dark: () => void;
	/** will quit system theme change monitor */
	switchTo: (themeCode: string) => void;
	/** clear theme, recover to default */
	clear: () => void;
}

class TC implements ThemeContext {
	private static readonly SwitchTo = (themeCode: string): void => {
		[
			...document.documentElement.querySelectorAll('div[data-hx-root]'),
			...document.documentElement.querySelectorAll('div[data-hx-portal-root]')
		].forEach(element => element.setAttribute('data-hx-theme', themeCode));
	};
	private static ClearTheme = () => {
		[
			...document.documentElement.querySelectorAll('div[data-hx-root]'),
			...document.documentElement.querySelectorAll('div[data-hx-portal-root]')
		].forEach(element => element.removeAttribute('data-hx-theme'));
	};
	private static readonly SystemThemeChangeHandle = (e: MediaQueryListEvent) => {
		if (e.matches) {
			TC.SwitchTo('dark');
		} else {
			TC.SwitchTo('light');
		}
	};

	private static readonly MediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	private static SystemThemeChangeMonitored = false;

	system(): void {
		if (!TC.SystemThemeChangeMonitored) {
			TC.SystemThemeChangeMonitored = true;
			if (TC.MediaQuery.matches) {
				TC.SwitchTo('dark');
			} else {
				TC.SwitchTo('light');
			}
			TC.MediaQuery.addEventListener('change', TC.SystemThemeChangeHandle);
		}
	}

	dark(): void {
		this.switchTo('dark');
	}

	light(): void {
		this.switchTo('light');
	}

	switchTo(themeCode: string): void {
		if (TC.SystemThemeChangeMonitored) {
			TC.SystemThemeChangeMonitored = false;
			TC.MediaQuery.removeEventListener('change', TC.SystemThemeChangeHandle);
		}
		TC.SwitchTo(themeCode);
	}

	clear(): void {
		TC.ClearTheme();
	}
}

const Context = createContext<ThemeContext>({} as ThemeContext);
Context.displayName = 'HxThemeContext';

export const ThemeProvider = (props: { children?: ReactNode }) => {
	const {children} = props;

	const [context] = useState<ThemeContext>(() => new TC());

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

export const useTheme = () => useContext(Context);
