// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
import {type HxContext, HxHierarchyProvider} from '../../contexts';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';
import {type HxTableBodyRowContext, useHxTableBodyRow} from './table-body-row-provider';

/**
 * context of a single body cell, provided per cell and bound to the cell DOM element,
 * so content rendered inside the cell can query and toggle the nested row state
 * of the row the cell belongs to
 */
export interface HxTableBodyCellContext extends HxReactContext {
	/** return whether the row this cell belongs to has a nested row */
	hasNestedRow(): boolean;
	/** return whether the nested row of this cell's row is expanded */
	isNestedRowExpanded(): boolean;
	/** collapse the nested row of this cell's row */
	collapseNestedRow(): void;
	/** expand the nested row of this cell's row */
	expandNestedRow(): void;
}

const Context = createHxReactContext<HxTableBodyCellContext>('HxTableBodyCellContext');

class HxTableBodyCellContextImpl extends AbstractHxReactContext implements HxTableBodyCellContext {
	private readonly rowContext: HxTableBodyRowContext;

	constructor(rowContext: HxTableBodyRowContext) {
		super();
		this.rowContext = rowContext;
	}

	/** @inheritdoc */
	hasNestedRow(): boolean {
		return this.rowContext.hasNestedRow();
	}

	/** @inheritdoc */
	isNestedRowExpanded(): boolean {
		return this.rowContext.isNestedRowExpanded();
	}

	/** @inheritdoc */
	collapseNestedRow(): void {
		this.rowContext.collapseNestedRow();
	}

	/** @inheritdoc */
	expandNestedRow(): void {
		this.rowContext.expandNestedRow();
	}
}

export const HxTableBodyCellProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const tableBodyRowContext = useHxTableBodyRow();
	const [tableBodyCellContext] = useState<HxTableBodyCellContext>(() => new HxTableBodyCellContextImpl(tableBodyRowContext));

	return <Context.Provider value={tableBodyCellContext}>
		<HxHierarchyProvider context={tableBodyCellContext} contextDisplayName="HxTableBodyCellContext">
			{children}
		</HxHierarchyProvider>
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxTableBodyCell = () => useContext(Context);

// eslint-disable-next-line react-refresh/only-export-components
export const findClosestHxTableBodyCell = (context: HxContext): HxTableBodyCellContext | undefined => {
	// noinspection CssInvalidHtmlTagReference
	return context.hierarchy?.closest<HxTableBodyCellContext>('HxTableBodyCellContext') ?? (void 0);
};
