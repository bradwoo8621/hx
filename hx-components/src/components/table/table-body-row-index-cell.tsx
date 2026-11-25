// @ts-expect-error import React
import React, {type HTMLAttributes, type MouseEvent, useRef} from 'react';
import {useHxHierarchyBound} from '../../contexts';
import {Minus, Plus} from '../icons';
import {HxLabel, type HxLabelProps} from '../label';
import {useHxTableBody} from './table-body-provider';
import {useHxTable} from './table-provider';
import type {HxTableComputedStdBodyCell} from './types';

/** props of the row index cell, the sticky leading cell showing the row number and/or the nested row expand/collapse operator */
export interface HxTableBodyRowIndexCellProps {
	/** row data object, used as the nested row expansion key and the $model of cell content interpolation */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rowData: any;

	/** computed body cell of this cell, carrying the rowIndex / nestedRowOperator kind flags */
	cell: HxTableComputedStdBodyCell;
	/** offset added to the array row index for the displayed row number, e.g. the pagination start index */
	rowIndexOffset: number;
	/** zero-based index of the row in the current data array */
	arrayRowIndex: number;

	/** common DOM attributes and handlers of the cell computed by the row, e.g. grid position, sticky state, stripe flags and hover handlers */
	domAttrs: HTMLAttributes<HTMLDivElement>;
}

export const HxTableBodyRowIndexCell = (props: HxTableBodyRowIndexCellProps) => {
	const {
		rowData, cell,
		rowIndexOffset, arrayRowIndex, domAttrs
	} = props;

	const tableContext = useHxTable();
	const tableBodyContext = useHxTableBody();
	const cellRef = useRef<HTMLDivElement>(null);
	useHxHierarchyBound(cellRef);

	// row index cell always sticky to left,
	const hasRowIndex = (cell as HxTableComputedStdBodyCell).rowIndex;
	const hasNestedRowOperator = (cell as HxTableComputedStdBodyCell).nestedRowOperator;
	const nestedRowExpanded = hasNestedRowOperator && tableBodyContext.isNestedRowExpanded(rowData);
	const nestedRowCollapsed = hasNestedRowOperator && !nestedRowExpanded;
	// replace the CSS properties and node attributes
	const attrs = {
		...domAttrs,
		style: {
			...(domAttrs.style ?? {}),
			'--hx-table-cell-sticky': 'sticky',
			'--hx-table-cell-sticky-left': '0px',
			'--hx-table-cell-z-index': '2'
		}
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let onExpandClick: HxLabelProps<any>['onClick'] | undefined = (void 0);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let onCollapseClick: HxLabelProps<any>['onClick'] | undefined = (void 0);
	if (hasNestedRowOperator) {
		onExpandClick = (ev: MouseEvent<HTMLSpanElement>) => {
			const target = ev.target as HTMLSpanElement;
			const div = target.closest<HTMLDivElement>('div[data-hx-table-nested-row-operator]');
			tableBodyContext.setNestedRowExpansionState(rowData, true);
			div?.setAttribute('data-hx-table-nested-row-expanded', '');
			div?.removeAttribute('data-hx-table-nested-row-collapsed');
			tableContext.toggleResizeMonitor(false);
			let cellOfRow = div?.nextElementSibling as HTMLDivElement | null;
			while (cellOfRow != null) {
				// nested cell is block end, check it first
				if (cellOfRow.hasAttribute('data-hx-table-body-nested-cell')) {
					cellOfRow.setAttribute('data-hx-table-body-nested-row-expanded', '');
					break;
				} else if (cellOfRow.hasAttribute('data-hx-table-cell-block-end')) {
					cellOfRow.setAttribute('data-hx-table-body-nested-row-expanded', '');
				}
				cellOfRow = cellOfRow.nextElementSibling as HTMLDivElement | null;
			}
			tableContext.toggleResizeMonitor(true);
		};
		onCollapseClick = (ev: MouseEvent<HTMLSpanElement>) => {
			const target = ev.target as HTMLSpanElement;
			const div = target.closest<HTMLDivElement>('div[data-hx-table-nested-row-operator]');
			tableBodyContext.setNestedRowExpansionState(rowData, false);
			div?.removeAttribute('data-hx-table-nested-row-expanded');
			div?.setAttribute('data-hx-table-nested-row-collapsed', '');
			tableContext.toggleResizeMonitor(false);
			let cellOfRow = div?.nextElementSibling as HTMLDivElement | null;
			while (cellOfRow != null) {
				// nested cell is block end, check it first
				if (cellOfRow.hasAttribute('data-hx-table-body-nested-cell')) {
					cellOfRow.removeAttribute('data-hx-table-body-nested-row-expanded');
					break;
				} else if (cellOfRow.hasAttribute('data-hx-table-cell-block-end')) {
					cellOfRow.removeAttribute('data-hx-table-body-nested-row-expanded');
				}
				cellOfRow = cellOfRow.nextElementSibling as HTMLDivElement | null;
			}
			tableContext.toggleResizeMonitor(true);
		};
	}
	return <div data-hx-table-body-cell=""
	            data-hx-table-row-index=""
	            data-hx-table-nested-row-operator={hasNestedRowOperator ? '' : (void 0)}
	            data-hx-table-nested-row-expanded={nestedRowExpanded ? '' : (void 0)}
	            data-hx-table-nested-row-collapsed={nestedRowCollapsed ? '' : (void 0)}
	            {...attrs}
	            data-hx-table-cell-sticky=""
	            data-hx-table-cell-sticky-left=""
	            data-hx-table-cell-z-index="1"
	            ref={cellRef}>
		{hasRowIndex
			? <HxLabel data-hx-table-row-index-label=""
			           text={rowIndexOffset + arrayRowIndex + 1}/>
			: (void 0)}
		{hasNestedRowOperator
			? <>
				<HxLabel data-hx-table-nested-row-operator-expand=""
				         clickable={true} text={<Plus/>}
				         onClick={onExpandClick}/>
				<HxLabel data-hx-table-nested-row-operator-collapse=""
				         clickable={true} text={<Minus/>}
				         onClick={onCollapseClick}/>
			</>
			: (void 0)}
	</div>;
};
