import type {HxTooltipInstanceHandle} from '../../types';
import {HxConsole} from '../../utils';
import type {HxTooltipContext, HxTooltipShowOptions} from './context';

/**
 * Fallback implementation of HxTooltipContext
 * Used as default context value when HxTooltipProvider is not present in the component tree
 * All methods log an error warning users to wrap their app with HxTooltipProvider
 */
export class DiscreetHxTooltipContext implements HxTooltipContext {
	/**
	 * Log common error message when context is not properly provided
	 */
	private error(): void {
		HxConsole.error('HxTooltipContext not provided, use HxContextProvider or HxTooltipProvider to wrap your react nodes first.');
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
	emit(_type: string, ..._args: any[]): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
	on(_type: string, _listener: (...args: any[]) => void): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
	off(_type: string, _listener: (...args: any[]) => void): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	show<T extends object>(_options: HxTooltipShowOptions<T>, _callback: (handle: HxTooltipInstanceHandle) => void): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onShow<T extends object>(_listener: (options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void) => void): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	offShow<T extends object>(_listener: (options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void) => void): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	hide(_handle: HxTooltipInstanceHandle): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onHide(_listener: (handle: HxTooltipInstanceHandle) => void): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	offHide(_listener: (handle: HxTooltipInstanceHandle) => void): void {
		this.error();
	}
}
