import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {WithRequired} from '../../types';
import type {
	HxTableDataCriteria,
	HxTableFilterCriteria,
	HxTableLayout,
	HxTablePaginationCriteria,
	HxTableSortCriteria
} from './types';

export interface HxTableContext {
	layoutInitialized(layout: HxTableLayout): void;
	onLayoutInitialized(listener: (layout: HxTableLayout) => void): void;
	offLayoutInitialized(listener: (layout: HxTableLayout) => void): void;

	dataChanged(): void;
	onDataChanged(listener: () => void): void;
	offDataChanged(listener: () => void): void;

	contentLayout(): void;
	onContentLayout(listener: () => void): void;
	offContentLayout(listener: () => void): void;

	toggleResizeMonitor(enabled: boolean): void;
	onToggleResizeMonitor(listener: (enabled: boolean) => void): void;
	offToggleResizeMonitor(listener: (enabled: boolean) => void): void;

	pageSizeChange(data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataUpdated: boolean, error?: unknown) => void): void;
	onPageSizeChange(listener: (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void;
	offPageSizeChange(listener: (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void;

	pageNumberChange(data: HxTablePaginationCriteria, callback: (dataUpdated: boolean, error?: unknown) => void): void;
	onPageNumberChange(listener: (data: HxTablePaginationCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void;
	offPageNumberChange(listener: (data: HxTablePaginationCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void;

	sortChange(data: HxTableSortCriteria, callback: (dataUpdated: boolean, error?: unknown) => void): void;
	onSortChange(listener: (data: HxTableSortCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void;
	offSortChange(listener: (data: HxTableSortCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void;

	filterChange(data: HxTableFilterCriteria, callback: (dataUpdated: boolean, error?: unknown) => void): void;
	onFilterChange(listener: (data: HxTableFilterCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void;
	offFilterChange(listener: (data: HxTableFilterCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void;

	askCriteria(callback: (criteria: Omit<HxTableDataCriteria, 'type'>) => void): void;
	onAskCriteria(listener: (callback: (criteria: Omit<HxTableDataCriteria, 'type'>) => void) => void): void;
	offAskCriteria(listener: (callback: (criteria: Omit<HxTableDataCriteria, 'type'>) => void) => void): void;
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

		dataChanged(): void {
			this.events.emit('pagination-change');
		}

		onDataChanged(listener: () => void): void {
			this.events.on('pagination-change', listener);
		}

		offDataChanged(listener: () => void): void {
			this.events.off('pagination-change', listener);
		}

		contentLayout(): void {
			this.events.emit('content-layout');
		}

		onContentLayout(listener: () => void): void {
			this.events.on('content-layout', listener);
		}

		offContentLayout(listener: () => void): void {
			this.events.off('content-layout', listener);
		}

		toggleResizeMonitor(enabled: boolean): void {
			this.events.emit('toggle-resize-monitor', enabled);
		}

		onToggleResizeMonitor(listener: (enabled: boolean) => void): void {
			this.events.on('toggle-resize-monitor', listener);
		}

		offToggleResizeMonitor(listener: (enabled: boolean) => void): void {
			this.events.off('toggle-resize-monitor', listener);
		}

		pageSizeChange(data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataUpdated: boolean, error?: unknown) => void): void {
			this.events.emit('page-size-change', data, callback);
		}

		onPageSizeChange(listener: (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void {
			this.events.on('page-size-change', listener);
		}

		offPageSizeChange(listener: (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void {
			this.events.off('page-size-change', listener);
		}

		pageNumberChange(data: HxTablePaginationCriteria, callback: (dataUpdated: boolean, error?: unknown) => void): void {
			this.events.emit('page-number-change', data, callback);
		}

		onPageNumberChange(listener: (data: HxTablePaginationCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void {
			this.events.on('page-number-change', listener);
		}

		offPageNumberChange(listener: (data: HxTablePaginationCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void {
			this.events.off('page-number-change', listener);
		}

		sortChange(data: HxTableSortCriteria, callback: (dataUpdated: boolean, error?: unknown) => void): void {
			this.events.emit('sort-change', data, callback);
		}

		onSortChange(listener: (data: HxTableSortCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void {
			this.events.on('sort-change', listener);
		}

		offSortChange(listener: (data: HxTableSortCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void {
			this.events.off('sort-change', listener);
		}

		filterChange(data: HxTableFilterCriteria, callback: (dataUpdated: boolean, error?: unknown) => void): void {
			this.events.emit('filter-change', data, callback);
		}

		onFilterChange(listener: (data: HxTableFilterCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void {
			this.events.on('filter-change', listener);
		}

		offFilterChange(listener: (data: HxTableFilterCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => void): void {
			this.events.off('filter-change', listener);
		}

		askCriteria(callback: (criteria: Omit<HxTableDataCriteria, 'type'>) => void): void {
			this.events.emit('ask-criteria', callback);
		}

		onAskCriteria(listener: (callback: (criteria: Omit<HxTableDataCriteria, 'type'>) => void) => void): void {
			this.events.on('ask-criteria', listener);
		}

		offAskCriteria(listener: (callback: (criteria: Omit<HxTableDataCriteria, 'type'>) => void) => void): void {
			this.events.off('ask-criteria', listener);
		}
	});

	return <Context.Provider value={tableContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxTable = () => useContext(Context);
