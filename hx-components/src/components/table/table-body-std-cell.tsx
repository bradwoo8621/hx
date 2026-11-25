import {type HTMLAttributes, useRef} from 'react';
import {useHxHierarchyBound} from '../../contexts';
import {DOMUtils} from '../../utils';
import {useHxTableBody} from './table-body-provider';
import type {HxTableComputedStdBodyCell} from './types';

/** props of a standard body cell, rendering the declared content with the row data interposed as the $model */
export interface HxTableBodyStdCellProps {
	/** row data object, used as the nested row expansion key and the $model of cell content interpolation */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rowData: any;

	/** computed body cell, carrying the declared content */
	cell: HxTableComputedStdBodyCell;
	/** whether the cell belongs to a group row */
	groupCell: boolean;
	/** whether the cell is a full-line group cell grabbing all columns */
	fullLineGroupCell: boolean;
	/** whether the cell is the nested row cell of its row */
	nestedCell: boolean;

	/** common DOM attributes and handlers of the cell computed by the row, e.g. grid position, sticky state, stripe flags and hover handlers */
	domAttrs: HTMLAttributes<HTMLDivElement>;
}

export const HxTableBodyStdCell = (props: HxTableBodyStdCellProps) => {
	const {
		rowData, cell,
		groupCell, fullLineGroupCell, nestedCell,
		domAttrs
	} = props;

	const tableBodyContext = useHxTableBody();
	const cellRef = useRef<HTMLDivElement>(null);
	useHxHierarchyBound(cellRef);

	return <div data-hx-table-body-cell=""
	            data-hx-table-body-nested-cell={nestedCell ? '' : (void 0)}
	            data-hx-table-body-nested-row-expanded={(nestedCell && tableBodyContext.isNestedRowExpanded(rowData)) ? '' : (void 0)}
	            data-hx-table-body-group-cell={groupCell ? '' : (void 0)}
	            data-hx-table-body-group-full-line-cell={fullLineGroupCell ? '' : (void 0)}
	            {...domAttrs}
	            ref={cellRef}>
		{DOMUtils.interposeToChildren({$model: rowData}, cell.content)}
	</div>;
};
