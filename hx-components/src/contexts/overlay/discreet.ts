import type {HxObject, HxOverlayInstanceHandle, HxOverlayUniqueId} from '../../types';
import type {HxOverlayContext} from './overlay';

/**
 * Fallback implementation of HxOverlayContext
 * Used as default context value when HxOverlayProvider is not present in the component tree
 * All methods log an error warning users to wrap their app with HxOverlayProvider
 */
export class DiscreetHxOverlayContext implements HxOverlayContext {
	/**
	 * Log common error message when context is not properly provided
	 */
	private error(): void {
		console.error('HxOverlayContext not provided, use HxContextProvider or HxOverlayProvider to wrap your react nodes first.');
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
	show<T extends object>(_id: HxOverlayUniqueId, _$model: HxObject<T>, _callback?: (handle: HxOverlayInstanceHandle) => void): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onShow<T extends object>(_listener: (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => void): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	offShow<T extends object>(_listener: (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => void): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	hide(_handle: HxOverlayInstanceHandle): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onHide(_listener: (handle: HxOverlayInstanceHandle) => void): void {
		this.error();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	offHide(_listener: (handle: HxOverlayInstanceHandle) => void): void {
		this.error();
	}
}
