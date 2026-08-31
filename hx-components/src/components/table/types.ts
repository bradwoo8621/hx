import type {HTMLAttributes, ReactNode} from 'react';
import type {
	HxBorderRadius,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxStdSingleFieldProps,
	HxWidthConstrainedProps
} from '../../types';

export type HxTableColumnFixable = 'start' | 'end';

export interface HxTableHeaderCell {
	title?: ReactNode;
	tipTitle?: ReactNode;
	tipContent?: ReactNode;
	minWidth?: number;
	width?: number;
	maxWidth?: number;
	fixed?: HxTableColumnFixable;
	rows?: number;
	cols?: number;
}

export interface HxTableColumn {
	/** Unique identifier for the table column */
	mark?: string;
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
	headers: Array<HxTableHeaderCell>;
	columns: HxTableColumns;
	rowIndex?: boolean;
}

export type OmittedTableHTMLProps = HxOmittedAttributes | 'content' | 'children';

export type HxTableProps<T extends object> =
	& HxExtTableProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedTableHTMLProps, T>;
