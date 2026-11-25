// @ts-expect-error import React
import React, {type HTMLAttributes, useRef} from 'react';
import {useHxHierarchyBound} from '../../contexts';

/** props of the assist empty cell, an empty cell filling a matrix gap left by vertically merged cells */
export interface HxTableBodyAssistEmptyCellProps {
	/** whether the cell belongs to a group row */
	groupCell: boolean;
	/** common DOM attributes and handlers of the cell computed by the row, e.g. grid position, sticky state, stripe flags and hover handlers */
	domAttrs: HTMLAttributes<HTMLDivElement>;
}

export const HxTableBodyAssistEmptyCell = (props: HxTableBodyAssistEmptyCellProps) => {
	const {groupCell, domAttrs} = props;

	const cellRef = useRef<HTMLDivElement>(null);
	useHxHierarchyBound(cellRef);

	return <div data-hx-table-body-cell="" data-hx-table-body-assist-empty-cell=""
	            data-hx-table-body-group-cell={groupCell ? '' : (void 0)}
	            {...domAttrs}
	            ref={cellRef}/>;
};
