// @ts-expect-error import React
import React, {type CSSProperties, Fragment, type MouseEvent} from 'react';
import {HxTableDefaults} from './defaults';
import {HxTableBodyAssistEmptyCell} from './table-body-assist-empty-cell';
import {HxTableBodyCellProvider} from './table-body-cell-provider';
import {HxTableBodyRowIndexCell} from './table-body-row-index-cell';
import {HxTableBodyStdCell} from './table-body-std-cell';
import type {
	HxTableComputedBodyCell,
	HxTableComputedGroupBodyCell,
	HxTableComputedNestedBodyCell,
	HxTableComputedStdBodyCell
} from './types';

/** props of a single data row of the table body */
export interface HxTableBodyRowProps {
	/** row data object, used as the nested row expansion key and the $model of cell content interpolation */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;

	/** computed body cells of the row, each carrying its grid coordinates and kind flags */
	cells: Array<{
		cell: HxTableComputedBodyCell;
		rowCss: string; colCss: string;
		startRow: number; endRow: number; startCol: number; endCol: number;
	}>;
	/** zero-based index of the row in the current data array */
	arrayRowIndex: number;
	/** offset added to the array row index for the displayed row index number, e.g. the pagination start index */
	rowIndexOffset: number;
	/** whether the row is even in the current data array, for stripe styling */
	evenRow: boolean;
	/** whether the row is the last one in the current data array */
	lastRow: boolean;
	/** last column index fixed to the left, cells ending at, or before it stick to the left */
	lastFixedColumnToLeft: number;
	/** first column index fixed to the right, cells starting at or beyond it stick to the right, Infinity when none */
	firstFixedColumnToRight: number;

	/** render column grid lines on cells or not */
	columnGridLines: boolean;
	/** render row grid lines on cells or not */
	rowGridLines: boolean;
	/** render stripe row background or not */
	stripeRow: boolean;

	/** mouse enter handler forwarded to every cell of the row */
	onMouseEnter: (ev: MouseEvent<HTMLDivElement>) => void;
	/** mouse leave handler forwarded to every cell of the row */
	onMouseLeave: (ev: MouseEvent<HTMLDivElement>) => void;
}

export const HxTableBodyRow = (props: HxTableBodyRowProps) => {
	const {
		data: rowData,
		cells,
		arrayRowIndex, rowIndexOffset, evenRow, lastRow,
		lastFixedColumnToLeft, firstFixedColumnToRight,
		columnGridLines, rowGridLines, stripeRow,
		onMouseEnter, onMouseLeave
	} = props;

	return <Fragment>
		{cells.map(({cell, rowCss, colCss, startRow, endRow, startCol, endCol}, cellIndex) => {
			// noinspection PointlessBooleanExpressionJS
			const nestedCell = (cell as HxTableComputedNestedBodyCell).nested === true;
			// noinspection PointlessBooleanExpressionJS
			const groupCell = (cell as HxTableComputedGroupBodyCell).group === true;
			const fullLineGroupCell = (cell as HxTableComputedGroupBodyCell).fullLine === true;
			const stickyAtLeft = nestedCell || fullLineGroupCell || endCol <= lastFixedColumnToLeft;
			const lastStickyAtLeft = endCol === lastFixedColumnToLeft;
			const stickyAtRight = startCol >= firstFixedColumnToRight;
			const firstStickyAtRight = startCol === firstFixedColumnToRight;
			const sticky = stickyAtLeft || stickyAtRight;
			const attrs = {
				'data-hx-table-row-number': arrayRowIndex + 1,
				'data-hx-table-cell-start-row': startRow,
				'data-hx-table-cell-end-row': endRow,
				'data-hx-table-cell-start-column': startCol,
				'data-hx-table-cell-end-column': endCol,
				'data-hx-table-cell-sticky': sticky ? '' : (void 0),
				'data-hx-table-cell-sticky-left': stickyAtLeft ? '' : (void 0),
				'data-hx-table-cell-last-sticky-left': lastStickyAtLeft ? '' : (void 0),
				'data-hx-table-cell-sticky-right': stickyAtRight ? '' : (void 0),
				'data-hx-table-cell-first-sticky-right': firstStickyAtRight ? '' : (void 0),
				'data-hx-padding-x': (cell as HxTableComputedStdBodyCell).indent ?? HxTableDefaults.bodyCellIndent,
				'data-hx-table-cell-row-grid-line': (cell.blockEndOfRow && rowGridLines) ? '' : (void 0),
				'data-hx-table-cell-column-grid-line': columnGridLines ? '' : (void 0),
				'data-hx-table-cell-block-end': cell.blockEndOfRow ? '' : (void 0),
				'data-hx-table-cell-inline-end': cell.inlineEndOfRow ? '' : (void 0),
				'data-hx-table-cell-stripe-row': stripeRow ? '' : (void 0),
				'data-hx-table-cell-odd-row': evenRow ? (void 0) : '',
				'data-hx-table-cell-even-row': evenRow ? '' : (void 0),
				'data-hx-table-cell-last-row': lastRow ? '' : (void 0),
				style: {
					'--hx-table-cell-row-this': rowCss,
					'--hx-table-cell-column-this': colCss,
					'--hx-table-cell-sticky': sticky ? 'sticky' : (void 0),
					'--hx-table-cell-z-index': sticky ? '1' : (void 0)
				} as CSSProperties,
				onMouseEnter, onMouseLeave
			};
			if ((cell as HxTableComputedStdBodyCell).rowIndex || (cell as HxTableComputedStdBodyCell).nestedRowOperator) {
				return <HxTableBodyCellProvider key="row-index-cell">
					<HxTableBodyRowIndexCell rowData={rowData} cell={cell}
					                         rowIndexOffset={rowIndexOffset} arrayRowIndex={arrayRowIndex}
					                         domAttrs={attrs}/>
				</HxTableBodyCellProvider>;
			} else if ((cell as HxTableComputedStdBodyCell | HxTableComputedGroupBodyCell).assistEmpty) {
				return <HxTableBodyCellProvider key={cellIndex}>
					<HxTableBodyAssistEmptyCell rowData={rowData} groupCell={groupCell} domAttrs={attrs}/>
				</HxTableBodyCellProvider>;
			} else {
				return <HxTableBodyCellProvider key={cellIndex}>
					<HxTableBodyStdCell rowData={rowData} cell={cell}
					                    groupCell={groupCell} fullLineGroupCell={fullLineGroupCell}
					                    nestedCell={nestedCell}
					                    domAttrs={attrs}/>
				</HxTableBodyCellProvider>;
			}
		})}
	</Fragment>;
};
