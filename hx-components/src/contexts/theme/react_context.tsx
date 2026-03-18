// @ts-ignore
import React, {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import {HxThemeContext} from './context';
import type {HxThemeCode} from './types';

export interface HxReactThemeContext {
	/** will quit system theme change monitor */
	switchTo(themeCode: HxThemeCode): void;
	/** will quit system theme change monitor */
	light(): void;
	/** will quit system theme change monitor */
	dark(): void;
	/** start system theme monitor */
	system(): void;
	/** clear theme, recover to default */
	clear(): void;
	/** get current theme code */
	current(): HxThemeCode;
}

class HxRTC implements HxReactThemeContext {
	switchTo(themeCode: HxThemeCode): void {
		HxThemeContext.switchTo(themeCode);
	}

	light(): void {
		HxThemeContext.light();
	}

	dark(): void {
		HxThemeContext.dark();
	}

	system(): void {
		HxThemeContext.system();
	}

	clear(): void {
		HxThemeContext.clear();
	}

	current(): HxThemeCode {
		return HxThemeContext.current();
	}
}

const Context = createContext<HxReactThemeContext>({} as HxReactThemeContext);
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

	const [context] = useState<HxReactThemeContext>(() => new HxRTC());
	useEffect(() => {
		const themeCode = context.current();
		context.switchTo(themeCode);
	}, []);

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

export const useHxTheme = () => useContext(Context);
