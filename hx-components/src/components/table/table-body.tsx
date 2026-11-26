import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type MouseEvent, useEffect, useRef, useState} from 'react';
import {useHxContext, useHxHierarchyBound} from '../../contexts';
import {type HxPaginationData, readPaginationData, writePaginationData} from '../pagination';
import {HxPaginationDefaults} from '../pagination/defaults';
import {HxTableDefaults} from './defaults';
import {HxTableBodyNoDataRow} from './table-body-no-data-row';
import {useHxTableBody} from './table-body-provider';
import {HxTableBodyRow} from './table-body-row';
import {HxTableBodyRowProvider} from './table-body-row-provider';
import {computeBodyCells} from './table-layout';
import {useHxTable} from './table-provider';
import type {
	HxTableColumnCellsFunc,
	HxTableComputedBodyCells,
	HxTableComputedNestedBodyCell,
	HxTableComputedStdBodyCell,
	HxTableLayout,
	HxTableProps
} from './types';
import {computeCellColumnCssProperty, computeCellRowCssProperty} from './utils';

export type HxTableBodyProps<T extends object, PT extends object = T> =
	& Required<
		Pick<HxTableProps<T>,
			| 'rowIndex' | 'nestedRowHover' | 'nestedRowIndependentHover'
			| 'columnGridLines' | 'rowGridLines' | 'stripeRow'
		>
	>
	& Pick<
	HxTableProps<T, PT>,
	| '$model' | '$field'
	| 'columns' | 'fixedStartColumns' | 'fixedEndColumns'
	| 'renderAsForm' | 'ignoreHeaders' | 'pagination' | 'renderPrepare'
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

export const HxTableBody =
	<T extends object, PT extends object = T>(props: HxTableBodyProps<T, PT>) => {
		const {
			$model, $field,
			rowIndex, nestedRowHover, nestedRowIndependentHover,
			columnGridLines, rowGridLines, stripeRow,
			ignoreHeaders, columns,
			fixedStartColumns, fixedEndColumns,
			renderAsForm, pagination, renderPrepare, noDataKey
		} = props;

		const context = useHxContext();
		const tableContext = useHxTable();
		const tableBodyContext = useHxTableBody();
		const bodyStartRef = useRef<HTMLDivElement>(null);
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
			const onDataChanged = () => {
				context.forceUpdate();
			};

			tableContext.onLayoutInitialized(onLayoutInitialized);
			tableContext.onDataChanged(onDataChanged);
			return () => {
				tableContext.offLayoutInitialized(onLayoutInitialized);
				tableContext.offDataChanged(onDataChanged);
			};
		}, [context, tableContext, pagination]);
		useEffect(() => {
			if (!state.initialized) {
				return;
			}
			tableContext.contentLayout();
		});
		useHxHierarchyBound(bodyStartRef);

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

		if (renderPrepare != null) {
			// it is the second round rendering, so criteria monitors were registered
			// see the "state.initialized" check above, that is the first round rendering, which the criteria monitors are not registered yet.
			tableContext.askCriteria((criteria) => {
				array = renderPrepare($model, criteria, context);
				hasData = array.length !== 0;
			});
		}

		let rowIndexOffset = 0;
		if (pagination != null) {
			let mightBePreparedPagination: HxPaginationData | undefined = (void 0);
			tableContext.askCriteria((criteria) => {
				mightBePreparedPagination = criteria.pagination;
			});
			// eslint-disable-next-line prefer-const
			let {pageNumber, pageSize, totalItems, totalPages} = readPaginationData({
				...pagination,
				// the $model fallback is resolved here as well, the footer does the same
				$model: pagination.$model ?? $model,
				allowedPageSizes: pagination.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes
			}, context);
			// compare with the prepared pagination data
			if (mightBePreparedPagination != null) {
				const preparedPagination = mightBePreparedPagination as HxPaginationData;
				// keep page size with model
				preparedPagination.pageSize = pageSize;
				// should write to model if any of pageNumber/totalItems/totalPages is not same
				let shouldWrite = false;
				if (preparedPagination.pageNumber != null && pageNumber != preparedPagination.pageNumber) {
					pageNumber = preparedPagination.pageNumber;
					shouldWrite = true;
				}
				if (preparedPagination.totalItems != null && totalItems != preparedPagination.totalItems) {
					// no need to sync from prepared pagination
					shouldWrite = true;
				}
				if (preparedPagination.totalPages != null && totalPages != preparedPagination.totalPages) {
					// no need to sync from prepared pagination
					shouldWrite = true;
				}
				if (shouldWrite) {
					// write to model
					writePaginationData(preparedPagination, {
						...pagination,
						// the $model fallback is resolved here as well, the footer does the same
						$model: pagination.$model ?? $model,
						allowedPageSizes: pagination.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes
					}, context);
					window.requestAnimationFrame(() => {
						tableContext.repaintPagination();
					});
				}
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
			const targetEl = ev.currentTarget;
			const isTargetGroupCell = targetEl.hasAttribute('data-hx-table-body-group-cell');
			const isTargetNestedCell = targetEl.hasAttribute('data-hx-table-body-nested-cell');
			// const isTargetNestedRowOperatorCell = targetEl.hasAttribute('data-hx-table-nested-row-operator');
			// nested row operator cell is standard cell as well
			// const isTargetStdCell = !isTargetNestedCell && !isTargetGroupCell;
			const targetRowNumber = targetEl.getAttribute('data-hx-table-row-number');

			const tableContentEl = targetEl.parentElement;
			const firstHoveredEl = tableContentEl?.querySelector(':scope > div[data-hx-table-body-cell][data-hx-hover]');
			const hasHoveredCells = firstHoveredEl != null;
			// const isHoveredGroupCell = firstHoveredEl?.hasAttribute('data-hx-table-body-group-cell') ?? false;
			// const isHoveredNestedCell = firstHoveredEl?.hasAttribute('data-hx-table-body-nested-cell') ?? false;
			// const isHoveredNestedRowOperatorCell = firstHoveredEl?.hasAttribute('data-hx-table-nested-row-operator') ?? false;
			// nested row operator cell is standard cell as well
			// const isHoveredStdCell = hasHoveredCells && !isHoveredGroupCell && !isHoveredNestedCell;
			const hoveredRowNumber = firstHoveredEl?.getAttribute('data-hx-table-row-number') ?? '';

			const toHoverSelectorPrefix = `:scope > div[data-hx-table-body-cell][data-hx-table-row-number="${targetRowNumber}"]`;
			let toHoverSelector: string;
			if (isTargetGroupCell) {
				// target is group cell, hover group cells only
				toHoverSelector = `${toHoverSelectorPrefix}[data-hx-table-body-group-cell]`;
			} else if (!nestedRowIndependentHover) {
				// target is standard cell or nested cell, and show their hover state together
				if (nestedRowHover) {
					// hover standard cells and nested cell, which means all cells but group cells
					toHoverSelector = `${toHoverSelectorPrefix}:not([data-hx-table-body-group-cell])`;
				} else {
					// hover standard cells only
					toHoverSelector = `${toHoverSelectorPrefix}:not([data-hx-table-body-group-cell]):not([data-hx-table-body-nested-cell])`;
				}
			} else if (isTargetNestedCell) {
				// target is nested cell
				if (nestedRowHover) {
					// hover nested row operator cell and nested cell
					toHoverSelector = `${toHoverSelectorPrefix}[data-hx-table-body-nested-cell], ${toHoverSelectorPrefix}[data-hx-table-nested-row-operator]`;
				} else {
					// hover standard cells only
					toHoverSelector = `${toHoverSelectorPrefix}:not([data-hx-table-body-group-cell]):not([data-hx-table-body-nested-cell])`;
				}
			} else {
				// target is standard cell, hover standard cells only
				toHoverSelector = `${toHoverSelectorPrefix}:not([data-hx-table-body-group-cell]):not([data-hx-table-body-nested-cell])`;
			}
			tableContentEl?.querySelectorAll(toHoverSelector).forEach(el => el.setAttribute('data-hx-hover', ''));

			const deHoverSelectorPrefix = `:scope > div[data-hx-table-body-cell][data-hx-hover][data-hx-table-row-number="${hoveredRowNumber}"]`;
			let toDeHoverSelector: string | undefined = (void 0);
			if (!hasHoveredCells) {
				// no hovered cell, do nothing
			} else if (hoveredRowNumber !== targetRowNumber) {
				toDeHoverSelector = deHoverSelectorPrefix;
			} else if (isTargetGroupCell) {
				// target is group cell, de-hover standard cells and nested cell, which means all cells but group cells
				toDeHoverSelector = `${deHoverSelectorPrefix}:not([data-hx-table-body-group-cell])`;
			} else if (!nestedRowIndependentHover) {
				// target is standard cell or nested cell, and show their hover state together,
				if (nestedRowHover) {
					// de-hover group cells only
					toDeHoverSelector = `${deHoverSelectorPrefix}[data-hx-table-body-group-cell]`;
				} else {
					// de-hover nested cell and group cells
					toDeHoverSelector = `${deHoverSelectorPrefix}[data-hx-table-body-nested-cell], ${deHoverSelectorPrefix}[data-hx-table-body-group-cell]`;
				}
			} else if (isTargetNestedCell) {
				// target is nested cell
				if (nestedRowHover) {
					// de-hover all standard cells but nested row operator cell, and de-hover group cells
					toDeHoverSelector = `${deHoverSelectorPrefix}:not([data-hx-table-body-nested-cell]):not([data-hx-table-nested-row-operator])`;
				} else {
					// de-hover nested cell and group cells
					toDeHoverSelector = `${deHoverSelectorPrefix}[data-hx-table-body-nested-cell], ${deHoverSelectorPrefix}[data-hx-table-body-group-cell]`;
				}
			} else {
				// target is standard cell, de-hover nested cell and group cells
				toDeHoverSelector = `${deHoverSelectorPrefix}[data-hx-table-body-nested-cell], ${deHoverSelectorPrefix}[data-hx-table-body-group-cell]`;
			}
			if (toDeHoverSelector != null) {
				tableContentEl?.querySelectorAll(toDeHoverSelector).forEach(el => el.removeAttribute('data-hx-hover'));
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
			// clear the nested cells expanding state
			tableBodyContext.clearNestedRowExpansionState();

			const [startCol, endCol, colCss] = computeCellColumnCssProperty(1, state.headerColumnCount);
			const [startRow, endRow, rowCss] = computeCellRowCssProperty(ignoreHeaders ? 1 : (state.headerRowCount + 1), 1);

			const rowOffset = ignoreHeaders ? 0 : state.headerRowCount;

			return <>
				<div data-hx-table-body="start" ref={bodyStartRef}/>
				<HxTableBodyRowProvider data={(void 0)} hasNestedCell={false} arrayRowIndex={0}
				                        bodyStartRef={bodyStartRef}>
					<HxTableBodyNoDataRow startCol={startCol} endCol={endCol}
					                      startRow={startRow} endRow={endRow}
					                      colCss={colCss} rowCss={rowCss}
					                      paddingX={(state.cells?.[0] as HxTableComputedStdBodyCell)?.indent ?? HxTableDefaults.bodyCellIndent}
					                      columnGridLines={columnGridLines} rowGridLines={rowGridLines}
					                      stripeRow={stripeRow}
					                      onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
					                      noDataKey={noDataKey}/>
				</HxTableBodyRowProvider>
				<div data-hx-table-body="end"
				     data-hx-table-body-start-column={startCol} data-hx-table-body-end-column={endCol}
				     data-hx-table-body-start-row={rowOffset + startRow}
				     data-hx-table-body-end-row={rowOffset + endRow}/>
			</>;
		} else {
			// redress the nested cells expanding state
			tableBodyContext.redressNestedRowExpansionState(array);

			const lastFixedColumnToLeft = fixedStartColumns ?? 0;
			const firstFixedColumnToRight = fixedEndColumns == null ? Infinity : (state.headerColumnCount - fixedEndColumns + 1);
			const startRowOffset = ignoreHeaders ? 0 : state.headerRowCount;
			let rowOffset = startRowOffset;
			let maxRow = rowOffset;
			let maxColumn = 0;

			return <>
				<div data-hx-table-body="start" ref={bodyStartRef}/>
				{array.map((rowData, arrayRowIndex) => {
					// get cells from state, if computed already
					let cells = state.cells;
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

					const cellsForRow = cells.map(cell => {
						const [startCol, endCol, colCss] = computeCellColumnCssProperty(cell.col, cell.cols);
						maxColumn = Math.max(maxColumn, endCol);
						const [startRow, endRow, rowCss] = computeCellRowCssProperty(currentRowOffset + cell.row, cell.rows);
						maxRow = Math.max(maxRow, endRow);
						return {
							cell, rowCss, colCss,
							startRow, endRow, startCol, endCol
						};
					});
					const hasNestedCell = cells.some(cell => (cell as HxTableComputedNestedBodyCell).nested);

					return <HxTableBodyRowProvider data={rowData} hasNestedCell={hasNestedCell}
					                               arrayRowIndex={arrayRowIndex} bodyStartRef={bodyStartRef}
					                               key={arrayRowIndex}>
						<HxTableBodyRow data={rowData} cells={cellsForRow}
						                arrayRowIndex={arrayRowIndex} rowIndexOffset={rowIndexOffset}
						                evenRow={evenRow} lastRow={lastRow}
						                lastFixedColumnToLeft={lastFixedColumnToLeft}
						                firstFixedColumnToRight={firstFixedColumnToRight}
						                columnGridLines={columnGridLines} rowGridLines={rowGridLines}
						                stripeRow={stripeRow}
						                onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}/>
					</HxTableBodyRowProvider>;
				})}
				<div data-hx-table-body="end"
				     data-hx-table-body-start-column={maxColumn > 0 ? 1 : 0}
				     data-hx-table-body-end-column={maxColumn}
				     data-hx-table-body-start-row={maxRow > startRowOffset ? (startRowOffset + 1) : startRowOffset}
				     data-hx-table-body-end-row={maxRow}/>
			</>;
		}
	};
