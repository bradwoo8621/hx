// @ts-expect-error import React
import React, {type ReactNode, useContext, useRef, useState} from 'react';
import {HxHierarchyProvider} from '../../contexts';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';
import {useHxTableBody} from './table-body-provider.tsx';

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

export interface HxTableBodyRowProviderProps {
	/** row data object, used as the nested row expansion key and the $model of cell content interpolation */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	hasNestedCell: boolean;

	children: ReactNode;
}

export const HxTableBodyRowProvider = (props: HxTableBodyRowProviderProps) => {
	const {data: rowData, hasNestedCell, children} = props;

	const tableBodyContext = useHxTableBody();
	const cacheRef = useRef({rowData, hasNestedCell});
	// always keep synchronized
	cacheRef.current = {rowData, hasNestedCell};
	const [tableBodyRowContext] = useState<HxTableBodyRowContext>(() => new class extends AbstractHxReactContext implements HxTableBodyRowContext {
		/** @inheritdoc */
		hasNestedRow(): boolean {
			return cacheRef.current.hasNestedCell;
		}

		private isNestedRowExpandedOnBodyExpansionState(): boolean {
			return tableBodyContext.isNestedRowExpanded(cacheRef.current.rowData);
		}

		/** @inheritdoc */
		isNestedRowExpanded(): boolean {
			return this.hasNestedRow() && this.isNestedRowExpandedOnBodyExpansionState();
		}

		/** @inheritdoc */
		collapseNestedRow(): void {
			if (!this.hasNestedRow() || !this.isNestedRowExpandedOnBodyExpansionState()) {
				return;
			}
			// TODO
		}

		/** @inheritdoc */
		expandNestedRow(): void {
			if (!this.hasNestedRow() || this.isNestedRowExpandedOnBodyExpansionState()) {
				return;
			}
			// TODO
		}
	});

	return <Context.Provider value={tableBodyRowContext}>
		<HxHierarchyProvider context={tableBodyRowContext} contextDisplayName="HxTableBodyRowContext">
			{children}
		</HxHierarchyProvider>
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxTableBodyRow = () => useContext(Context);
