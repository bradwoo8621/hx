// @ts-expect-error import React
import React, {type CSSProperties, useEffect, useState} from 'react';
import {HxLabel} from '../label';
import {HxTableDefaults} from './defaults';
import {useHxTable} from './table-provider';
import type {HxTableComputedHeaderCells, HxTableLayout, HxTableProps} from './types';
import {computeCellColumnCssProperty, computeCellRowCssProperty} from './utils';

export type HxTableHeaderProps<T extends object> =
	& Required<Pick<HxTableProps<T>, 'columnGridLines'>>
	& Pick<HxTableProps<T>, 'headers' | 'fixedStartColumns' | 'fixedEndColumns' | 'ignoreHeaders'>
	& { scrollable: boolean };

interface HxTableHeaderState {
	initialized: boolean;
	cells: HxTableComputedHeaderCells;
	columnCount: number;
	rowCount: number;
}

export const HxTableHeader = <T extends object>(props: HxTableHeaderProps<T>) => {
	const {columnGridLines, fixedStartColumns, fixedEndColumns, ignoreHeaders = false, scrollable} = props;

	const tableContext = useHxTable();
	const [state, setState] = useState<HxTableHeaderState>({
		initialized: false, cells: [], columnCount: 0, rowCount: 0
	});
	useEffect(() => {
		const onLayoutInitialized = (layout: HxTableLayout) => {
			setState({
				initialized: true,
				cells: layout.headers,
				columnCount: layout.headerColumnCount, rowCount: layout.headerRowCount
			});
		};

		tableContext.onLayoutInitialized(onLayoutInitialized);
		return () => {
			tableContext.offLayoutInitialized(onLayoutInitialized);
		};
	}, [tableContext]);
	useEffect(() => {
		if (!state.initialized) {
			return;
		}

		tableContext.contentLayout();
	});

	if (!state.initialized) {
		return (void 0);
	}

	const lastFixedColumnToLeft = fixedStartColumns ?? 0;
	const firstFixedColumnToRight = fixedEndColumns == null ? Infinity : (state.columnCount - fixedEndColumns + 1);

	return <>
		<div data-hx-table-header="start"/>
		{!ignoreHeaders && state.cells.map((header, index) => {
			const [startCol, endCol, colCss] = computeCellColumnCssProperty(header.col, header.cols);
			const [startRow, endRow, rowCss] = computeCellRowCssProperty(header.row, header.rows);
			const stickyAtTop = scrollable;
			const stickyAtLeft = endCol <= lastFixedColumnToLeft;
			const lastStickyAtLeft = endCol === lastFixedColumnToLeft;
			const stickyAtRight = startCol >= firstFixedColumnToRight;
			const firstStickyAtRight = startCol === firstFixedColumnToRight;
			const sticky = stickyAtTop || stickyAtLeft || stickyAtRight;
			const attrs = {
				'data-hx-table-cell-start-row': startRow,
				'data-hx-table-cell-end-row': endRow,
				'data-hx-table-cell-start-column': startCol,
				'data-hx-table-cell-end-column': endCol,
				'data-hx-table-cell-sticky': sticky ? '' : (void 0),
				'data-hx-table-cell-sticky-top': stickyAtTop ? '' : (void 0),
				'data-hx-table-cell-sticky-left': stickyAtLeft ? '' : (void 0),
				'data-hx-table-cell-last-sticky-left': lastStickyAtLeft ? '' : (void 0),
				'data-hx-table-cell-sticky-right': stickyAtRight ? '' : (void 0),
				'data-hx-table-cell-first-sticky-right': firstStickyAtRight ? '' : (void 0),
				'data-hx-padding-x': header.indent ?? HxTableDefaults.headerCellIndent,
				'data-hx-table-cell-column-grid-line': columnGridLines ? '' : (void 0),
				'data-hx-table-cell-block-end': header.blockEndOfRow ? '' : (void 0),
				'data-hx-table-cell-inline-end': header.inlineEndOfRow ? '' : (void 0),
				'data-hx-table-cell-z-index': sticky ? (stickyAtLeft ? '3' : '2') : (void 0),
				style: {
					'--hx-table-cell-row-this': rowCss,
					'--hx-table-cell-column-this': colCss,
					'--hx-table-cell-sticky': sticky ? 'sticky' : (void 0),
					'--hx-table-cell-z-index': sticky ? (stickyAtLeft ? '3' : '2') : (void 0)
				} as CSSProperties
			};
			if (header.rowIndex) {
				// row index cell always sticky to top and left,
				// replace the CSS properties and node attributes
				attrs.style = {
					...attrs.style,
					// @ts-expect-error ignore type check
					'--hx-table-cell-sticky': 'sticky',
					'--hx-table-cell-sticky-top': '0px',
					'--hx-table-cell-sticky-left': '0px',
					'--hx-table-cell-z-index': '4'
				};
				return <div data-hx-table-header-cell="" data-hx-table-row-index=""
				            {...attrs}
				            data-hx-table-cell-sticky=""
				            data-hx-table-cell-sticky-top="" data-hx-table-cell-sticky-left=""
				            data-hx-table-cell-z-index="3"
				            key="row-index-cell"/>;
			} else if (header.assistEmpty) {
				return <div data-hx-table-header-cell="" data-hx-table-assist-empty=""
				            {...attrs} key={index}/>;
			} else {
				return <div data-hx-table-header-cell=""
				            {...attrs} key={index}>
					<HxLabel text={header.title}/>
				</div>;
			}
		})}
		<div data-hx-table-header="end"
		     data-hx-table-header-start-column={ignoreHeaders ? 0 : 1}
		     data-hx-table-header-end-column={ignoreHeaders ? 0 : state.columnCount}
		     data-hx-table-header-start-row={ignoreHeaders ? 0 : 1}
		     data-hx-table-header-end-row={ignoreHeaders ? 0 : state.rowCount}/>
	</>;
};
