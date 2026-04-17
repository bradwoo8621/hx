import {HxContextDefaults} from '../defaults';
import type {HxReactThemeContext} from './react_context';
import type {HxThemeCode} from './types';

export class DiscreetHxThemeContext implements HxReactThemeContext {
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
