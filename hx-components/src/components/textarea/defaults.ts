import type {HxTextareaResize} from './types';

/**
 * Global configuration settings for HxTextarea component
 * These settings can be overridden globally at app initialization
 */
export interface HxTextareaSettings {
	/** Whether to automatically select all text when textarea receives focus (default: true) */
	selectAll?: boolean;
	/** Whether to update model only when textarea loses focus (default: false, updates on each change with debounce) */
	emitChangeOnBlur?: boolean;
	/**
	 * Debounce delay in milliseconds for model updates when emitChangeOnBlur is false
	 * Default: 150ms, negative values will be clamped to 0
	 */
	emitChangeDelay?: number;
	/** Default number of visible text rows (default: 5, minimum 2) */
	rows?: number;
	/** Resize behavior for textarea (default: 'none') - controls whether user can resize the component */
	resize?: HxTextareaResize;
}

/**
 * Default configuration values for HxTextarea
 * These can be modified using configHxTextarea() at runtime
 */
export const HxTextareaDefaults: Required<HxTextareaSettings> = {
	selectAll: true,
	emitChangeOnBlur: false,
	emitChangeDelay: 150,
	rows: 5,
	resize: 'none'
};

/**
 * Configure global default settings for all HxTextarea instances
 * @param settings - Partial settings to override defaults
 */
export const configHxTextarea = (settings: HxTextareaSettings) => {
	HxTextareaDefaults.selectAll = settings.selectAll ?? HxTextareaDefaults.selectAll;
	HxTextareaDefaults.emitChangeOnBlur = settings.emitChangeOnBlur ?? HxTextareaDefaults.emitChangeOnBlur;
	HxTextareaDefaults.emitChangeDelay = settings.emitChangeDelay ?? HxTextareaDefaults.emitChangeDelay;

	// Ensure delay is non-negative
	if (HxTextareaDefaults.emitChangeDelay < 0) {
		HxTextareaDefaults.emitChangeDelay = 0;
	}

	HxTextareaDefaults.rows = settings.rows ?? HxTextareaDefaults.rows;
	// Ensure minimum 2 rows (browser default is too small for usability)
	if (HxTextareaDefaults.rows < 1) {
		HxTextareaDefaults.rows = 1;
	}

	HxTextareaDefaults.resize = settings.resize?.trim() as HxTextareaResize || HxTextareaDefaults.resize;
};
