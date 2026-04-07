/** delegate of console */
export interface HxConsoleDelegate extends Console {
	get logEnabled(): boolean;
	set logEnabled(enabled: boolean);
	get debugEnabled(): boolean;
	set debugEnabled(enabled: boolean);
}

const ConsoleDelegateIndicators = {
	logEnabled: false,
	debugEnabled: false,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
	noop: (..._args: Array<any>): void => {
	}
};

// @ts-expect-error ignore the type check
const ConsoleDelegate: HxConsoleDelegate = new Proxy<Console>(console, {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	get(target: Console, p: string | symbol, receiver: any) {
		if (p === 'logEnabled') {
			return ConsoleDelegateIndicators.logEnabled;
		} else if (p === 'debugEnabled') {
			return ConsoleDelegateIndicators.debugEnabled;
		} else if (p === 'log') {
			if (ConsoleDelegateIndicators.logEnabled) {
				return target.log;
			} else {
				return ConsoleDelegateIndicators.noop;
			}
		} else if (p === 'debug') {
			if (ConsoleDelegateIndicators.debugEnabled) {
				return target.debug;
			} else {
				return ConsoleDelegateIndicators.noop;
			}
		} else {
			return Reflect.get(target, p, receiver);
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	set(target: Console, p: string | symbol, newValue: any, receiver: any) {
		if (p === 'logEnabled') {
			ConsoleDelegateIndicators.logEnabled = !!newValue;
			return true;
		} else if (p === 'debugEnabled') {
			ConsoleDelegateIndicators.debugEnabled = !!newValue;
			return true;
		} else {
			return Reflect.set(target, p, newValue, receiver);
		}
	}
});

export const HxConsole = ConsoleDelegate;

export class DeviceCheck {
	static checkMac(): boolean {
		// noinspection JSDeprecatedSymbols
		const isMacOS = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
		return !isMacOS;
	}

	/**
	 * Check if current device is iOS or iPadOS (including iPad running on Mac Intel)
	 * Handles the special case of iPadOS reporting as MacIntel with touch support
	 */
	static checkIOSDevice(): boolean {
		// noinspection JSDeprecatedSymbols
		const platform = window.navigator?.platform;
		if (platform == null) {
			return false;
		}
		// Match iOS devices
		if (/iP(ad|hone|od)/.test(platform)) {
			return true;
		}
		// Match iPadOS running on Mac (reports as MacIntel with multitouch support)
		return platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
	}
}