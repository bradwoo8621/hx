import type {HxPadding} from '../../types';
import type {HxBoxBorderRadius} from '../box';

/**
 * Global configuration settings for table component
 */
export interface HxTableSettings {
	/** render table border or not */
	border?: boolean;
	/** render table border radius or not */
	borderRadius?: HxBoxBorderRadius;
	/** render column grid lines or not */
	columnGridLines?: boolean;
	/** render row grid lines or not */
	rowGridLines?: boolean;
	/** render in-row horizontal grid lines or not */
	secondaryRowGridLines?: boolean;
	/** render stripe row background or not */
	stripeRow?: boolean;
	/** render row index or not */
	rowIndex?: boolean;
	/** min width in pixels of row index column */
	rowIndexMinWidth?: number;
	/** inline direction padding of header cell */
	headerCellIndent?: HxPadding;
	/** inline direction padding of body cell */
	bodyCellIndent?: HxPadding;
	/** i18n translation key for no data row */
	noDataKey?: string;
}

/**
 * Default configuration values for table component
 */
export const HxTableDefaults: Required<HxTableSettings> = {
	border: true,
	borderRadius: 'md',
	columnGridLines: false,
	rowGridLines: false,
	secondaryRowGridLines: false,
	stripeRow: true,
	rowIndex: false,
	rowIndexMinWidth: 40,
	headerCellIndent: 'sm',
	bodyCellIndent: 'sm',
	noDataKey: '~HxCommon.NoDataTableRow'
};

/**
 * Configure global table component settings
 * @param settings - Configuration options to override defaults
 */
export const configHxTable = (settings: HxTableSettings) => {
	HxTableDefaults.border = settings.border ?? HxTableDefaults.border;
	HxTableDefaults.borderRadius = (settings.borderRadius?.trim() as HxBoxBorderRadius) ?? HxTableDefaults.borderRadius;
	HxTableDefaults.columnGridLines = settings.columnGridLines ?? HxTableDefaults.columnGridLines;
	HxTableDefaults.rowGridLines = settings.rowGridLines ?? HxTableDefaults.rowGridLines;
	HxTableDefaults.secondaryRowGridLines = settings.secondaryRowGridLines ?? HxTableDefaults.secondaryRowGridLines;
	HxTableDefaults.stripeRow = settings.stripeRow ?? HxTableDefaults.stripeRow;
	HxTableDefaults.rowIndex = settings.rowIndex ?? HxTableDefaults.rowIndex;
	HxTableDefaults.rowIndexMinWidth = Math.max(0, settings.rowIndexMinWidth ?? HxTableDefaults.rowIndexMinWidth);
	HxTableDefaults.headerCellIndent = (settings.headerCellIndent?.trim() as HxPadding) || HxTableDefaults.headerCellIndent;
	HxTableDefaults.bodyCellIndent = (settings.bodyCellIndent?.trim() as HxPadding) || HxTableDefaults.bodyCellIndent;
	HxTableDefaults.noDataKey = settings.noDataKey?.trim() || HxTableDefaults.noDataKey;
};
