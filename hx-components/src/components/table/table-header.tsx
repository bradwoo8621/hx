// @ts-expect-error import React
import React, {type CSSProperties, useEffect, useState} from 'react';
import {HxLabel} from '../label';
import {useHxTable} from './table-provider';
import type {HxTableComputedHeaderCells, HxTableLayout, HxTableProps} from './types';
import {computeCellColumnCssProperty, computeCellRowCssProperty} from './utils';

export type HxTableHeaderProps<T extends object> =
	& Required<Pick<HxTableProps<T>, 'columnGridLines'>>
	& Pick<HxTableProps<T>, 'headers'>;

interface HxTableHeaderState {
	initialized: boolean;
	cells: HxTableComputedHeaderCells;
}

export const HxTableHeader = <T extends object>(props: HxTableHeaderProps<T>) => {
	const {columnGridLines} = props;

	const tableContext = useHxTable();
	const [state, setState] = useState<HxTableHeaderState>({initialized: false, cells: []});
	useEffect(() => {
		const onLayoutInitialized = (layout: HxTableLayout) => {
			setState({initialized: true, cells: layout.header});
		};

		tableContext.onLayoutInitialized(onLayoutInitialized);
		return () => {
			tableContext.offLayoutInitialized(onLayoutInitialized);
		};
	}, [state.initialized, tableContext]);

	if (!state.initialized) {
		return (void 0);
	}
	// TODO hold the parameter for future usage
	console.debug(columnGridLines);

	return <>
		<div data-hx-table-header="start"/>
		{state.cells.map((header, index) => {
			const cellStyle: CSSProperties = {
				// @ts-expect-error ignore the style name check
				'--cell-row': computeCellRowCssProperty(header.row, header.rows),
				'--cell-column': computeCellColumnCssProperty(header.col, header.cols)
			};
			if (header.rowIndex) {
				return <div data-hx-table-header-cell="" data-hx-table-row-index="" style={cellStyle}
				            key="row-index-cell"/>;
			} else if (header.assistEmpty) {
				return <div data-hx-table-header-cell="" data-hx-table-assist-empty="" style={cellStyle} key={index}/>;
			} else {
				return <div data-hx-table-header-cell="" style={cellStyle} key={index}>
					<HxLabel text={header.title}/>
				</div>;
			}
		})}
		<div data-hx-table-header="end"/>
	</>;
};
