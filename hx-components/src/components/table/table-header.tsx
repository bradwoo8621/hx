// @ts-expect-error import React
import React, {type CSSProperties, useEffect, useRef, useState} from 'react';
import {HxLabel} from '../label';
import {HxTableDefaults} from './defaults';
import {useHxTable} from './table-provider';
import type {HxTableComputedHeaderCells, HxTableLayout, HxTableProps} from './types';
import {computeCellColumnCssProperty, computeCellRowCssProperty} from './utils';

export type HxTableHeaderProps<T extends object> =
	& Required<Pick<HxTableProps<T>, 'columnGridLines'>>
	& Pick<HxTableProps<T>, 'headers' | 'ignoreHeaders'>
	& { scrollable: boolean };

interface HxTableHeaderState {
	initialized: boolean;
	cells: HxTableComputedHeaderCells;
	columnCount: number;
	rowCount: number;
}

export const HxTableHeader = <T extends object>(props: HxTableHeaderProps<T>) => {
	const {columnGridLines, ignoreHeaders = false, scrollable} = props;

	const tableContext = useHxTable();
	const headerStartRef = useRef<HTMLDivElement>(null);
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
		if (!state.initialized || headerStartRef.current == null) {
			return;
		}

		const startCell = headerStartRef.current;
		const contentDiv = startCell.parentElement as HTMLDivElement;
		const cells = contentDiv.querySelectorAll(':scope > div[data-hx-table-header-cell]');
		if (scrollable) {
			const {top: contentTop} = contentDiv.getBoundingClientRect();
			const computedContentStyle = getComputedStyle(contentDiv);
			const contentBorderBlockStart = parseInt(computedContentStyle.borderBlockStart || '0', 10);
			const contentPaddingBlockStart = parseInt(computedContentStyle.paddingBlockStart || '0', 10);
			cells.forEach(cell => {
				const el = cell as HTMLDivElement;
				const {top} = el.getBoundingClientRect();
				const cellTop = top - contentTop - contentPaddingBlockStart - contentBorderBlockStart;
				el.style.setProperty('--hx-table-cell-sticky', 'sticky');
				el.setAttribute('data-hx-table-cell-sticky', '');
				el.style.setProperty('--hx-table-cell-sticky-top', `${cellTop}px`);
				el.setAttribute('data-hx-table-cell-sticky-top', '');
				if (cell.hasAttribute('data-hx-table-row-index')) {
					// when horizontal scrollable, the standard header cell's z-index is 2
					// therefore the fixed inline-start header cell's z-index is 3
					el.style.setProperty('--hx-table-cell-z-index', '3');
					el.setAttribute('data-hx-table-cell-z-index', '3');
				} else {
					// the standard header cell's z-index is 2
					el.style.setProperty('--hx-table-cell-z-index', '2');
					el.setAttribute('data-hx-table-cell-z-index', '2');
				}
			});
		} else {
			cells.forEach(cell => {
				const el = cell as HTMLDivElement;
				el.style.removeProperty('--hx-table-cell-sticky-top');
				el.removeAttribute('data-hx-table-cell-sticky-top');
				if (cell.hasAttribute('data-hx-table-row-index')) {
					// row index cell always sticky to left
					el.style.setProperty('--hx-table-cell-z-index', '1');
					el.setAttribute('data-hx-table-cell-z-index', '1');
				} else {
					// horizontal scrollable is not allowed, the standard header cell is no need to sticky to top
					el.style.removeProperty('--hx-table-cell-sticky');
					el.removeAttribute('data-hx-table-cell-sticky');
					el.style.removeProperty('--hx-table-cell-z-index');
					el.removeAttribute('data-hx-table-cell-z-index');
				}
			});
		}
	}, [state.initialized, scrollable]);

	if (!state.initialized) {
		return (void 0);
	}

	return <>
		<div data-hx-table-header="start" ref={headerStartRef}/>
		{!ignoreHeaders && state.cells.map((header, index) => {
			const attrs = {
				'data-hx-padding-x': header.indent ?? HxTableDefaults.headerCellIndent,
				'data-hx-table-cell-column-grid-line': columnGridLines ? '' : (void 0),
				'data-hx-table-cell-block-end': header.blockEndOfRow ? '' : (void 0),
				'data-hx-table-cell-inline-end': header.inlineEndOfRow ? '' : (void 0),
				style: {
					'--hx-table-cell-row-this': computeCellRowCssProperty(header.row, header.rows),
					'--hx-table-cell-column-this': computeCellColumnCssProperty(header.col, header.cols)
				} as CSSProperties
			};
			if (header.rowIndex) {
				attrs.style = {
					...attrs.style,
					// row index cell always sticky to left
					// @ts-expect-error ignore type check
					'--hx-table-cell-sticky': 'sticky',
					'--hx-table-cell-sticky-left': '0',
					'--hx-table-cell-z-index': '1'
				};
				return <div data-hx-table-header-cell="" data-hx-table-row-index=""
				            data-hx-table-cell-sticky="" data-hx-table-cell-sticky-left=""
				            data-hx-table-cell-z-index="1"
				            {...attrs} key="row-index-cell"/>;
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
		<div data-hx-table-header="end"/>
	</>;
};
