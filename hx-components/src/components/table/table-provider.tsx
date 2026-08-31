import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {HxPaginationData} from '../pagination';

export interface HxTableContext {
	pageChange(pageNumber: number, pageSize: number, callback: (pagination: HxPaginationData) => void): void;
	onPageChange(listener: (pageNumber: number, pageSize: number, callback: (pagination: HxPaginationData) => void) => void): void;
	offPageChange(listener: (pageNumber: number, pageSize: number, callback: (pagination: HxPaginationData) => void) => void): void;
}

const Context = createContext<HxTableContext>({} as HxTableContext);
Context.displayName = 'HxTableContext';

export const HxTableProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [tableContext] = useState<HxTableContext>(() => new class implements HxTableContext {
		/** Event emitter instance to manage all tab-related events */
		private events = new EventEmitter();

		pageChange(pageNumber: number, pageSize: number, callback: (pagination: HxPaginationData) => void): void {
			this.events.emit('page-change', pageNumber, pageSize, callback);
		}

		onPageChange(listener: (pageNumber: number, pageSize: number, callback: (pagination: HxPaginationData) => void) => void): void {
			this.events.on('page-change', listener);
		}

		offPageChange(listener: (pageNumber: number, pageSize: number, callback: (pagination: HxPaginationData) => void) => void): void {
			this.events.off('page-change', listener);
		}
	});

	return <Context.Provider value={tableContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxTable = () => useContext(Context);
