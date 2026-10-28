import {HxThemeKey} from '../consts';
import {HxContextDefaults} from '../defaults';
import type {HxThemeCode, HxThemeDOMCode} from '../types';

export class HxThemeContext {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private static readonly SystemThemeChangeHandle = (_e: MediaQueryListEvent) => HxThemeContext.system();
	private static readonly MediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	private static CurrentThemeCode: HxThemeCode | undefined = (void 0);
	private static SystemThemeChangeMonitored = false;

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	private static enableSystemThemeChangeMonitor(): void {
		if (!HxThemeContext.SystemThemeChangeMonitored) {
			HxThemeContext.SystemThemeChangeMonitored = true;
			HxThemeContext.MediaQuery.addEventListener('change', HxThemeContext.SystemThemeChangeHandle);
		}
	}

	private static disableSystemThemeChangeMonitor(): void {
		if (HxThemeContext.SystemThemeChangeMonitored) {
			HxThemeContext.SystemThemeChangeMonitored = false;
			HxThemeContext.MediaQuery.removeEventListener('change', HxThemeContext.SystemThemeChangeHandle);
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
				if (HxThemeContext.MediaQuery.matches) {
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
			if (HxThemeContext.MediaQuery.matches) {
				code = 'dark';
			} else {
				code = 'light';
			}
		}
		return code;
	}
}
