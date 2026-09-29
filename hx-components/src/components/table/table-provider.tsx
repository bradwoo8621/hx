import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {HxPaginationData} from '../pagination';
import type {HxTableLayout} from './types';

export interface HxTableContext {
	layoutInitialized(layout: HxTableLayout): void;
	onLayoutInitialized(listener: (layout: HxTableLayout) => void): void;
	offLayoutInitialized(listener: (layout: HxTableLayout) => void): void;

	pageChanged(pagination: HxPaginationData): void;
	onPageChanged(listener: (pagination: HxPaginationData) => void): void;
	offPageChanged(listener: (pagination: HxPaginationData) => void): void;
}

const Context = createContext<HxTableContext>({} as HxTableContext);
Context.displayName = 'HxTableContext';

export const HxTableProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [tableContext] = useState<HxTableContext>(() => new class implements HxTableContext {
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

		pageChanged(pagination: HxPaginationData): void {
			this.events.emit('pagination-change', pagination);
		}

		onPageChanged(listener: (pagination: HxPaginationData) => void): void {
			this.events.on('pagination-change', listener);
		}

		offPageChanged(listener: (pagination: HxPaginationData) => void): void {
			this.events.off('pagination-change', listener);
		}
	});

	return <Context.Provider value={tableContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxTable = () => useContext(Context);
