// @ts-expect-error import React
import React, {type CSSProperties, useEffect, useState} from 'react';
import {HxLabel} from '../label';
import {HxTableDefaults} from './defaults';
import {useHxTable} from './table-provider';
import type {HxTableComputedHeaderCells, HxTableLayout, HxTableProps} from './types';
import {computeCellColumnCssProperty, computeCellRowCssProperty} from './utils';

export type HxTableHeaderProps<T extends object> =
	& Required<Pick<HxTableProps<T>, 'columnGridLines'>>
	& Pick<HxTableProps<T>, 'headers' | 'ignoreHeaders'>;

interface HxTableHeaderState {
	initialized: boolean;
	cells: HxTableComputedHeaderCells;
	columnCount: number;
	rowCount: number;
}

export const HxTableHeader = <T extends object>(props: HxTableHeaderProps<T>) => {
	const {columnGridLines, ignoreHeaders = false} = props;

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
	}, [state.initialized, tableContext]);

	if (!state.initialized) {
		return (void 0);
	}

	return <>
		<div data-hx-table-header="start"/>
		{!ignoreHeaders && state.cells.map((header, index) => {
			const attrs = {
				'data-hx-padding-x': header.indent ?? HxTableDefaults.headerCellIndent,
				'data-hx-table-cell-column-grid-line': columnGridLines ? '' : (void 0),
				'data-hx-table-cell-inline-end': header.inlineEndOfRow ? '' : (void 0),
				style: {
					'--cell-row': computeCellRowCssProperty(header.row, header.rows),
					'--cell-column': computeCellColumnCssProperty(header.col, header.cols)
				} as CSSProperties
			};
			if (header.rowIndex) {
				return <div data-hx-table-header-cell="" data-hx-table-row-index=""
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
