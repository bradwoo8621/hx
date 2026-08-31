// @ts-expect-error import React
import React from 'react';
import type {HxTableProps} from './types';

export type HxTableBodyProps<T extends object> =
	Required<Pick<HxTableProps<T>, 'rowIndex' | 'columnGridLines'>>
	& Pick<HxTableProps<T>, 'maxBodyHeight' | 'columns'>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const HxTableBody = <T extends object>(_props: HxTableBodyProps<T>) => {
	return <>
		<div data-hx-table-body="start"/>

		<div data-hx-table-body="end"/>
	</>;
};
