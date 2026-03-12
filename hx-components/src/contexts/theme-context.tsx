// @ts-ignore
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import {HxContextDefaults} from './defaults';

const HxThemeKey = 'HX-THEME';

export type HxThemeCode = 'light' | 'dark' | string;

export interface HxThemeContext {
	/** start system theme monitor */
	system(): void;
	/** will quit system theme change monitor */
	light(): void;
	/** will quit system theme change monitor */
	dark(): void;
	/** will quit system theme change monitor */
	switchTo(themeCode: HxThemeCode): void;
	/** clear theme, recover to default */
	clear(): void;
	/** get current theme code */
	current(): HxThemeCode;
}

class TC implements HxThemeContext {
	private static readonly SwitchTo = (themeCode: HxThemeCode): void => {
		[
			...document.documentElement.querySelectorAll('div[data-hx-root]'),
			...document.documentElement.querySelectorAll('div[data-hx-portal-root]')
		].forEach(element => element.setAttribute('data-hx-theme', themeCode));
		localStorage.setItem(HxThemeKey, themeCode);
	};
	private static ClearTheme = () => {
		[
			...document.documentElement.querySelectorAll('div[data-hx-root]'),
			...document.documentElement.querySelectorAll('div[data-hx-portal-root]')
		].forEach(element => element.removeAttribute('data-hx-theme'));
		localStorage.removeItem(HxThemeKey);
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
	private static ThemeCode: HxThemeCode;

	constructor() {
		TC.ThemeCode = localStorage.getItem(HxThemeKey)?.trim() || HxContextDefaults.themeCode;
	}

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

	private disableSystemThemeChangeMonitor(): void {
		if (TC.SystemThemeChangeMonitored) {
			TC.SystemThemeChangeMonitored = false;
			TC.MediaQuery.removeEventListener('change', TC.SystemThemeChangeHandle);
		}
	}

	switchTo(themeCode: HxThemeCode): void {
		this.disableSystemThemeChangeMonitor();
		TC.SwitchTo(themeCode);
	}

	clear(): void {
		this.disableSystemThemeChangeMonitor();
		TC.ClearTheme();
	}

	current(): HxThemeCode {
		return TC.ThemeCode;
	}
}

const Context = createContext<HxThemeContext>({} as HxThemeContext);
Context.displayName = 'HxThemeContext';

/**
 * Provide a context to its children, enabling them to call functions exposed by the theme context to switch or clear the theme.
 * The predefined theme codes are `"light"` and `"dark"`. Additionally, custom themes can be defined via CSS by the user.
 *
 * In theory, all hx DOM nodes reside within either `div[data-hx-root]` or `div[data-hx-portal-root]`.
 * If a theme code is designated:
 * - `div[data-hx-root][data-hx-theme=dark]` indicates the dark theme is active.
 * - `div[data-hx-root][data-hx-theme=light]` indicates the light theme is active.
 * - `div[data-hx-root][data-hx-theme=custom]` indicates a custom theme is active.
 * The same logic applies to the `div[data-hx-portal-root]` element for the `data-hx-theme` attribute.
 * When the theme is cleared, the `data-hx-theme` attribute is removed from
 * both `div[data-hx-root]` and `div[data-hx-portal-root]`.
 *
 * Based on the above implementation, switching the theme does not trigger a re-render of child nodes.
 * It only controls CSS by modifying the attributes of the root nodes.
 *
 * Note that this will only affect `div[data-hx-root]` and `div[data-hx-portal-root]`, not the entire page.
 *
 * @example
 * ```tsx
 * <HxThemeProvider>
 *     ...
 * </HxThemeProvider>
 *
 * const SomeChild = () => {
 *     // in child node
 *     const theme = useTheme();
 *
 *     const switchTheme = () => {
 *         // monitor the system theme change, auto switch to "dark" or "light"
 *         theme.system();
 *         // switch to "dark", and disable the system theme change monitor
 *         theme.dark();
 *         // switch to "light", and disable the system theme change monitor
 *         theme.light();
 *         // switch to specific theme, and disable the system theme change monitor
 *         theme.switchTo("theme-code");
 *         // clear theme, and disable the system theme change monitor
 *         theme.clear();
 *     }
 *
 *     return <button onClick={switchTheme}/>
 * }
 * ```
 */
export const HxThemeProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [context] = useState<HxThemeContext>(() => new TC());

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

export const useHxTheme = () => useContext(Context);
