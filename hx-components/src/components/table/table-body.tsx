import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type CSSProperties, Fragment, type MouseEvent, useEffect, useState} from 'react';
import {useHxContext} from '../../contexts';
import {DOMUtils} from '../../utils';
import {HxLabel} from '../label';
import {type HxPaginationData, readPaginationData} from '../pagination';
import {HxPaginationDefaults} from '../pagination/defaults';
import {HxTableDefaults} from './defaults';
import {computeBodyCells} from './table-layout';
import {useHxTable} from './table-provider';
import type {HxTableColumnCellsFunc, HxTableComputedBodyCells, HxTableLayout, HxTableProps} from './types';
import {computeCellColumnCssProperty, computeCellRowCssProperty} from './utils';

export type HxTableBodyProps<T extends object, PT extends object = T> =
	& Required<
		Pick<HxTableProps<T>,
			| 'rowIndex'
			| 'columnGridLines' | 'rowGridLines' | 'stripeRow'
		>
	>
	& Pick<
	HxTableProps<T, PT>,
	| '$model' | '$field'
	| 'columns' | 'renderAsForm' | 'ignoreHeaders' | 'scrollHeight' | 'pagination'
	| 'noDataKey'
>;

interface HxTableBodyState {
	initialized: boolean;
	headerColumnCount: number;
	headerRowCount: number;
	cells?: HxTableComputedBodyCells;
	columnCount?: number;
	rowCount?: number;
	// pagination
	pageNumber?: number;
	pageSize?: number;
}

export const HxTableBody = <T extends object, PT extends object = T>(props: HxTableBodyProps<T, PT>) => {
	const {
		$model, $field,
		rowIndex, columnGridLines, rowGridLines, stripeRow, ignoreHeaders, // TODO maxBodyHeight,
		columns, renderAsForm, pagination,
		noDataKey
	} = props;

	const context = useHxContext();
	const tableContext = useHxTable();
	const [state, setState] = useState<HxTableBodyState>({
		initialized: false, headerColumnCount: 0, headerRowCount: 0
	});
	useEffect(() => {
		const onLayoutInitialized = (layout: HxTableLayout) => {
			setState(state => {
				return {
					...state,
					initialized: true,
					headerColumnCount: layout.headerColumnCount, headerRowCount: layout.headerRowCount,
					cells: layout.columns, columnCount: layout.columnColumnCount, rowCount: layout.columnRowCount
				};
			});
		};
		const onPageChange = (data: HxPaginationData) => {
			setState(state => {
				return {...state, pageNumber: data.pageNumber, pageSize: data.pageSize};
			});
		};

		tableContext.onLayoutInitialized(onLayoutInitialized);
		tableContext.onPageNumberChange(onPageChange);
		tableContext.onPageSizeChange(onPageChange);
		return () => {
			tableContext.offLayoutInitialized(onLayoutInitialized);
			tableContext.offPageNumberChange(onPageChange);
			tableContext.offPageSizeChange(onPageChange);
		};
	}, [tableContext, pagination]);

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

	let rowIndexOffset = 0;
	if (pagination != null) {
		let pageNumber = state.pageNumber ?? 1;
		let pageSize = state.pageSize;
		if (pageSize == null) {
			pageSize = readPaginationData({
				...pagination,
				allowedPageSizes: pagination.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes
			}, context).pageSize;
		}
		let startIndex = (pageNumber - 1) * pageSize;
		if (array.length <= startIndex) {
			pageNumber = Math.ceil(array.length / pageSize);
			startIndex = (pageNumber - 1) * pageSize;
		}
		const endIndex = startIndex + pageSize;
		array = array.slice(startIndex, endIndex);
		rowIndexOffset = startIndex;
	}

	const onMouseEnter = (ev: MouseEvent<HTMLDivElement>) => {
		if (renderAsForm) {
			return;
		}
		const target = ev.currentTarget;
		const rowNumber = target.getAttribute('data-hx-table-row-number');
		const tableElement = target.parentElement;
		const hovered = tableElement?.querySelector(':scope > div[data-hx-table-body-cell][data-hx-hover]');
		if (hovered == null) {
			tableElement
				?.querySelectorAll(`:scope > div[data-hx-table-body-cell][data-hx-table-row-number="${rowNumber}"]`)
				?.forEach(cell => cell.setAttribute('data-hx-hover', ''));
		} else {
			const hoveredRowNumber = hovered.getAttribute('data-hx-table-row-number');
			if (hoveredRowNumber !== rowNumber) {
				tableElement
					?.querySelectorAll(`:scope > div[data-hx-table-body-cell][data-hx-table-row-number="${rowNumber}"]`)
					?.forEach(cell => cell.setAttribute('data-hx-hover', ''));
				tableElement
					?.querySelectorAll(`:scope > div[data-hx-table-body-cell][data-hx-table-row-number="${hoveredRowNumber}"]`)
					?.forEach(cell => cell.removeAttribute('data-hx-hover'));
			}
		}
	};
	const onMouseLeave = (ev: MouseEvent<HTMLDivElement>) => {
		if (renderAsForm) {
			return;
		}
		const target = ev.currentTarget;

		// clear hover status from this body row when
		// - current hovered element not exists
		// - current hovered element not within any table body cell
		// - current hovered element not in same table with this cell
		const hoveredElement = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('div[data-hx-table-body-cell]');
		if (hoveredElement == null || hoveredElement.parentElement != target.parentElement) {
			target.parentElement
				?.querySelectorAll(`:scope > div[data-hx-table-body-cell]`)
				?.forEach(cell => cell.removeAttribute('data-hx-hover'));
		}
	};

	if (!hasData) {
		const cellStyle: CSSProperties = {
			// @ts-expect-error ignore the style name check
			'--hx-table-cell-row-this': computeCellRowCssProperty(ignoreHeaders ? 1 : (state.headerRowCount + 1), 1),
			'--hx-table-cell-column-this': computeCellColumnCssProperty(1, state.headerColumnCount)
		};
		return <>
			<div data-hx-table-body="start"/>
			<div data-hx-table-body-cell=""
			     data-hx-table-row-number="1"
			     data-hx-padding-x={state.cells?.[0].indent ?? HxTableDefaults.bodyCellIndent}
			     data-hx-table-cell-row-grid-line={rowGridLines ? '' : (void 0)}
			     data-hx-table-cell-column-grid-line={columnGridLines ? '' : (void 0)}
			     data-hx-table-cell-block-end="" data-hx-table-cell-inline-end=""
			     data-hx-table-cell-stripe-row={stripeRow ? '' : (void 0)} data-hx-table-cell-odd-row=""
			     data-hx-table-cell-last-row=""
			     style={cellStyle}
			     onMouseEnter={renderAsForm ? (void 0) : onMouseEnter}
			     onMouseLeave={renderAsForm ? (void 0) : onMouseLeave}>
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
			const lastRow = arrayRowIndex === array.length - 1;

			return <Fragment key={arrayRowIndex}>
				{cells.map((cell, cellIndex) => {
					const attrs = {
						'data-hx-table-row-number': arrayRowIndex + 1,
						'data-hx-padding-x': cell.indent ?? HxTableDefaults.bodyCellIndent,
						'data-hx-table-cell-row-grid-line': (cell.blockEndOfRow && rowGridLines) ? '' : (void 0),
						'data-hx-table-cell-column-grid-line': columnGridLines ? '' : (void 0),
						'data-hx-table-cell-block-end': cell.blockEndOfRow ? '' : (void 0),
						'data-hx-table-cell-inline-end': cell.inlineEndOfRow ? '' : (void 0),
						'data-hx-table-cell-stripe-row': stripeRow ? '' : (void 0),
						'data-hx-table-cell-odd-row': evenRow ? (void 0) : '',
						'data-hx-table-cell-even-row': evenRow ? '' : (void 0),
						'data-hx-table-cell-last-row': lastRow ? '' : (void 0),
						style: {
							'--hx-table-cell-row-this': computeCellRowCssProperty(currentRowOffset + cell.row, cell.rows),
							'--hx-table-cell-column-this': computeCellColumnCssProperty(cell.col, cell.cols)
						} as CSSProperties,
						onMouseEnter, onMouseLeave
					};
					if (cell.rowIndex) {
						return <div data-hx-table-body-cell="" data-hx-table-row-index=""
						            {...attrs} key="row-index-cell">
							{rowIndexOffset + arrayRowIndex + 1}
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
