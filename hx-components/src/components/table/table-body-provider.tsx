import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type MutableRefObject, type ReactNode, useContext, useRef, useState} from 'react';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';

/**
 * context of the table body. tracks the nested row expansion state, keyed by row data
 * (the ERO-revoked raw object, so proxied and raw row data of the same row share one entry),
 * and the body grid extent, i.e. the furthest row and column reached by body cells.
 */
export interface HxTableBodyContext extends HxReactContext {
	/** clear the nested row expansion state, collapse all expanded nested rows */
	clearNestedRowExpansionState(): void;
	/** drop expansion entries whose row data no longer exists in the given current data array */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	redressNestedRowExpansionState(array: Array<any>): void;
	/** return whether the nested content of the given row data is expanded */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	isNestedRowExpanded(rowData: any): boolean;
	/** set the nested content of the given row data expanded or collapsed */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setNestedRowExpansionState(rowData: any, expanded: boolean): void;
}

const Context = createHxReactContext<HxTableBodyContext>('HxTableBodyContext');

class HxTableBodyContextImpl extends AbstractHxReactContext implements HxTableBodyContext {
	private readonly nestedExpandRef: MutableRefObject<Map<object, true>>;

	constructor(nestedExpandRef: MutableRefObject<Map<object, true>>) {
		super();
		this.nestedExpandRef = nestedExpandRef;
	}

	/** @inheritdoc */
	clearNestedRowExpansionState(): void {
		this.nestedExpandRef.current.clear();
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	redressNestedRowExpansionState(array: Array<any>): void {
		for (const expanded of this.nestedExpandRef.current.keys()) {
			if (!array.some(row => ERO.revoke(row) === expanded)) {
				this.nestedExpandRef.current.delete(expanded);
			}
		}
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	isNestedRowExpanded(rowData: any): boolean {
		return this.nestedExpandRef.current.has(ERO.revoke(rowData));
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setNestedRowExpansionState(rowData: any, expanded: boolean): void {
		if (expanded) {
			this.nestedExpandRef.current.set(ERO.revoke(rowData), true);
		} else {
			this.nestedExpandRef.current.delete(ERO.revoke(rowData));
		}
	}
}

export const HxTableBodyProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const nestedExpandRef = useRef<Map<object, true>>(new Map());
	const [tableBodyContext] = useState<HxTableBodyContext>(() => new HxTableBodyContextImpl(nestedExpandRef));

	return <Context.Provider value={tableBodyContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxTableBody = () => useContext(Context);
