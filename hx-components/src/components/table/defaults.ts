import type {HxBoxBorderRadius} from '../box';

/**
 * Global configuration settings for table component
 */
export interface HxTableSettings {
	border?: boolean;
	borderRadius?: HxBoxBorderRadius;
	/** ignored when there is column or row span */
	columnGridLines?: boolean;
	rowIndex?: boolean;
	/** min width in pixels of row index column */
	rowIndexMinWidth?: number;
}

/**
 * Default configuration values for table component
 */
export const HxTableDefaults: Required<HxTableSettings> = {
	border: true,
	borderRadius: 'md',
	columnGridLines: false,
	rowIndex: false,
	rowIndexMinWidth: 40
};

/**
 * Configure global table component settings
 * @param settings - Configuration options to override defaults
 */
export const configHxTable = (settings: HxTableSettings) => {
	HxTableDefaults.border = settings.border ?? HxTableDefaults.border;
	HxTableDefaults.borderRadius = (settings.borderRadius?.trim() as HxBoxBorderRadius) ?? HxTableDefaults.borderRadius;
	HxTableDefaults.columnGridLines = settings.columnGridLines ?? HxTableDefaults.columnGridLines;
	HxTableDefaults.rowIndex = settings.rowIndex ?? HxTableDefaults.rowIndex;
	HxTableDefaults.rowIndexMinWidth = Math.max(0, settings.rowIndexMinWidth ?? HxTableDefaults.rowIndexMinWidth);

};
