// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {HxConsole} from '../../utils';
import {useHxTable} from './table-provider';
import type {
	HxTableColumnCell,
	HxTableColumnCells,
	HxTableComputedBodyCell,
	HxTableComputedBodyCells,
	HxTableComputedHeaderCell,
	HxTableComputedHeaderCells,
	HxTableHeaderCell,
	HxTableHeaderCells,
	HxTableProps
} from './types';

export type HxTableLayoutProps<T extends object> =
	& Required<Pick<HxTableProps<T>, 'rowIndex' | 'rowIndexMinWidth'>>
	& Pick<HxTableProps<T>, 'headers' | 'columns'>;

export type ComputedGridCellCount = { columnCount: number, rowCount: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComputeHeaderCellsFuncOptions = Required<Pick<HxTableProps<any>, 'rowIndex' | 'rowIndexMinWidth'>>;
type ComputedHeaderCellsResult = ComputedGridCellCount & { cells: HxTableComputedHeaderCells };
type ComputeHeaderCellsFunc = (headers: HxTableHeaderCells, options: ComputeHeaderCellsFuncOptions, container: HTMLDivElement) => ComputedHeaderCellsResult;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComputeBodyCellsFuncOptions = Required<Pick<HxTableProps<any>, 'rowIndex'>>;
export type ComputedBodyCellsResult = ComputedGridCellCount & { cells: HxTableComputedBodyCells };
export type ComputeBodyCellsFunc = (columns: HxTableColumnCells, options: ComputeBodyCellsFuncOptions) => ComputedBodyCellsResult;

interface ComputedCells {
	headers: HxTableComputedHeaderCells;
	computeHeaders: ComputeHeaderCellsFunc;
	columns?: HxTableComputedBodyCells;
	computeColumns: ComputeBodyCellsFunc;
}

type ComputeCellsFuncOptions =
// eslint-disable-next-line @typescript-eslint/no-explicit-any
	& Required<Pick<HxTableProps<any>, 'rowIndex'>>
	& (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| { computeLayout: true } & Required<Pick<HxTableProps<any>, 'rowIndexMinWidth'>>
	| { computeLayout: false }
	);
const computeCells = <Cell extends [HxTableHeaderCell, HxTableComputedHeaderCell] | [HxTableComputedBodyCell, HxTableComputedBodyCell]>(
	cells: Array<Cell[0]>, options: ComputeCellsFuncOptions
): ComputedGridCellCount & { computed: Array<Cell[1]>; layout: Array<string>; ignored: Array<Cell[0]>; } => {
	const ignoredCells: Array<Cell[0]> = [];
	const rows: Array<Array<Cell[1] | 'hold' | 'empty'>> = [];

	cells.forEach(cell => {
		let {
			// eslint-disable-next-line prefer-const
			row: rowIndex = 1,
			col: columnIndex,
			// eslint-disable-next-line prefer-const
			rows: rowSpan = 1, cols: columnSpan = 1
		} = cell;
		// start at 1, or at first not-hold cell (not "hold" or "empty", not a header cell)
		if (columnIndex == null) {
			const row = rows[rowIndex - 1];
			if (row == null) {
				// this row not created yet, at first column
				columnIndex = 1;
			} else {
				for (let cIndexOfCurrentRow = 0, count = row.length; cIndexOfCurrentRow < count; cIndexOfCurrentRow++) {
					if (row[cIndexOfCurrentRow] == null) {
						// first (top-left) cell is not hold by other
						// check the row and column span, block is available or not
						let available = true;
						for (let rIndex = rowIndex - 1, rEndIndex = rIndex + rowSpan - 1; rIndex <= rEndIndex; rIndex++) {
							const row = rows[rIndex];
							if (row == null) {
								// row not created yet, available
								continue;
							}
							for (let cIndex = cIndexOfCurrentRow, cEndIndex = cIndexOfCurrentRow + columnSpan - 1; cIndex <= cEndIndex; cIndex++) {
								if (row[cIndex] != null) {
									// cell is hold, not available, break
									available = false;
									break;
								}
							}
							if (!available) {
								// hold cell found, not available, break
								break;
							}
						}
						if (available) {
							// available block found
							columnIndex = cIndexOfCurrentRow + 1;
							break;
						}
					}
				}
				if (columnIndex == null) {
					columnIndex = row.length + 1;
				}
			}
		}

		// create a temporary cells block for this header
		const tempCells: Array<Array<'hold'>> = [];
		let hold = false;
		for (let rIndex = 0, endRIndex = rowSpan - 1; rIndex <= endRIndex; rIndex++) {
			let row = tempCells[rIndex];
			if (row == null) {
				row = [];
				tempCells[rIndex] = row;
			}
			for (let cIndex = 0, endCIndex = columnSpan - 1; cIndex <= endCIndex; cIndex++) {
				// check the cell is hold or not
				if (rows[rowIndex - 1 + rIndex]?.[columnIndex - 1 + cIndex] == null) {
					row[cIndex] = 'hold';
				} else {
					hold = true;
					break;
				}
			}
			if (hold) {
				break;
			}
		}
		if (hold) {
			ignoredCells.push(cell);
		} else {
			// copy to cells
			tempCells.forEach((row, rIndex) => {
				row.forEach((cell, cIndex) => {
					if (rows[rowIndex - 1 + rIndex] == null) {
						rows[rowIndex - 1 + rIndex] = [];
					}
					rows[rowIndex - 1 + rIndex][columnIndex - 1 + cIndex] = cell;
				});
			});
			rows[rowIndex - 1][columnIndex - 1] = {
				...cell,
				row: rowIndex, rows: cell.rows ?? 1, col: columnIndex, cols: cell.cols ?? 1,
				inlineEndOfRow: false, blockEndOfRow: false
			};
		}
	});

	// fill null element with "empty"
	const maxCellsOfRow = rows.reduce((maxCellsOfRow, row) => {
		return Math.max(maxCellsOfRow, row.length);
	}, 0);
	rows.forEach(row => {
		if (row.length !== maxCellsOfRow) {
			row.length = maxCellsOfRow;
		}
		for (let cIndex = row.length - 1; cIndex >= 0; cIndex--) {
			if (row[cIndex] == null) {
				row[cIndex] = 'empty';
			}
		}
	});

	const computed: HxTableComputedHeaderCells = [];
	const layout: Array<string> = [];

	let columnOffset = 0;
	if (options.rowIndex) {
		computed.push({
			row: 1, rows: Math.max(1, rows.length), col: 1, cols: 1, rowIndex: true,
			inlineEndOfRow: false, blockEndOfRow: false
		});
		if (options.computeLayout) {
			layout.push(`minmax(${options.rowIndexMinWidth}px, auto)`);
		}
		columnOffset = 1;
	}

	if (rows.length > 0) {
		for (let columnIndex = 0, columnCount = rows[0].length; columnIndex < columnCount; columnIndex++) {
			let cellFound: HxTableHeaderCell | undefined = (void 0);
			for (let rowIndex = 0, rowCount = rows.length; rowIndex < rowCount; rowIndex++) {
				const c = rows[rowIndex][columnIndex];
				if (c === 'hold') {
					// ignore
				} else if (c === 'empty') {
					// create an empty cell
					computed.push({
						row: rowIndex + 1, rows: 1, col: columnIndex + 1 + columnOffset, cols: 1, assistEmpty: true,
						inlineEndOfRow: false, blockEndOfRow: false
					});
				} else if (c.cols != null && c.cols !== 1) {
					// a cell has column span
					c.col += columnOffset;
					computed.push(c);
				} else {
					// a cell has no column span
					c.col += columnOffset;
					computed.push(c);
					cellFound = c;
				}
			}
			if (options.computeLayout) {
				if (cellFound != null) {
					if (cellFound.width != null) {
						if (typeof cellFound.width === 'number') {
							layout.push(`minmax(${cellFound.width}px, auto)`);
						} else {
							layout.push(`minmax(${cellFound.width}, auto)`);
						}
					} else {
						layout.push('auto');
					}
				} else {
					layout.push('auto');
				}
			}
		}
	}

	// compute the cells are last of row
	const lastCell = computed.reduce((last, cell) => {
		last.columnIndex = Math.max(last.columnIndex, cell.col + cell.cols - 1);
		last.rowIndex = Math.max(last.rowIndex, cell.row + cell.rows - 1);
		return last;
	}, {columnIndex: 1, rowIndex: 1});
	computed.forEach(cell => {
		if ((cell.col + cell.cols - 1) === lastCell.columnIndex) {
			cell.inlineEndOfRow = true;
		}
		if ((cell.row + cell.rows - 1) === lastCell.rowIndex) {
			cell.blockEndOfRow = true;
		}
	});

	let columnCount = 0;
	let rowCount = 0;
	computed.some(cell => {
		if (cell.inlineEndOfRow && columnCount === 0) {
			columnCount = cell.col + cell.cols - 1;
		}
		if (cell.blockEndOfRow && rowCount === 0) {
			rowCount = cell.row + cell.rows - 1;
		}
		return columnCount !== 0 && rowCount !== 0;
	});

	return {computed, layout, ignored: ignoredCells, columnCount, rowCount};
};

const computeHeaderCells: ComputeHeaderCellsFunc = (
	headers, options, container
): ComputedHeaderCellsResult => {
	const {
		computed: cells, layout, ignored: ignoredCells, columnCount, rowCount
	} = computeCells<[HxTableHeaderCell, HxTableComputedHeaderCell]>(headers, {...options, computeLayout: true});

	if (ignoredCells.length !== 0) {
		HxConsole.error('Table headers ignored because of overlap.', ignoredCells);
	}

	container.style.setProperty('--hx-table-display-state', 'grid');
	container.style.setProperty('--hx-table-columns-layout', layout.join(' '));

	return {cells, columnCount, rowCount};
};

// eslint-disable-next-line react-refresh/only-export-components
export const computeBodyCells: ComputeBodyCellsFunc = (
	columns, options
): ComputedBodyCellsResult => {
	const {
		computed: cells, ignored: ignoredCells, columnCount, rowCount
	} = computeCells<[HxTableColumnCell, HxTableComputedBodyCell]>(columns, {...options, computeLayout: false});

	if (ignoredCells.length !== 0) {
		HxConsole.error('Table columns ignored because of overlap.', ignoredCells);
	}

	return {cells, columnCount, rowCount};
};

export const HxTableLayout = <T extends object>(props: HxTableLayoutProps<T>) => {
	const {
		rowIndex, rowIndexMinWidth,
		headers, columns
	} = props;

	const tableContext = useHxTable();
	const ref = useRef<HTMLDivElement>(null);
	const computedCells = useRef<ComputedCells>({
		headers: [], computeHeaders: computeHeaderCells,
		columns: [], computeColumns: computeBodyCells
	});

	useEffect(() => {
		if (ref.current == null) {
			return;
		}

		const container = ref.current.parentElement as HTMLDivElement | null;
		if (container == null) {
			return;
		}

		const {
			cells: headerCells, columnCount: headerColumnCount, rowCount: headerRowCount
		} = computedCells.current.computeHeaders(headers, {
			rowIndex, rowIndexMinWidth
		}, container);

		let bodyCells: HxTableComputedBodyCells | undefined = (void 0);
		let bodyColumnCount: number | undefined = (void 0);
		let bodyRowCount: number | undefined = (void 0);
		if (Array.isArray(columns)) {
			const {cells, columnCount, rowCount} = computedCells.current.computeColumns(columns, {rowIndex});
			bodyCells = cells;
			bodyColumnCount = columnCount;
			bodyRowCount = rowCount;
		}

		tableContext.layoutInitialized({
			headers: headerCells, headerColumnCount, headerRowCount,
			columns: bodyCells, columnColumnCount: bodyColumnCount, columnRowCount: bodyRowCount
		});
	}, [rowIndex, rowIndexMinWidth, headers, columns, tableContext]);

	return <div data-hx-table-layout="" ref={ref}/>;
};
