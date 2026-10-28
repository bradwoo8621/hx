import {HxConsole} from '../../utils';
import type {HxThemeCode} from '../types';
import {HxThemeContext} from './context';
import type {HxReactThemeContext} from './react_context';

export class DiscreetHxThemeContext implements HxReactThemeContext {
	private error(): void {
		HxConsole.error('HxThemeContext not provided, use HxContextProvider or HxThemeProvider to wrap your react nodes first.');
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
		return HxThemeContext.current();
	}

	currentForDOM(): Omit<HxThemeCode, 'system'> {
		this.error();
		return HxThemeContext.currentForDOM();
	}
}
