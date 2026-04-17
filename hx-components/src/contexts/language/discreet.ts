import type {ReactNode} from 'react';
import {HxContextDefaults} from '../defaults';
import type {HxReactLanguageContext} from './react-context';
import type {HxLanguageCode, LanguageChangeListener} from './types';

export class DiscreetHxLanguageContext implements HxReactLanguageContext {
	private error(): void {
		console.error('HxLanguageContext not provided, use HxContextProvider or HxLanguageContext to wrap your react nodes first.');
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	switchTo(_languageCode: HxLanguageCode): void {
		this.error();
	}

	current(): HxLanguageCode {
		this.error();
		return HxContextDefaults.languageCode;
	}

	get(key: string): ReactNode {
		this.error();
		return key;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	on(_listener: LanguageChangeListener): void {
		this.error();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	off(_listener: LanguageChangeListener): void {
		this.error();
	}
}
