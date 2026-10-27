import type {HxBorderRadius, HxPadding} from '../../types';
import type {HxTablePaginationPosition} from './types';

/**
 * Global configuration settings for table component
 */
export interface HxTableSettings {
	/** render table border or not */
	border?: boolean;
	/** render table border radius or not */
	borderRadius?: HxBorderRadius;
	/** render column grid lines or not */
	columnGridLines?: boolean;
	/** render row grid lines or not */
	rowGridLines?: boolean;
	/** render stripe row background or not */
	stripeRow?: boolean;
	/** render row index or not */
	rowIndex?: boolean;
	/** min width in pixels of row index column */
	rowIndexMinWidth?: number;
	/** max width in pixels of row index column */
	rowIndexMaxWidth?: number;
	/** width in pixels of nested row operator column */
	nestedRowOperatorWidth?: number;
	/** render the nested row hover state or not. when false, render all standard cells when nested cell hovered */
	nestedRowHover?: boolean;
	/** render the nested row hover state independent to standard cells */
	nestedRowIndependentHover?: boolean;
	/** inline direction padding of header cell */
	headerCellIndent?: HxPadding;
	/** inline direction padding of body cell */
	bodyCellIndent?: HxPadding;
	/** i18n translation key for no data row */
	noDataKey?: string;
	/** pagination position in table footer */
	paginationPosition?: HxTablePaginationPosition;
	/**
	 * try to keep page number when page size changed, works only for client-side data.
	 * false then change page number to 1.
	 */
	keepPageNumberWhenSizeChange?: boolean;
}

/**
 * Default configuration values for table component
 */
export const HxTableDefaults: Required<HxTableSettings> = {
	border: true,
	borderRadius: 'md',
	columnGridLines: false,
	rowGridLines: false,
	stripeRow: true,
	rowIndex: false,
	rowIndexMinWidth: 40,
	rowIndexMaxWidth: 48,
	nestedRowOperatorWidth: 32,
	nestedRowHover: false,
	nestedRowIndependentHover: true,
	headerCellIndent: 'sm',
	bodyCellIndent: 'sm',
	noDataKey: '~HxCommon.NoDataTableRow',
	paginationPosition: 'end',
	keepPageNumberWhenSizeChange: true
};

/**
 * Configure global table component settings
 * @param settings - Configuration options to override defaults
 */
export const configHxTable = (settings: HxTableSettings) => {
	HxTableDefaults.border = settings.border ?? HxTableDefaults.border;
	HxTableDefaults.borderRadius = (settings.borderRadius?.trim() as HxBorderRadius) ?? HxTableDefaults.borderRadius;
	HxTableDefaults.columnGridLines = settings.columnGridLines ?? HxTableDefaults.columnGridLines;
	HxTableDefaults.rowGridLines = settings.rowGridLines ?? HxTableDefaults.rowGridLines;
	HxTableDefaults.stripeRow = settings.stripeRow ?? HxTableDefaults.stripeRow;
	HxTableDefaults.rowIndex = settings.rowIndex ?? HxTableDefaults.rowIndex;
	HxTableDefaults.rowIndexMinWidth = Math.max(0, settings.rowIndexMinWidth ?? HxTableDefaults.rowIndexMinWidth);
	HxTableDefaults.rowIndexMaxWidth = Math.max(0, settings.rowIndexMaxWidth ?? HxTableDefaults.rowIndexMaxWidth);
	HxTableDefaults.nestedRowOperatorWidth = Math.max(0, settings.nestedRowOperatorWidth ?? HxTableDefaults.nestedRowOperatorWidth);
	HxTableDefaults.nestedRowHover = settings.nestedRowHover ?? HxTableDefaults.nestedRowHover;
	HxTableDefaults.nestedRowIndependentHover = settings.nestedRowIndependentHover ?? HxTableDefaults.nestedRowIndependentHover;
	HxTableDefaults.headerCellIndent = (settings.headerCellIndent?.trim() as HxPadding) || HxTableDefaults.headerCellIndent;
	HxTableDefaults.bodyCellIndent = (settings.bodyCellIndent?.trim() as HxPadding) || HxTableDefaults.bodyCellIndent;
	HxTableDefaults.noDataKey = settings.noDataKey?.trim() || HxTableDefaults.noDataKey;
	HxTableDefaults.paginationPosition = (settings.paginationPosition?.trim() as HxTablePaginationPosition) || HxTableDefaults.paginationPosition;
	HxTableDefaults.keepPageNumberWhenSizeChange = settings.keepPageNumberWhenSizeChange ?? HxTableDefaults.keepPageNumberWhenSizeChange;
};
