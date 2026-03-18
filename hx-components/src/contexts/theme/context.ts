import {HxContextDefaults} from '../defaults';
import {HxThemeKey} from './consts';
import type {HxThemeCode} from './types';

export class HxThemeContext {
	private static readonly SystemThemeChangeHandle = (_e: MediaQueryListEvent) => {
		HxThemeContext.switchTo('system');
	};
	private static readonly MediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	private static SystemThemeChangeMonitored = false;
	private static ThemeCode: HxThemeCode = localStorage.getItem(HxThemeKey)?.trim() || HxContextDefaults.themeCode;

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

	/**
	 * do switch theme only.
	 */
	static switchTo(themeCode: HxThemeCode): void {
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
		localStorage.setItem(HxThemeKey, themeCode);
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
		HxThemeContext.disableSystemThemeChangeMonitor();
		[
			...document.documentElement.querySelectorAll('div[data-hx-root]'),
			...document.documentElement.querySelectorAll('div[data-hx-portal-root]')
		].forEach(element => element.removeAttribute('data-hx-theme'));
		localStorage.removeItem(HxThemeKey);

		// switch to default
		HxThemeContext.switchTo(HxContextDefaults.themeCode);
	}

	static current(): HxThemeCode {
		return HxThemeContext.ThemeCode;
	}
}
