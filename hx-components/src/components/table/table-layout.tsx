// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {HxConsole} from '../../utils';
import {useHxTable} from './table-provider';
import type {
	HxTableComputedHeaderCell,
	HxTableComputedHeaderCells,
	HxTableHeaderCell,
	HxTableHeaderCells,
	HxTableProps
} from './types';

export type HxTableLayoutProps<T extends object> =
	& Required<Pick<HxTableProps<T>, 'rowIndex' | 'rowIndexMinWidth'>>
	& Pick<HxTableProps<T>, 'headers'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComputeCellsFuncOptions = Required<Pick<HxTableProps<any>, 'rowIndex' | 'rowIndexMinWidth'>>;
type ComputeCellsFunc = (headers: HxTableHeaderCells, options: ComputeCellsFuncOptions, container: HTMLDivElement) => HxTableComputedHeaderCells;

interface ComputedCells {
	header: HxTableComputedHeaderCells;
	compute: ComputeCellsFunc;
}

const computeCells: ComputeCellsFunc = (
	headers, options, container
): HxTableComputedHeaderCells => {
	const ignoredHeaders: Array<HxTableHeaderCell> = [];
	const cells: Array<Array<HxTableComputedHeaderCell | 'hold' | 'empty'>> = [];

	headers.forEach(header => {
		let {
			// eslint-disable-next-line prefer-const
			row: rowIndex = 1,
			col: columnIndex,
			// eslint-disable-next-line prefer-const
			rows: rowSpan = 1, cols: columnSpan = 1
		} = header;
		// start at 1, or at first not-hold cell (not "hold" or "empty", not a header cell)
		if (columnIndex == null) {
			const row = cells[rowIndex - 1];
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
							const row = cells[rIndex];
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
				if (cells[rowIndex - 1 + rIndex]?.[columnIndex - 1 + cIndex] == null) {
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
			ignoredHeaders.push(header);
		} else {
			// copy to cells
			tempCells.forEach((row, rIndex) => {
				row.forEach((cell, cIndex) => {
					if (cells[rowIndex - 1 + rIndex] == null) {
						cells[rowIndex - 1 + rIndex] = [];
					}
					cells[rowIndex - 1 + rIndex][columnIndex - 1 + cIndex] = cell;
				});
			});
			cells[rowIndex - 1][columnIndex - 1] = {
				...header,
				row: rowIndex, rows: header.rows ?? 1, col: columnIndex, cols: header.cols ?? 1
			};
		}
	});
	// reform columns
	const columnCount = cells.reduce((columnCount, row) => {
		return Math.max(columnCount, row.length);
	}, 0);
	cells.forEach(row => {
		if (row.length !== columnCount) {
			row.length = columnCount;
		}
		for (let cIndex = row.length - 1; cIndex >= 0; cIndex--) {
			if (row[cIndex] == null) {
				row[cIndex] = 'empty';
			}
		}
	});

	if (ignoredHeaders.length !== 0) {
		HxConsole.error('Table headers ignored because of overlap.', ignoredHeaders);
	}

	const computed: HxTableComputedHeaderCells = [];
	const layout: Array<string> = [];

	let columnOffset = 0;
	if (options.rowIndex) {
		computed.push({row: 1, rows: Math.max(1, cells.length), col: 1, cols: 1, rowIndex: true});
		layout.push(`minmax(${options.rowIndexMinWidth}px, auto)`);
		columnOffset = 1;
	}

	if (cells.length > 0) {
		for (let columnIndex = 0, columnCount = cells[0].length; columnIndex < columnCount; columnIndex++) {
			let cellFound: HxTableHeaderCell | undefined = (void 0);
			for (let rowIndex = 0, rowCount = cells.length; rowIndex < rowCount; rowIndex++) {
				const c = cells[rowIndex][columnIndex];
				if (c === 'hold') {
					// ignore
				} else if (c === 'empty') {
					// create an empty cell
					computed.push({
						row: rowIndex + 1, rows: 1, col: columnIndex + 1 + columnOffset, cols: 1,
						assistEmpty: true
					});
				} else if (c.cols != null && c.cols !== 1) {
					// a cell has column span\
					c.col += columnOffset;
					computed.push(c);
				} else {
					// a cell has no column span
					c.col += columnOffset;
					computed.push(c);
					cellFound = c;
				}
			}
			if (cellFound != null) {
				if (cellFound.width != null) {
					layout.push(`minmax(${cellFound.width}px, auto)`);
				} else {
					layout.push('auto');
				}
			} else {
				layout.push('auto');
			}
		}
	}
	container.style.setProperty('--display-state', 'grid');
	container.style.setProperty('--columns-layout', layout.join(' '));
	return computed;
};

export const HxTableLayout = <T extends object>(props: HxTableLayoutProps<T>) => {
	const {
		rowIndex, rowIndexMinWidth,
		headers
	} = props;

	const tableContext = useHxTable();
	const ref = useRef<HTMLDivElement>(null);
	const computedCells = useRef<ComputedCells>({header: [], compute: computeCells});

	useEffect(() => {
		if (ref.current == null) {
			return;
		}

		const container = ref.current.parentElement as HTMLDivElement | null;
		if (container == null) {
			return;
		}

		computedCells.current.header = computedCells.current.compute(headers, {rowIndex, rowIndexMinWidth}, container);
		tableContext.layoutInitialized({header: computedCells.current.header});
	}, [rowIndex, rowIndexMinWidth, headers, tableContext]);

	return <div data-hx-table-layout ref={ref}/>;
};
