// @ts-expect-error import React
import React, {type MutableRefObject, type ReactNode, type RefObject, useContext, useRef, useState} from 'react';
import {type HxContext, HxHierarchyProvider} from '../../contexts';
import {AbstractHxReactContext, createHxReactContext, HxConsole, type HxReactContext} from '../../utils';
import {type HxTableBodyContext, useHxTableBody} from './table-body-provider';
import {type HxTableContext, useHxTable} from './table-provider';

export interface HxTableBodyRowContext extends HxReactContext {
	/** return whether the row this cell belongs to has a nested row */
	hasNestedRow(): boolean;
	/** return whether the nested row of this cell's row is expanded */
	isNestedRowExpanded(): boolean;
	/** collapse the nested row of this cell's row */
	collapseNestedRow(): void;
	/** expand the nested row of this cell's row */
	expandNestedRow(): void;
}

const Context = createHxReactContext<HxTableBodyRowContext>('HxTableBodyRowContext');

interface HxTableBodyRowCacheRef {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rowData: any;
	hasNestedCell: boolean;
	arrayRowIndex: number;
}

class HxTableBodyRowContextImpl extends AbstractHxReactContext implements HxTableBodyRowContext {
	private readonly tableContext: HxTableContext;
	private readonly bodyContext: HxTableBodyContext;
	private readonly cacheRef: MutableRefObject<HxTableBodyRowCacheRef>;
	private readonly bodyStartRef: RefObject<HTMLDivElement>;

	constructor(
		tableContext: HxTableContext, bodyContext: HxTableBodyContext,
		cacheRef: MutableRefObject<HxTableBodyRowCacheRef>, bodyStartRef: RefObject<HTMLDivElement>
	) {
		super();
		this.tableContext = tableContext;
		this.bodyContext = bodyContext;
		this.cacheRef = cacheRef;
		this.bodyStartRef = bodyStartRef;
	}

	/** @inheritdoc */
	hasNestedRow(): boolean {
		return this.cacheRef.current.hasNestedCell;
	}

	private isNestedRowExpandedOnBodyExpansionState(): boolean {
		return this.bodyContext.isNestedRowExpanded(this.cacheRef.current.rowData);
	}

	/** @inheritdoc */
	isNestedRowExpanded(): boolean {
		return this.hasNestedRow() && this.isNestedRowExpandedOnBodyExpansionState();
	}

	/**
	 * DOM contracts the row finders and the expand/collapse sibling walks rely on:
	 * - body cells are direct children of the body grid container — the parent of the
	 *   body start marker — each carrying its 1-based {@code data-hx-table-row-number}
	 *   within the currently rendered data array; pagination keeps only one page in the
	 *   DOM, so the row number is unambiguous;
	 * - the cells of one row are contiguous siblings in template order, starting with
	 *   the nested row operator cell when the row has a nested cell — the walks start
	 *   from that cell and stop at the nested cell, the same class of adjacency
	 *   contract as the sort popup buttons.
	 */
	// @ts-expect-error ignore check
	private findFirstCellOfRow(): HTMLDivElement | null | undefined {
		return this.bodyStartRef.current?.parentElement?.querySelector<HTMLDivElement>(`:scope > div[data-hx-table-body-cell][data-hx-table-row-number="${this.cacheRef.current.arrayRowIndex + 1}"]`);
	}

	private findNestedRowOperatorCell(): HTMLDivElement | null | undefined {
		return this.bodyStartRef.current?.parentElement?.querySelector<HTMLDivElement>(`:scope > div[data-hx-table-body-cell][data-hx-table-nested-row-operator][data-hx-table-row-number="${this.cacheRef.current.arrayRowIndex + 1}"]`);
	}

	/** @inheritdoc */
	collapseNestedRow(): void {
		if (!this.hasNestedRow() || !this.isNestedRowExpandedOnBodyExpansionState()) {
			return;
		}
		const cell = this.findNestedRowOperatorCell();
		if (cell == null) {
			HxConsole.warn(`Nested row[${this.cacheRef.current.arrayRowIndex + 1}] operator cell not found, cannot collapse row.`);
			return;
		}
		this.bodyContext.setNestedRowExpansionState(this.cacheRef.current.rowData, false);
		cell.removeAttribute('data-hx-table-nested-row-expanded');
		cell.setAttribute('data-hx-table-nested-row-collapsed', '');
		this.tableContext.toggleResizeMonitor(false);
		let cellOfRow = cell.nextElementSibling as HTMLDivElement | null;
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
		this.tableContext.toggleResizeMonitor(true);
	}

	/** @inheritdoc */
	expandNestedRow(): void {
		if (!this.hasNestedRow() || this.isNestedRowExpandedOnBodyExpansionState()) {
			return;
		}
		const cell = this.findNestedRowOperatorCell();
		if (cell == null) {
			HxConsole.warn(`Nested row[${this.cacheRef.current.arrayRowIndex + 1}] operator cell not found, cannot expand row.`);
			return;
		}
		this.bodyContext.setNestedRowExpansionState(this.cacheRef.current.rowData, true);
		cell.setAttribute('data-hx-table-nested-row-expanded', '');
		cell.removeAttribute('data-hx-table-nested-row-collapsed');
		this.tableContext.toggleResizeMonitor(false);
		let cellOfRow = cell.nextElementSibling as HTMLDivElement | null;
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
		this.tableContext.toggleResizeMonitor(true);
	}
}

export interface HxTableBodyRowProviderProps {
	/** row data object, used as the nested row expansion key and the $model of cell content interpolation */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	hasNestedCell: boolean;
	arrayRowIndex: number;
	bodyStartRef: RefObject<HTMLDivElement>;

	children: ReactNode;
}

export const HxTableBodyRowProvider = (props: HxTableBodyRowProviderProps) => {
	const {data: rowData, hasNestedCell, arrayRowIndex, bodyStartRef, children} = props;

	const tableContext = useHxTable();
	const tableBodyContext = useHxTableBody();
	const cacheRef = useRef({rowData, hasNestedCell, arrayRowIndex});
	// always keep synchronized
	// eslint-disable-next-line react-hooks/refs
	cacheRef.current = {rowData, hasNestedCell, arrayRowIndex};
	const [tableBodyRowContext] = useState<HxTableBodyRowContext>(() => {
		return new HxTableBodyRowContextImpl(tableContext, tableBodyContext, cacheRef, bodyStartRef);
	});

	return <Context.Provider value={tableBodyRowContext}>
		<HxHierarchyProvider context={tableBodyRowContext} contextDisplayName="HxTableBodyRowContext">
			{children}
		</HxHierarchyProvider>
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxTableBodyRow = () => useContext(Context);

// eslint-disable-next-line react-refresh/only-export-components
export const findClosestHxTableBodyRow = (context: HxContext): HxTableBodyRowContext | undefined => {
	// noinspection CssInvalidHtmlTagReference
	return context.hierarchy?.closest<HxTableBodyRowContext>('HxTableBodyRowContext') ?? (void 0);
};
