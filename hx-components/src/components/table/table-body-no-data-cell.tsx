// @ts-expect-error import React
import React, {type CSSProperties, type MouseEvent, type ReactNode, useRef} from 'react';
import {useHxHierarchyBound} from '../../contexts';
import type {HxPadding} from '../../types';
import {HxLabel} from '../label';

/** props of the no-data row of the table body, a single cell spanning all columns */
export interface HxTableBodyNoDataCellProps {
	/** start column index of the cell */
	startCol: number;
	/** end column index of the cell */
	endCol: number;
	/** start row index of the cell */
	startRow: number;
	/** end row index of the cell */
	endRow: number;

	/** grid-track value of the cell columns, e.g. "1" or "1 / span 3", for --hx-table-cell-column-this */
	colCss: string;
	/** grid-track value of the cell rows, e.g. "2" or "2 / span 2", for --hx-table-cell-row-this */
	rowCss: string;
	/** inline direction padding of the cell, defaults to the body cell indent */
	paddingX?: HxPadding;

	/** render column grid lines on the cell or not */
	columnGridLines: boolean;
	/** render row grid lines on the cell or not */
	rowGridLines: boolean;
	/** render stripe row background on the cell or not */
	stripeRow: boolean;

	/** mouse enter handler of the cell */
	onMouseEnter: (ev: MouseEvent<HTMLDivElement>) => void;
	/** mouse leave handler of the cell */
	onMouseLeave: (ev: MouseEvent<HTMLDivElement>) => void;

	/** i18n translation key (or content) of the no-data label */
	noDataKey?: ReactNode;
}

export const HxTableBodyNoDataCell = (props: HxTableBodyNoDataCellProps) => {
	const {
		startRow, endRow, startCol, endCol,
		colCss, rowCss, paddingX,
		columnGridLines, rowGridLines, stripeRow,
		onMouseEnter, onMouseLeave,
		noDataKey
	} = props;

	const cellRef = useRef<HTMLDivElement>(null);
	useHxHierarchyBound(cellRef);

	const cellStyle: CSSProperties = {
		// @ts-expect-error ignore the style name check
		'--hx-table-cell-row-this': rowCss,
		'--hx-table-cell-column-this': colCss,
		// no data row always sticky to left
		'--hx-table-cell-sticky': 'sticky',
		'--hx-table-cell-sticky-left': '0px',
		'--hx-table-cell-z-index': '1'
	};

	return <div data-hx-table-body-cell="" data-hx-table-body-no-data-cell=""
	            data-hx-table-row-number="1"
	            data-hx-table-cell-start-row={startRow}
	            data-hx-table-cell-end-row={endRow}
	            data-hx-table-cell-start-column={startCol}
	            data-hx-table-cell-end-column={endCol}
	            data-hx-padding-x={paddingX}
	            data-hx-table-cell-row-grid-line={rowGridLines ? '' : (void 0)}
	            data-hx-table-cell-column-grid-line={columnGridLines ? '' : (void 0)}
	            data-hx-table-cell-block-end="" data-hx-table-cell-inline-end=""
	            data-hx-table-cell-stripe-row={stripeRow ? '' : (void 0)} data-hx-table-cell-odd-row=""
	            data-hx-table-cell-last-row=""
	            data-hx-table-cell-sticky="" data-hx-table-cell-sticky-left=""
	            data-hx-table-cell-z-index="1"
	            style={cellStyle}
	            onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
	            ref={cellRef}>
		<HxLabel text={noDataKey}/>
	</div>;
};