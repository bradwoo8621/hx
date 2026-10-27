import type {HTMLAttributes, ReactNode} from 'react';
import type {HxContext} from '../../contexts';
import type {
	HxCommonProps,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAtomicAttributes,
	HxOmittedDataAttributes,
	HxPadding,
	HxStdSingleFieldProps,
	WithRequired
} from '../../types';
import type {HxPaginationData, HxPaginationProps} from '../pagination';

export interface HxTableHeaderCell {
	/** Table header title */
	title?: ReactNode;
	/**
	 * Minimum column width, number will be treated as pixels.
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-columns
	 */
	minWidth?: string | number;
	/**
	 * Default column width, number will be treated as pixels.
	 * A string containing a CSS function call (minmax, fit-content, calc, ...), ending with "fr",
	 * or containing "auto" is used as the grid track size as-is,
	 * any other string is used as the minimum size of a "minmax(width, auto)" track.
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-columns
	 */
	width?: string | number;
	/**
	 * Maximum column width, number will be treated as pixels.
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-columns
	 */
	maxWidth?: string | number;
	/** inline direction padding */
	indent?: HxPadding;
	/**
	 * When the header cell spans multiple rows, cells that start in a row other than the first must specify a row number.
	 * Row numbers start at 1.
	 */
	row?: number;
	/**
	 * Usually not required; the component renders cells in declaration order.
	 * If specified, the component renders according to the given value. Column numbers start at 1.
	 */
	col?: number;
	/** Number of rows the header cell spans; only required when >= 2 */
	rows?: number;
	/** Number of columns the header cell spans; only required when >= 2 */
	cols?: number;
}

/** The header must form a matrix; every cell must be declared as occupied */
export type HxTableHeaderCells = Array<HxTableHeaderCell>;

export interface HxTableColumnCell {
	content?: ReactNode;
	/** inline direction padding */
	indent?: HxPadding;
	/**
	 * When the column cell spans multiple rows, cells that start in a row other than the first must specify a row number.
	 * Row numbers start at 1.
	 */
	row?: number;
	/**
	 * Usually not required; the component renders cells in declaration order.
	 * If specified, the component renders according to the given value. Column numbers start at 1.
	 */
	col?: number;
	/** Number of rows the column cell spans; only required when >= 2 */
	rows?: number;
	/** Number of columns the column cell spans; only required when >= 2 */
	cols?: number;
}

export interface HxTableNestedCell {
	nested: true;
	content?: ReactNode;
}

/**
 * full line cell will grab all columns automatically,
 * and it is always sticky to left.
 */
export interface HxTableGroupFullLineCell {
	fullLine: true;
	/**
	 * When the column cell spans multiple rows, cells that start in a row other than the first must specify a row number.
	 * Row numbers start at 1.
	 *
	 * Note the row value is restarted from 1, not matter how many rows in standard cells
	 */
	row?: number;
	content?: ReactNode;
}

export type HxTableGroupCells = [
		HxTableColumnCell | HxTableGroupFullLineCell,
	...Array<HxTableColumnCell | HxTableGroupFullLineCell>
];

/**
 * for predefined column cells,
 * - with at least one table column cell
 * - and at most one table nested cell.
 *   the nested cell will span all columns except first table column
 *   which show the expand/collapse operator, maybe share with the row index column
 */
export type HxTableColumnCells =
	| [HxTableColumnCell, ...Array<HxTableColumnCell>]
	| [HxTableColumnCell, ...Array<HxTableColumnCell>, HxTableNestedCell];
/**
 * for runtime-computing column cells, for some specific data row,
 * there might be a group row after the standard row.
 * the group row's columns will follow the table column grid,
 * which contains the first column (row index or expand/collapse operator)
 *
 * group cells only available on function cells declaration because usually they are not for each row
 */
export type HxTableRtColumnCells =
	| HxTableColumnCells
	| [HxTableColumnCell, ...Array<HxTableColumnCell>, HxTableGroupCells]
	| [HxTableColumnCell, ...Array<HxTableColumnCell>, HxTableNestedCell, HxTableGroupCells];
export type HxTableColumnCellsFunc = <T extends object, R extends object>(
	$model: HxObject<T>, array: Array<HxObject<R>>, row: HxObject<R>, rowIndex: number
) => HxTableRtColumnCells;

export type HxTablePaginationPosition = 'start' | 'end';

export interface HxTablePaginationProps<T extends object> extends Omit<HxPaginationProps<T>, 'onPageSizeChange' | 'onPageNumberChange' | 'onPageChanged'> {
	/** Pagination position on table footer, default 'end' */
	position?: HxTablePaginationPosition;
	/**
	 * try to keep page number when page size changed, works only for client-side data.
	 * false then change page number to 1.
	 */
	keepPageNumberWhenSizeChange?: boolean;
}

export type HxTableSortMethod = 'asc' | 'desc';

export interface HxTableSortColumn {
	/** Key identifying this column in the sort criteria; defaults to the rendered `text` when omitted. */
	key?: string;
	text: ReactNode;
	/** Initial sort direction applied for this column. */
	default?: HxTableSortMethod;
}

export type HxTableSortProps = Array<HxTableSortColumn>;

export type HxTableFilterMethod = 'match' | 'unmatch' | 'and' | 'or';

export interface HxTableFilterColumn {
	/** Key identifying this column in the filter criteria; defaults to the rendered `text` when omitted. */
	key?: string;
	text: ReactNode;
	range?: boolean;
	/**
	 * Default filter method when omitted, inferred from {@link range}:
	 * - "and" when {@link range} is true,
	 * - "match" when {@link range} is false.
	 */
	defaultMethod?: HxTableFilterMethod;
	/**
	 * Default filter value(s):
	 * - when {@link range} is true, exactly two values defining an interval:
	 *   - method "and": match when value is within [first, second],
	 *   - method "or": match when value is outside [first, second].
	 * - when {@link range} is false, a single value compared with "match"/"unmatch",
	 *   or multiple values combined with "and"/"or".
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	defaultValue?: any;
}

export interface HxTableFilterProps {
	columns: Array<HxTableFilterColumn>;
	/** enable global fuzzy filter or not */
	fuzzy?: boolean;
	/**
	 * Whether to split the fuzzy keyword into sub-terms.
	 * When enabled, words are split on space (" ") and comma (","): space acts as OR and comma as AND,
	 * with OR taking precedence over AND.
	 * e.g.
	 * - "a b"   -> a or b
	 * - "a,b"   -> a and b
	 * - "a b,c" -> a or (b and c)
	 */
	splitKeywords?: boolean;
}

export type HxTablePaginationCriteria = HxPaginationData;

export interface HxTableSortColumnCriteria {
	key: string | ReactNode;
	method: HxTableSortMethod;
}

export type HxTableSortCriteria = Array<HxTableSortColumnCriteria>;

export interface HxTableFilterColumnCriteria {
	key: string | ReactNode;
	/** @see {@link HxTableFilterColumn.defaultMethod} */
	method?: HxTableFilterMethod;
	/** @see {@link HxTableFilterColumn.defaultValue} */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value?: any;
}

export type HxTableFilterCriteria = Array<HxTableFilterColumnCriteria>;

export interface HxTableDataCriteria {
	type: 'page-size-change' | 'page-number-change' | 'sort-change' | 'filter-change';
	pagination?: HxTablePaginationCriteria;
	sort?: HxTableSortCriteria;
	filter?: HxTableFilterCriteria;
}

/**
 * Invoked when pagination, sort, or filter criteria change.
 * Resolve to accept the change (the table body re-renders with the new criteria);
 * reject to abort it (the change is rolled back).
 */
export type HxTableOnCriteriaChanged<T extends object> = ($model: HxObject<T>, data: HxTableDataCriteria, context: HxContext) => Promise<void>;
/**
 * Prepares the data the table body renders, by applying filter, sort, and pagination.
 * - For server-side data: after the rows are retrieved (initially or via {@link HxTableOnCriteriaChanged}),
 *   this runs during the rendering phase. It is usually not required — leave it unset on the table props —
 *   and is only for extra per-render processing.
 * - For client-side data: all rows live in memory (the model) and are never mutated by filter, sort, or
 *   pagination, so this function derives the appropriate set of rows to render from the in-memory data.
 *
 * On both sides the table additionally applies pagination from the pagination model values
 * (array length, page number, page size): it returns the rows of the requested page, or the last page
 * when the page number exceeds the data. e.g. with page size 10:
 * 1. 25 items, page 3 -> the last 5 items.
 * 2. 25 items, page 5 -> the last 5 items.
 * 3. 10 items, page 2 -> the whole 10 items.
 * 4. 10 items, page 1 -> the whole 10 items.
 *
 * This suits both scenarios:
 * - server-side: only the current page of data is in memory,
 * - client-side: the whole data set is in memory.
 */
export type HxTableDataRenderPreparer<T extends object> = <E extends object>($model: HxObject<T>, data: Omit<HxTableDataCriteria, 'type'>, context: HxContext) => Array<E>;

export type ExcludedTableDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-table';

export interface HxExtTableProps<T extends object, PT extends object = T>
	extends HxStdSingleFieldProps<T>, HxCommonProps<ExcludedTableDataAttrNames, T> {
	/** show column grid line or not */
	columnGridLines?: boolean;
	/** show row grid line or not */
	rowGridLines?: boolean;
	/** show stripe row background or not */
	stripeRow?: boolean;
	/** max scroll height, footer excluded */
	scrollHeight?: number;
	/**
	 * it is recommended that headers order follows inline (horizontal) start to end, and block (vertical) start to end.
	 * otherwise the order will be auto-computed by component
	 */
	headers: HxTableHeaderCells;
	/**
	 * it is recommended that body cells order follows inline (horizontal) start to end, and block (vertical) start to end.
	 * otherwise the order will be auto-computed by component
	 */
	columns: HxTableColumnCells | HxTableColumnCellsFunc;
	/** fixed columns in start */
	fixedStartColumns?: number;
	/** fixed columns in end */
	fixedEndColumns?: number;
	/** has row index column or not */
	rowIndex?: boolean;
	/** min width in pixels of row index column */
	rowIndexMinWidth?: number;
	/** max width in pixels of row index column */
	rowIndexMaxWidth?: number;
	/**
	 * has nested row or not, if {@link columns} defined by {@link HxTableColumnCellsFunc},
	 * must identify this value to true when there is nested cell contained by returned columns.
	 */
	nestedRow?: boolean;
	/**
	 * nested row expand/collapse operator will share the row index column if could,
	 * otherwise will create an operator row as first column with this width
	 */
	nestedRowOperatorWidth?: number;
	/** render the nested row hover state or not. when false, render all standard cells when nested cell hovered */
	nestedRowHover?: boolean;
	/** render the nested row hover state independent to standard cells */
	nestedRowIndependentHover?: boolean;
	/**
	 * When in client-side mode, totalItems and totalPages of the pagination data must be provided before rendering.
	 */
	pagination?: HxTablePaginationProps<PT>;
	/** Whether to enable sorting; see {@link HxTableSortProps}. */
	sort?: HxTableSortProps;
	/** Whether to enable filtering; see {@link HxTableFilterProps}. */
	filter?: HxTableFilterProps;
	/**
	 * Called when pagination, sort, or filter criteria change. Required to activate
	 * pagination, sort, and filter — without it those props take no effect.
	 */
	onCriteriaChanged?: HxTableOnCriteriaChanged<T>;
	/**
	 * Prepares the rows to render. See {@link HxTableDataRenderPreparer}.
	 */
	renderPrepare?: HxTableDataRenderPreparer<T>;
	/**
	 * accept object data as a single row, to simulate the form rendering.
	 * often used together with "ignoreHeaders: true".
	 * When the data is an empty array, nothing is rendered (the no-data row is not shown either).
	 */
	renderAsForm?: boolean;
	/** ignore header, not {@link headers} property are still required */
	ignoreHeaders?: boolean;
	/** i18n translation key or React node for no data row */
	noDataKey?: ReactNode;
}

export type OmittedTableHTMLProps = HxOmittedAtomicAttributes | 'content';

export type HxTableProps<T extends object, PT extends object = T> =
	& HxExtTableProps<T, PT>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedTableHTMLProps, T>;

export type HxTableComputedHeaderCell =
	& WithRequired<HxTableHeaderCell, 'col' | 'cols' | 'row' | 'rows'>
	& {
	rowIndex?: true;
	assistEmpty?: true;
	nestedRowOperator?: true;

	inlineEndOfRow: boolean;
	blockEndOfRow: boolean;
};
export type HxTableComputedHeaderCells = Array<HxTableComputedHeaderCell>;

export type HxTableComputedStdBodyCell =
	& WithRequired<HxTableColumnCell, 'col' | 'cols' | 'row' | 'rows'>
	& { rowIndex?: true; assistEmpty?: true; nestedRowOperator?: true; }
	& { inlineEndOfRow: boolean; blockEndOfRow: boolean; };
export type HxTableComputedNestedBodyCell =
	& HxTableNestedCell
	& Required<Pick<HxTableColumnCell, 'col' | 'cols' | 'row' | 'rows'>>
	& { nested: true; }
	& { inlineEndOfRow: boolean; blockEndOfRow: boolean; };
export type HxTableComputedGroupBodyCell =
	& WithRequired<HxTableColumnCell, 'col' | 'cols' | 'row' | 'rows'>
	& { assistEmpty?: true; }
	& { group: true; fullLine?: boolean; }
	& { inlineEndOfRow: boolean; blockEndOfRow: boolean; };
export type HxTableComputedBodyCell =
	| HxTableComputedStdBodyCell
	| HxTableComputedNestedBodyCell
	| HxTableComputedGroupBodyCell;
/**
 * - One {@link HxTableComputedStdBodyCell} at least,
 * - More {@link HxTableComputedStdBodyCell}s following, optional,
 * - One {@link HxTableComputedNestedBodyCell} following, optional,
 * - One or more {@link HxTableComputedGroupBodyCell} following, optional.
 */
export type HxTableComputedBodyCells = Array<HxTableComputedBodyCell>;

export interface HxTableLayout {
	headers: HxTableComputedHeaderCells;
	headerColumnCount: number;
	headerRowCount: number;
	/** only computed when given "columns" is not a function */
	columns?: HxTableComputedBodyCells;
	/**
	 * only computed when given "columns" is not a function, column count for an element of array.
	 * must be same as {@link headerColumnCount}, otherwise is incorrect
	 */
	columnColumnCount?: number;
	/** only computed when given "columns" is not a function, row count for an element of array */
	columnRowCount?: number;
}
