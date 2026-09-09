import type {HTMLAttributes, ReactNode} from 'react';
import type {
	HxBorderRadius,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxPadding,
	HxStdSingleFieldProps,
	HxWidthConstrainedProps,
	WithRequired
} from '../../types';

export type HxTableColumnFixable = 'start' | 'end';

export interface HxTableHeaderCell {
	/** Table header title */
	title?: ReactNode;
	/** Tooltip title */
	tipTitle?: ReactNode;
	/** Tooltip content */
	tipContent?: ReactNode;
	/** Minimum column width, in px */
	minWidth?: number;
	/** Default column width, in px */
	width?: number;
	/** Maximum column width, in px */
	maxWidth?: number;
	fixed?: HxTableColumnFixable;
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

export type HxTableColumnCells = [HxTableColumnCell, ...Array<HxTableColumnCell>];
export type HxTableColumnCellsFunc = <T extends object, R extends object>($model: HxObject<T>, array: Array<HxObject<R>>, row: HxObject<R>, rowIndex: number) => HxTableColumnCells;

export type HxTableBorderRadius = HxBorderRadius;

export interface HxExtTableProps<T extends object>
	extends HxStdSingleFieldProps<T>, HxWidthConstrainedProps {
	border?: boolean;
	borderRadius?: HxTableBorderRadius;
	columnGridLines?: boolean;
	rowGridLines?: boolean;
	secondaryRowGridLines?: boolean;
	stripeRow?: boolean;
	maxBodyHeight?: number;

	/**
	 * it is recommended that headers order follows inline (horizontal) start to end, and block (vertical) start to end.
	 * otherwise the order will be auto-computed by component
	 */
	headers: HxTableHeaderCells;
	columns: HxTableColumnCells | HxTableColumnCellsFunc;
	/** has row index column or not */
	rowIndex?: boolean;
	/** min width in pixels of row index column */
	rowIndexMinWidth?: number;

	/**
	 * accept object data as a single row, to simulate the form rendering.
	 * often used together with "ignoreHeaders: true"
	 */
	renderAsForm?: boolean;
	ignoreHeaders?: boolean;

	/** i18n translation key or React node for no data row */
	noDataKey?: ReactNode;
}

export type OmittedTableHTMLProps = HxOmittedAttributes | 'content' | 'children';

export type HxTableProps<T extends object> =
	& HxExtTableProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedTableHTMLProps, T>;

export type HxTableComputedHeaderCell =
	& WithRequired<HxTableHeaderCell, 'col' | 'cols' | 'row' | 'rows'>
	& {
	rowIndex?: true;
	assistEmpty?: true;

	inlineEndOfRow: boolean;
	blockEndOfRow: boolean;
};
export type HxTableComputedHeaderCells = Array<HxTableComputedHeaderCell>;

export type HxTableComputedBodyCell =
	& WithRequired<HxTableColumnCell, 'col' | 'cols' | 'row' | 'rows'>
	& {
	rowIndex?: true;
	assistEmpty?: true;

	inlineEndOfRow: boolean;
	blockEndOfRow: boolean;
};
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
