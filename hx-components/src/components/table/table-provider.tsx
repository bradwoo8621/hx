import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {WithRequired} from '../../types';
import type {HxPaginationData} from '../pagination';
import type {HxTableLayout} from './types';

export interface HxTableContext {
	layoutInitialized(layout: HxTableLayout): void;
	onLayoutInitialized(listener: (layout: HxTableLayout) => void): void;
	offLayoutInitialized(listener: (layout: HxTableLayout) => void): void;

	pageNumberChange(pagination: HxPaginationData): void;
	onPageNumberChange(listener: (pagination: HxPaginationData) => void): void;
	offPageNumberChange(listener: (pagination: HxPaginationData) => void): void;

	pageSizeChange(pagination: WithRequired<HxPaginationData, 'pageSize'>): void;
	onPageSizeChange(listener: (pagination: WithRequired<HxPaginationData, 'pageSize'>) => void): void;
	offPageSizeChange(listener: (pagination: WithRequired<HxPaginationData, 'pageSize'>) => void): void;
}

const Context = createContext<HxTableContext>({} as HxTableContext);
Context.displayName = 'HxTableContext';

export const HxTableProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [tableContext] = useState<HxTableContext>(() => new class implements HxTableContext {
		/** Event emitter instance to manage all tab-related events */
		private events = new EventEmitter();

		layoutInitialized(layout: HxTableLayout): void {
			this.events.emit('layout-initialized', layout);
		}

		onLayoutInitialized(listener: (layout: HxTableLayout) => void): void {
			this.events.on('layout-initialized', listener);
		}

		offLayoutInitialized(listener: (layout: HxTableLayout) => void): void {
			this.events.off('layout-initialized', listener);
		}

		pageNumberChange(pagination: HxPaginationData): void {
			this.events.emit('page-change', pagination);
		}

		onPageNumberChange(listener: (pagination: HxPaginationData) => void): void {
			this.events.on('page-change', listener);
		}

		offPageNumberChange(listener: (pagination: HxPaginationData) => void): void {
			this.events.off('page-change', listener);
		}

		pageSizeChange(pagination: WithRequired<HxPaginationData, 'pageSize'>): void {
			this.events.emit('page-size', pagination);
		}

		onPageSizeChange(listener: (pagination: WithRequired<HxPaginationData, 'pageSize'>) => void): void {
			this.events.on('page-size', listener);
		}

		offPageSizeChange(listener: (pagination: WithRequired<HxPaginationData, 'pageSize'>) => void): void {
			this.events.off('page-size', listener);
		}
	});

	return <Context.Provider value={tableContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxTable = () => useContext(Context);
