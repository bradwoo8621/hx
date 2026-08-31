// @ts-expect-error import React
import React from 'react';
import {HxLabel} from '../label';
import type {HxTableProps} from './types';

export type HxTableHeaderProps<T extends object> =
	Required<Pick<HxTableProps<T>, 'rowIndex' | 'columnGridLines'>>
	& Pick<HxTableProps<T>, 'headers'>;

export const HxTableHeader = <T extends object>(props: HxTableHeaderProps<T>) => {
	const {columnGridLines, rowIndex, headers} = props;

	// TODO hold the parameter for future usage
	console.log(columnGridLines);

	return <>
		<div data-hx-table-header="start"/>
		{rowIndex
			? <div data-hx-table-header-cell="" data-hx-table-row-index=""/>
			: (void 0)}
		{headers.map((header, index) => {
			return <div data-hx-table-header-cell=""
			            data-hx-grid-cell-cols={header.cols} data-hx-grid-cell-rows={header.rows}
			            key={index}>
				<HxLabel text={header.title}/>
			</div>;
		})}
		<div data-hx-table-header="end"/>
	</>;
};
