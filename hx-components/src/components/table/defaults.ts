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
	/** i18n translation key for toolbar global search placeholder */
	toolbarSearchPlaceholderKey?: string;
	/** i18n translation key for toolbar sort panel title */
	toolbarSortKey?: string;
	/** i18n translation key for toolbar filter panel title */
	toolbarFilterKey?: string;
	/** i18n translation key for toolbar add button */
	toolbarAddKey?: string;
	/** i18n translation key for toolbar reset button */
	toolbarResetKey?: string;
	/** i18n translation key for toolbar apply button */
	toolbarApplyKey?: string;
	/** i18n translation key for toolbar clear all button */
	toolbarClearAllKey?: string;
	/** i18n translation key for the unchanged panel draft hint */
	toolbarNoChangesKey?: string;
	/** i18n translation key for the changed panel draft hint */
	toolbarUnsavedChangesKey?: string;
	/** i18n translation key for the empty sort draft hint */
	toolbarNoSortKey?: string;
	/** i18n translation key for the empty filter draft hint */
	toolbarNoFilterKey?: string;
	/** i18n translation key for ascending sort direction */
	toolbarAscKey?: string;
	/** i18n translation key for descending sort direction */
	toolbarDescKey?: string;
	/** i18n translation key for the filter "match" method */
	toolbarFilterMatchKey?: string;
	/** i18n translation key for the filter "unmatch" method */
	toolbarFilterUnmatchKey?: string;
	/** i18n translation key for the filter "and" method */
	toolbarFilterAndKey?: string;
	/** i18n translation key for the filter "or" method */
	toolbarFilterOrKey?: string;
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
	toolbarSearchPlaceholderKey: '~HxCommon.TableToolbarSearchPlaceholder',
	toolbarSortKey: '~HxCommon.TableToolbarSort',
	toolbarFilterKey: '~HxCommon.TableToolbarFilter',
	toolbarAddKey: '~HxCommon.TableToolbarAdd',
	toolbarResetKey: '~HxCommon.TableToolbarReset',
	toolbarApplyKey: '~HxCommon.TableToolbarApply',
	toolbarClearAllKey: '~HxCommon.TableToolbarClearAll',
	toolbarNoChangesKey: '~HxCommon.TableToolbarNoChanges',
	toolbarUnsavedChangesKey: '~HxCommon.TableToolbarUnsavedChanges',
	toolbarNoSortKey: '~HxCommon.TableToolbarNoSort',
	toolbarNoFilterKey: '~HxCommon.TableToolbarNoFilter',
	toolbarAscKey: '~HxCommon.TableToolbarAsc',
	toolbarDescKey: '~HxCommon.TableToolbarDesc',
	toolbarFilterMatchKey: '~HxCommon.TableToolbarFilterMatch',
	toolbarFilterUnmatchKey: '~HxCommon.TableToolbarFilterUnmatch',
	toolbarFilterAndKey: '~HxCommon.TableToolbarFilterAnd',
	toolbarFilterOrKey: '~HxCommon.TableToolbarFilterOr',
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
	HxTableDefaults.toolbarSearchPlaceholderKey = settings.toolbarSearchPlaceholderKey?.trim() || HxTableDefaults.toolbarSearchPlaceholderKey;
	HxTableDefaults.toolbarSortKey = settings.toolbarSortKey?.trim() || HxTableDefaults.toolbarSortKey;
	HxTableDefaults.toolbarFilterKey = settings.toolbarFilterKey?.trim() || HxTableDefaults.toolbarFilterKey;
	HxTableDefaults.toolbarAddKey = settings.toolbarAddKey?.trim() || HxTableDefaults.toolbarAddKey;
	HxTableDefaults.toolbarResetKey = settings.toolbarResetKey?.trim() || HxTableDefaults.toolbarResetKey;
	HxTableDefaults.toolbarApplyKey = settings.toolbarApplyKey?.trim() || HxTableDefaults.toolbarApplyKey;
	HxTableDefaults.toolbarClearAllKey = settings.toolbarClearAllKey?.trim() || HxTableDefaults.toolbarClearAllKey;
	HxTableDefaults.toolbarNoChangesKey = settings.toolbarNoChangesKey?.trim() || HxTableDefaults.toolbarNoChangesKey;
	HxTableDefaults.toolbarUnsavedChangesKey = settings.toolbarUnsavedChangesKey?.trim() || HxTableDefaults.toolbarUnsavedChangesKey;
	HxTableDefaults.toolbarNoSortKey = settings.toolbarNoSortKey?.trim() || HxTableDefaults.toolbarNoSortKey;
	HxTableDefaults.toolbarNoFilterKey = settings.toolbarNoFilterKey?.trim() || HxTableDefaults.toolbarNoFilterKey;
	HxTableDefaults.toolbarAscKey = settings.toolbarAscKey?.trim() || HxTableDefaults.toolbarAscKey;
	HxTableDefaults.toolbarDescKey = settings.toolbarDescKey?.trim() || HxTableDefaults.toolbarDescKey;
	HxTableDefaults.toolbarFilterMatchKey = settings.toolbarFilterMatchKey?.trim() || HxTableDefaults.toolbarFilterMatchKey;
	HxTableDefaults.toolbarFilterUnmatchKey = settings.toolbarFilterUnmatchKey?.trim() || HxTableDefaults.toolbarFilterUnmatchKey;
	HxTableDefaults.toolbarFilterAndKey = settings.toolbarFilterAndKey?.trim() || HxTableDefaults.toolbarFilterAndKey;
	HxTableDefaults.toolbarFilterOrKey = settings.toolbarFilterOrKey?.trim() || HxTableDefaults.toolbarFilterOrKey;
	HxTableDefaults.paginationPosition = (settings.paginationPosition?.trim() as HxTablePaginationPosition) || HxTableDefaults.paginationPosition;
	HxTableDefaults.keepPageNumberWhenSizeChange = settings.keepPageNumberWhenSizeChange ?? HxTableDefaults.keepPageNumberWhenSizeChange;
};
