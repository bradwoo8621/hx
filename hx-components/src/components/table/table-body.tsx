import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type CSSProperties, Fragment, type MouseEvent, useEffect, useRef, useState} from 'react';
import {useHxContext} from '../../contexts';
import {DOMUtils} from '../../utils';
import {Minus, Plus} from '../icons';
import {HxLabel, type HxLabelProps} from '../label';
import {readPaginationData} from '../pagination';
import {HxPaginationDefaults} from '../pagination/defaults';
import {HxTableDefaults} from './defaults';
import {computeBodyCells} from './table-layout';
import {useHxTable} from './table-provider';
import type {
	HxTableColumnCellsFunc,
	HxTableComputedBodyCells,
	HxTableComputedGroupBodyCell,
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

export const HxTableBody = <T extends object, PT extends object = T>(props: HxTableBodyProps<T, PT>) => {
	const {
		$model, $field,
		rowIndex, nestedRowHover, nestedRowIndependentHover, columnGridLines, rowGridLines, stripeRow, ignoreHeaders,
		columns, fixedStartColumns, fixedEndColumns, renderAsForm, pagination, renderPrepare,
		noDataKey
	} = props;

	const context = useHxContext();
	const tableContext = useHxTable();
	const nestedExpandRef = useRef<Map<object, true>>(new Map());
	const [state, setState] = useState<HxTableBodyState>({initialized: false, headerColumnCount: 0, headerRowCount: 0});
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
		});
	}

	let rowIndexOffset = 0;
	if (pagination != null) {
		// eslint-disable-next-line prefer-const
		let {pageNumber, pageSize} = readPaginationData({
			...pagination,
			allowedPageSizes: pagination.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes
		}, context);
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
		nestedExpandRef.current.clear();

		const [startCol, endCol, colCss] = computeCellColumnCssProperty(1, state.headerColumnCount);
		const [startRow, endRow, rowCss] = computeCellRowCssProperty(ignoreHeaders ? 1 : (state.headerRowCount + 1), 1);
		const cellStyle: CSSProperties = {
			// @ts-expect-error ignore the style name check
			'--hx-table-cell-row-this': rowCss,
			'--hx-table-cell-column-this': colCss,
			// no data row always sticky to left
			'--hx-table-cell-sticky': 'sticky',
			'--hx-table-cell-sticky-left': '0px',
			'--hx-table-cell-z-index': '1'
		};

		const rowOffset = ignoreHeaders ? 0 : state.headerRowCount;

		return <>
			<div data-hx-table-body="start"/>
			<div data-hx-table-body-cell="" data-hx-table-body-no-data-cell=""
			     data-hx-table-row-number="1"
			     data-hx-table-cell-start-row={startRow}
			     data-hx-table-cell-end-row={endRow}
			     data-hx-table-cell-start-column={startCol}
			     data-hx-table-cell-end-column={endCol}
			     data-hx-padding-x={(state.cells?.[0] as HxTableComputedStdBodyCell)?.indent ?? HxTableDefaults.bodyCellIndent}
			     data-hx-table-cell-row-grid-line={rowGridLines ? '' : (void 0)}
			     data-hx-table-cell-column-grid-line={columnGridLines ? '' : (void 0)}
			     data-hx-table-cell-block-end="" data-hx-table-cell-inline-end=""
			     data-hx-table-cell-stripe-row={stripeRow ? '' : (void 0)} data-hx-table-cell-odd-row=""
			     data-hx-table-cell-last-row=""
			     data-hx-table-cell-sticky="" data-hx-table-cell-sticky-left=""
			     data-hx-table-cell-z-index="1"
			     style={cellStyle}
			     onMouseEnter={renderAsForm ? (void 0) : onMouseEnter}
			     onMouseLeave={renderAsForm ? (void 0) : onMouseLeave}>
				<HxLabel text={noDataKey}/>
			</div>
			<div data-hx-table-body="end"
			     data-hx-table-body-start-column={startCol} data-hx-table-body-end-column={endCol}
			     data-hx-table-body-start-row={rowOffset + startRow} data-hx-table-body-end-row={rowOffset + endRow}/>
		</>;
	} else {
		// redress the nested cells expanding state
		for (const expanded of nestedExpandRef.current.keys()) {
			if (!array.includes(expanded)) {
				nestedExpandRef.current.delete(expanded);
			}
		}

		const lastFixedColumnToLeft = fixedStartColumns ?? 0;
		const firstFixedColumnToRight = fixedEndColumns == null ? Infinity : (state.headerColumnCount - fixedEndColumns + 1);
		const startRowOffset = ignoreHeaders ? 0 : state.headerRowCount;
		let rowOffset = startRowOffset;
		let maxCol: number = 0;
		let maxRow: number = rowOffset;

		return <>
			<div data-hx-table-body="start"/>
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

				return <Fragment key={arrayRowIndex}>
					{cells.map((cell, cellIndex) => {
						const [startCol, endCol, colCss] = computeCellColumnCssProperty(cell.col, cell.cols);
						maxCol = Math.max(maxCol, endCol);
						const [startRow, endRow, rowCss] = computeCellRowCssProperty(currentRowOffset + cell.row, cell.rows);
						maxRow = Math.max(maxRow, endRow);
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
							// row index cell always sticky to left,
							const hasRowIndex = (cell as HxTableComputedStdBodyCell).rowIndex;
							const hasNestedRowOperator = (cell as HxTableComputedStdBodyCell).nestedRowOperator;
							const nestedRowExpanded = hasNestedRowOperator && nestedExpandRef.current.has(rowData);
							const nestedRowCollapsed = hasNestedRowOperator && !nestedExpandRef.current.has(rowData);
							// replace the CSS properties and node attributes
							attrs.style = {
								...attrs.style,
								// @ts-expect-error ignore type check
								'--hx-table-cell-sticky': 'sticky',
								'--hx-table-cell-sticky-left': '0px',
								'--hx-table-cell-z-index': '2'
							};
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							let onExpandClick: HxLabelProps<any>['onClick'] | undefined = (void 0);
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							let onCollapseClick: HxLabelProps<any>['onClick'] | undefined = (void 0);
							if (nestedRowCollapsed) {
								onExpandClick = (ev: MouseEvent<HTMLSpanElement>) => {
									const target = ev.target as HTMLSpanElement;
									const div = target.closest<HTMLDivElement>('div[data-hx-table-nested-row-operator]');
									nestedExpandRef.current.set(rowData, true);
									div?.setAttribute('data-hx-table-nested-row-expanded', '');
									div?.removeAttribute('data-hx-table-nested-row-collapsed');
									tableContext.toggleResizeMonitor(false);
									let cellOfRow = div?.nextElementSibling as HTMLDivElement | null;
									while (cellOfRow != null) {
										// nested cell is block end, check it first
										if (cellOfRow.hasAttribute('data-hx-table-body-nested-cell')) {
											cellOfRow.setAttribute('data-hx-table-body-nested-row-expanded', '');
											break;
										} else if (cellOfRow.hasAttribute('data-hx-table-cell-block-end')) {
											cellOfRow.setAttribute('data-hx-table-body-nested-row-expanded', '');
										}
										cellOfRow = cellOfRow.nextElementSibling as HTMLDivElement | null;
									}
									tableContext.toggleResizeMonitor(true);
								};
								onCollapseClick = (ev: MouseEvent<HTMLSpanElement>) => {
									const target = ev.target as HTMLSpanElement;
									const div = target.closest<HTMLDivElement>('div[data-hx-table-nested-row-operator]');
									nestedExpandRef.current.delete(rowData);
									div?.removeAttribute('data-hx-table-nested-row-expanded');
									div?.setAttribute('data-hx-table-nested-row-collapsed', '');
									tableContext.toggleResizeMonitor(false);
									let cellOfRow = div?.nextElementSibling as HTMLDivElement | null;
									while (cellOfRow != null) {
										// nested cell is block end, check it first
										if (cellOfRow.hasAttribute('data-hx-table-body-nested-cell')) {
											cellOfRow.removeAttribute('data-hx-table-body-nested-row-expanded');
											break;
										} else if (cellOfRow.hasAttribute('data-hx-table-cell-block-end')) {
											cellOfRow.removeAttribute('data-hx-table-body-nested-row-expanded');
										}
										cellOfRow = cellOfRow.nextElementSibling as HTMLDivElement | null;
									}
									tableContext.toggleResizeMonitor(true);
								};
							}
							return <div data-hx-table-body-cell=""
							            data-hx-table-row-index=""
							            data-hx-table-nested-row-operator={hasNestedRowOperator ? '' : (void 0)}
							            data-hx-table-nested-row-expanded={nestedRowExpanded ? '' : (void 0)}
							            data-hx-table-nested-row-collapsed={nestedRowCollapsed ? '' : (void 0)}
							            {...attrs}
							            data-hx-table-cell-sticky=""
							            data-hx-table-cell-sticky-left=""
							            data-hx-table-cell-z-index="1"
							            key="row-index-cell">
								{hasRowIndex
									? <HxLabel data-hx-table-row-index-label=""
									           text={rowIndexOffset + arrayRowIndex + 1}/>
									: (void 0)}
								{hasNestedRowOperator
									? <>
										<HxLabel data-hx-table-nested-row-operator-expand=""
										         clickable={true} text={<Plus/>}
										         onClick={onExpandClick}/>
										<HxLabel data-hx-table-nested-row-operator-collapse=""
										         clickable={true} text={<Minus/>}
										         onClick={onCollapseClick}/>
									</>
									: (void 0)}
							</div>;
						} else if ((cell as HxTableComputedStdBodyCell | HxTableComputedGroupBodyCell).assistEmpty) {
							return <div data-hx-table-body-cell="" data-hx-table-body-assist-empty-cell=""
							            data-hx-table-body-group-cell={groupCell ? '' : (void 0)}
							            {...attrs} key={cellIndex}/>;
						} else {
							return <div data-hx-table-body-cell=""
							            data-hx-table-body-nested-cell={nestedCell ? '' : (void 0)}
							            data-hx-table-body-nested-row-expanded={(nestedCell && nestedExpandRef.current.has(rowData)) ? '' : (void 0)}
							            data-hx-table-body-group-cell={groupCell ? '' : (void 0)}
							            data-hx-table-body-group-full-line-cell={fullLineGroupCell ? '' : (void 0)}
							            {...attrs} key={cellIndex}>
								{DOMUtils.interposeToChildren({$model: rowData}, cell.content)}
							</div>;
						}
					})}
				</Fragment>;
			})}
			<div data-hx-table-body="end"
			     data-hx-table-body-start-column={maxCol > 0 ? 1 : 0} data-hx-table-body-end-column={maxCol}
			     data-hx-table-body-start-row={maxRow > startRowOffset ? (startRowOffset + 1) : startRowOffset}
			     data-hx-table-body-end-row={maxRow}/>
		</>;
	}
};
