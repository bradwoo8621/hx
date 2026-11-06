import type {HxBorderRadius, HxPadding, WithPartial} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from '../popup';
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
	/** pagination position in table footer */
	paginationPosition?: HxTablePaginationPosition;
	/**
	 * try to keep page number when page size changed, works only for client-side data.
	 * false then change page number to 1.
	 */
	keepPageNumberWhenSizeChange?: boolean;
	/** enable global fuzzy filter or not */
	fuzzyFilter?: boolean;
	/** Z-index base for sort popup layers */
	sortPopupZIndex?: number;
	/** Minimum spacing between the sort popup edge and viewport boundary */
	sortPopupGapToEdge?: number;
	/** Z-index base for filter popup layers */
	filterPopupZIndex?: number;
	/** Minimum spacing between the filter popup edge and viewport boundary */
	filterPopupGapToEdge?: number;
	/** i18n translation key for no data row */
	noDataKey?: string;
	/** i18n translation key for fuzzy input placeholder */
	fuzzyPlaceholderKey?: string;
	/** i18n translation key for sort asc */
	sortAscKey?: string;
	/** i18n translation key for sort desc */
	sortDescKey?: string;
	/** i18n translation key for sort popup confirm button */
	sortPopupConfirmKey?: string;
	/** i18n translation key for sort popup cancel button */
	sortPopupCancelKey?: string;
	/** i18n translation key for filter match operator */
	filterMatchKey?: string;
	/** i18n translation key for filter not-match operator */
	filterNotMatchKey?: string;
	/** i18n translation key for filter between operator */
	filterBetweenKey?: string;
	/** i18n translation key for filter not-between operator */
	filterNotBetweenKey?: string;
	/** i18n translation key for filter popup confirm button */
	filterPopupConfirmKey?: string;
	/** i18n translation key for filter popup cancel button */
	filterPopupCancelKey?: string;
	/** i18n translation key for clear all criteria (fuzzy not included) button */
	clearCriteriaKey?: string;
}

/**
 * Default configuration values for table component
 */
export const HxTableDefaults: WithPartial<Required<HxTableSettings>, 'sortPopupZIndex' | 'sortPopupGapToEdge' | 'filterPopupZIndex' | 'filterPopupGapToEdge'> = {
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
	paginationPosition: 'end',
	keepPageNumberWhenSizeChange: true,
	fuzzyFilter: false,
	noDataKey: '~HxCommon.TableNoData',
	fuzzyPlaceholderKey: '~HxCommon.TableFuzzyPlaceholder',
	sortAscKey: '~HxCommon.SortAsc',
	sortDescKey: '~HxCommon.SortDesc',
	sortPopupConfirmKey: '~HxCommon.ApplyButton',
	sortPopupCancelKey: '~HxCommon.DiscardButton',
	filterMatchKey: '~HxCommon.TableFilterMatch',
	filterNotMatchKey: '~HxCommon.TableFilterNotMatch',
	filterBetweenKey: '~HxCommon.TableFilterBetween',
	filterNotBetweenKey: '~HxCommon.TableFilterNotBetween',
	filterPopupConfirmKey: '~HxCommon.ApplyButton',
	filterPopupCancelKey: '~HxCommon.DiscardButton',
	clearCriteriaKey: '~HxCommon.TableClearCriteria'
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
	HxTableDefaults.paginationPosition = (settings.paginationPosition?.trim() as HxTablePaginationPosition) || HxTableDefaults.paginationPosition;
	HxTableDefaults.keepPageNumberWhenSizeChange = settings.keepPageNumberWhenSizeChange ?? HxTableDefaults.keepPageNumberWhenSizeChange;
	HxTableDefaults.fuzzyFilter = settings.fuzzyFilter ?? HxTableDefaults.fuzzyFilter;
	HxTableDefaults.sortPopupZIndex = settings.sortPopupZIndex != null ? amendPopupZIndex(settings.sortPopupZIndex) : (void 0);
	HxTableDefaults.sortPopupGapToEdge = settings.sortPopupGapToEdge != null ? amendPopupGapToEdge(settings.sortPopupGapToEdge) : (void 0);
	HxTableDefaults.filterPopupZIndex = settings.filterPopupZIndex != null ? amendPopupZIndex(settings.filterPopupZIndex) : (void 0);
	HxTableDefaults.filterPopupGapToEdge = settings.filterPopupGapToEdge != null ? amendPopupGapToEdge(settings.filterPopupGapToEdge) : (void 0);
	HxTableDefaults.noDataKey = settings.noDataKey?.trim() || HxTableDefaults.noDataKey;
	HxTableDefaults.fuzzyPlaceholderKey = settings.fuzzyPlaceholderKey?.trim() || HxTableDefaults.fuzzyPlaceholderKey;
	HxTableDefaults.sortAscKey = settings.sortAscKey?.trim() || HxTableDefaults.sortAscKey;
	HxTableDefaults.sortDescKey = settings.sortDescKey?.trim() || HxTableDefaults.sortDescKey;
	HxTableDefaults.sortPopupConfirmKey = settings.sortPopupConfirmKey?.trim() || HxTableDefaults.sortPopupConfirmKey;
	HxTableDefaults.sortPopupCancelKey = settings.sortPopupCancelKey?.trim() || HxTableDefaults.sortPopupCancelKey;
	HxTableDefaults.filterMatchKey = settings.filterMatchKey?.trim() || HxTableDefaults.filterMatchKey;
	HxTableDefaults.filterNotMatchKey = settings.filterNotMatchKey?.trim() || HxTableDefaults.filterNotMatchKey;
	HxTableDefaults.filterBetweenKey = settings.filterBetweenKey?.trim() || HxTableDefaults.filterBetweenKey;
	HxTableDefaults.filterNotBetweenKey = settings.filterNotBetweenKey?.trim() || HxTableDefaults.filterNotBetweenKey;
	HxTableDefaults.filterPopupConfirmKey = settings.filterPopupConfirmKey?.trim() || HxTableDefaults.filterPopupConfirmKey;
	HxTableDefaults.filterPopupCancelKey = settings.filterPopupCancelKey?.trim() || HxTableDefaults.filterPopupCancelKey;
	HxTableDefaults.clearCriteriaKey = settings.clearCriteriaKey?.trim() || HxTableDefaults.clearCriteriaKey;
};
