// @ts-expect-error import React
import React from 'react';
import {HxTableBodyCellProvider} from './table-body-cell-provider';
import {HxTableBodyNoDataCell, type HxTableBodyNoDataCellProps} from './table-body-no-data-cell';

export type HxTableBodyNoDataRowProps = HxTableBodyNoDataCellProps;

export const HxTableBodyNoDataRow = (props: HxTableBodyNoDataRowProps) => {
	return <HxTableBodyCellProvider>
		<HxTableBodyNoDataCell {...props}/>
	</HxTableBodyCellProvider>;
};
