import type {HTMLAttributes, ReactNode} from 'react';
import type {
	HxBorderRadius,
	HxHtmlElementProps,
	HxOmittedAttributes,
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
	/**
	 * When the header spans multiple rows, cells that start in a row other than the first must specify a row number.
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

export interface HxTableColumn {
	content?: ReactNode;
}

export type HxTableColumns = [HxTableColumn, ...Array<HxTableColumn>];

export type HxTableBorderRadius = HxBorderRadius;

export interface HxExtTableProps<T extends object>
	extends HxStdSingleFieldProps<T>, HxWidthConstrainedProps {
	border?: boolean;
	borderRadius?: HxTableBorderRadius;
	columnGridLines?: boolean;
	maxBodyHeight?: number;

	/** headers order must follow inline (horizontal) start to end, and block (vertical) start to end */
	headers: HxTableHeaderCells;
	columns: HxTableColumns;
	/** has row index column or not */
	rowIndex?: boolean;
	/** min width in pixels of row index column */
	rowIndexMinWidth?: number;
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
};
export type HxTableComputedHeaderCells = Array<HxTableComputedHeaderCell>;

export interface HxTableLayout {
	header: HxTableComputedHeaderCells;
}
