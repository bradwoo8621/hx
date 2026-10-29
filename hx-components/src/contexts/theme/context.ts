import {HxThemeKey} from '../consts';
import {HxContextDefaults} from '../defaults';
import type {HxThemeCode, HxThemeDOMCode} from '../types';

export class HxThemeContext {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private static readonly SystemThemeChangeHandle = (_e: MediaQueryListEvent) => HxThemeContext.system();
	// created on first use: window.matchMedia must not run at module evaluation, otherwise
	// importing the package on the server throws (window is not defined there)
	private static MediaQuery: MediaQueryList | undefined = (void 0);
	private static CurrentThemeCode: HxThemeCode | undefined = (void 0);
	private static SystemThemeChangeMonitored = false;

	/**
	 * Get the system theme media query, creating it on first use.
	 * The same instance must be reused across calls: change listeners are registered
	 * per MediaQueryList instance, so a fresh instance would make removeEventListener
	 * unable to stop the monitor.
	 */
	private static mediaQuery(): MediaQueryList {
		return HxThemeContext.MediaQuery ??= window.matchMedia('(prefers-color-scheme: dark)');
	}

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	private static enableSystemThemeChangeMonitor(): void {
		if (!HxThemeContext.SystemThemeChangeMonitored) {
			HxThemeContext.SystemThemeChangeMonitored = true;
			HxThemeContext.mediaQuery().addEventListener('change', HxThemeContext.SystemThemeChangeHandle);
		}
	}

	private static disableSystemThemeChangeMonitor(): void {
		if (HxThemeContext.SystemThemeChangeMonitored) {
			HxThemeContext.SystemThemeChangeMonitored = false;
			HxThemeContext.mediaQuery().removeEventListener('change', HxThemeContext.SystemThemeChangeHandle);
		}
	}

	private static doSwitch(themeCode: HxThemeCode, syncToLocalStorage: boolean): void {
		if (themeCode == null) {
			return;
		}
		themeCode = themeCode.trim();
		if (themeCode.length === 0) {
			return;
		}

		let themeCodeInDOM = themeCode;
		switch (themeCode) {
			case 'system': {
				HxThemeContext.enableSystemThemeChangeMonitor();
				if (HxThemeContext.mediaQuery().matches) {
					themeCodeInDOM = 'dark';
				} else {
					themeCodeInDOM = 'light';
				}
				break;
			}
			default: {
				HxThemeContext.disableSystemThemeChangeMonitor();
				break;
			}
		}
		[
			...document.documentElement.querySelectorAll('div[data-hx-root]'),
			...document.documentElement.querySelectorAll('div[data-hx-portal-root]')
		].forEach(element => element.setAttribute('data-hx-theme', themeCodeInDOM));
		if (HxThemeContext.current() !== themeCode) {
			HxThemeContext.CurrentThemeCode = themeCode;
			if (syncToLocalStorage && localStorage.getItem(HxThemeKey) !== themeCode) {
				localStorage.setItem(HxThemeKey, themeCode);
			}
		}
	}

	static initialize(): void {
		const code = localStorage.getItem(HxThemeKey)?.trim() ?? '';
		if (code.length === 0) {
			HxThemeContext.switchToDefault();
		} else {
			HxThemeContext.switchTo(code);
		}
	}

	private static switchToDefault(): void {
		localStorage.removeItem(HxThemeKey);
		HxThemeContext.doSwitch(HxContextDefaults.themeCode, false);
	}

	/**
	 * do switch theme only.
	 */
	static switchTo(themeCode: HxThemeCode): void {
		HxThemeContext.doSwitch(themeCode, true);
	}

	static dark(): void {
		HxThemeContext.switchTo('dark');
	}

	static light(): void {
		HxThemeContext.switchTo('light');
	}

	static system(): void {
		HxThemeContext.switchTo('system');
	}

	static clear(): void {
		HxThemeContext.switchToDefault();
	}

	static current(): HxThemeCode {
		if (HxThemeContext.CurrentThemeCode == null) {
			HxThemeContext.CurrentThemeCode = localStorage.getItem(HxThemeKey)?.trim() || HxContextDefaults.themeCode;
		}
		return HxThemeContext.CurrentThemeCode;
	}

	static currentForDOM(): HxThemeDOMCode {
		let code = HxThemeContext.current();
		if (code === 'system') {
			if (HxThemeContext.mediaQuery().matches) {
				code = 'dark';
			} else {
				code = 'light';
			}
		}
		return code;
	}
}
