// @ts-expect-error import React
import React, {type HTMLAttributes, useRef} from 'react';
import {useHxHierarchyBound} from '../../contexts';
import {useHxTableBody} from './table-body-provider';

/** props of the assist empty cell, an empty cell filling a matrix gap left by vertically merged cells */
export interface HxTableBodyAssistEmptyCellProps {
	/** row data object, used as the nested row expansion key and the $model of cell content interpolation */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rowData: any;

	/** whether the cell belongs to a group row */
	groupCell: boolean;

	/** common DOM attributes and handlers of the cell computed by the row, e.g. grid position, sticky state, stripe flags and hover handlers */
	domAttrs: HTMLAttributes<HTMLDivElement>;
}

export const HxTableBodyAssistEmptyCell = (props: HxTableBodyAssistEmptyCellProps) => {
	const {rowData, groupCell, domAttrs} = props;

	const tableBodyContext = useHxTableBody();
	const cellRef = useRef<HTMLDivElement>(null);
	useHxHierarchyBound(cellRef);

	// @ts-expect-error ignore check
	const blockEndCell: boolean = domAttrs['data-hx-table-cell-block-end'] ?? false;
	// when the cell is
	// - nested cell
	// - not group cell and is block end cell
	// check the row expanded state
	const rowExpanded = (blockEndCell && !groupCell) && tableBodyContext.isNestedRowExpanded(rowData);

	return <div data-hx-table-body-cell="" data-hx-table-body-assist-empty-cell=""
	            data-hx-table-body-nested-row-expanded={rowExpanded ? '' : (void 0)}
	            data-hx-table-body-group-cell={groupCell ? '' : (void 0)}
	            {...domAttrs}
	            ref={cellRef}/>;
};
