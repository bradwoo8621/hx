import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type CSSProperties, Fragment, useEffect, useState} from 'react';
import {DOMUtils} from '../../utils';
import {HxLabel} from '../label';
import {HxTableDefaults} from './defaults';
import {computeBodyCells} from './table-layout';
import {useHxTable} from './table-provider';
import type {HxTableColumnCellsFunc, HxTableComputedBodyCells, HxTableLayout, HxTableProps} from './types';
import {computeCellColumnCssProperty, computeCellRowCssProperty} from './utils';

export type HxTableBodyProps<T extends object> =
	& Required<
		Pick<HxTableProps<T>,
			| 'rowIndex'
			| 'columnGridLines' | 'rowGridLines' | 'secondaryRowGridLines' | 'stripeRow'
		>
	>
	& Pick<
	HxTableProps<T>,
	| '$model' | '$field'
	| 'columns' | 'renderAsForm' | 'ignoreHeaders' | 'maxBodyHeight'
	| 'noDataKey'
>;

interface HxTableBodyState {
	initialized: boolean;
	headerColumnCount: number;
	headerRowCount: number;
	cells?: HxTableComputedBodyCells;
	columnCount?: number;
	rowCount?: number;
}

export const HxTableBody = <T extends object>(props: HxTableBodyProps<T>) => {
	const {
		$model, $field,
		rowIndex, columnGridLines, rowGridLines, secondaryRowGridLines, stripeRow,
		columns, renderAsForm, ignoreHeaders, // TODO maxBodyHeight,
		noDataKey
	} = props;

	const tableContext = useHxTable();
	const [state, setState] = useState<HxTableBodyState>({initialized: false, headerColumnCount: 0, headerRowCount: 0});
	useEffect(() => {
		const onLayoutInitialized = (layout: HxTableLayout) => {
			setState({
				initialized: true,
				headerColumnCount: layout.headerColumnCount, headerRowCount: layout.headerRowCount,
				cells: layout.columns, columnCount: layout.columnColumnCount, rowCount: layout.columnRowCount
			});
		};

		tableContext.onLayoutInitialized(onLayoutInitialized);
		return () => {
			tableContext.offLayoutInitialized(onLayoutInitialized);
		};
	}, [state.initialized, tableContext]);

	if (!state.initialized) {
		return (void 0);
	}

	const data = ERO.getValue($model, $field);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let array: Array<any> = data;
	let hasData: boolean;
	if (renderAsForm) {
		if (!Array.isArray(data)) {
			// convert data to an array when render as form
			array = [data];
		}
		// always has data when render as form
		hasData = true;
	} else {
		hasData = data != null && Array.isArray(data) && data.length !== 0;
	}

	if (!hasData) {
		const cellStyle: CSSProperties = {
			// @ts-expect-error ignore the style name check
			'--cell-row': computeCellRowCssProperty(ignoreHeaders ? 1 : (state.headerRowCount + 1), 1),
			'--cell-column': computeCellColumnCssProperty(1, state.headerColumnCount)
		};
		return <>
			<div data-hx-table-body="start"/>
			<div data-hx-table-body-cell="" style={cellStyle}>
				<HxLabel text={noDataKey}/>
			</div>
			<div data-hx-table-body="end"/>
		</>;
	}

	let rowOffset = ignoreHeaders ? 0 : (state.headerRowCount + 1);

	return <>
		<div data-hx-table-body="start"/>
		{array.map((rowData, arrayRowIndex) => {
			// get cells from state, if computed already
			let cells = state.cells;
			// let columnCount = state.columnCount;
			let rowCount = state.rowCount;
			if (cells == null) {
				// or compute for each row if given "columns" is a function
				const computed = computeBodyCells((columns as HxTableColumnCellsFunc)($model, array, rowData, arrayRowIndex), {
					rowIndex
				});
				cells = computed.cells;
				// columnCount = computed.columnCount;
				rowCount = computed.rowCount;
			}
			const currentRowOffset = rowOffset;
			// eslint-disable-next-line react-hooks/immutability
			rowOffset += rowCount ?? 0;
			const evenRow = arrayRowIndex % 2 === 1;

			return <Fragment key={arrayRowIndex}>
				{cells.map((cell, cellIndex) => {
					const attrs = {
						'data-hx-padding-x': cell.indent ?? HxTableDefaults.bodyCellIndent,
						'data-hx-table-cell-row-grid-line': (cell.blockEndOfRow ? rowGridLines : secondaryRowGridLines) ? '' : (void 0),
						'data-hx-table-cell-column-grid-line': columnGridLines ? '' : (void 0),
						'data-hx-table-cell-block-end': cell.blockEndOfRow ? '' : (void 0),
						'data-hx-table-cell-inline-end': cell.inlineEndOfRow ? '' : (void 0),
						'data-hx-table-cell-stripe-row': stripeRow ? '' : (void 0),
						'data-hx-table-cell-odd-row': evenRow ? (void 0) : '',
						'data-hx-table-cell-even-row': evenRow ? '' : (void 0),
						style: {
							'--cell-row': computeCellRowCssProperty(currentRowOffset + cell.row, cell.rows),
							'--cell-column': computeCellColumnCssProperty(cell.col, cell.cols)
						} as CSSProperties
					};
					if (cell.rowIndex) {
						return <div data-hx-table-body-cell="" data-hx-table-row-index=""
						            {...attrs} key="row-index-cell">
						</div>;
					} else if (cell.assistEmpty) {
						return <div data-hx-table-body-cell="" data-hx-table-assist-empty=""
						            {...attrs} key={cellIndex}/>;
					} else {
						return <div data-hx-table-body-cell=""
						            {...attrs} key={cellIndex}>
							{DOMUtils.interposeToChildren({$model: rowData}, cell.content)}
						</div>;
					}
				})}
			</Fragment>;
		})}
		<div data-hx-table-body="end"/>
	</>;
};
