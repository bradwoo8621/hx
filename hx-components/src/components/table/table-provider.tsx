// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
import type {WithRequired} from '../../types';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';
import type {
	HxTableCriteriaApplied,
	HxTableFilterColumns,
	HxTableFilterCriteria,
	HxTableFuzzyCriteria,
	HxTableFuzzyFilterMode,
	HxTableLayout,
	HxTablePaginationCriteria,
	HxTablePaginationProps,
	HxTableSortColumns,
	HxTableSortCriteria
} from './types';

/**
 * Snapshot of the criteria pipeline state: the declaration props governing it
 * plus the applied criteria. Seeded once by the data processor on the first
 * render; reconciled afterwards by the criteria guard whenever the declaration
 * props change.
 *
 * The reconciliation MUTATES the object in place. `shouldUpdate` is a single
 * boolean and cannot express which sections changed, so the changes themselves
 * travel through the mutated object instead of a replacement: pruned applied
 * entries, re-read pagination data and the re-pinned declaration props are all
 * applied in place, and the processor keeps the same instance as its criteria
 * source of truth.
 */
export interface HxTableDataCriteriaAndDefs<T extends object, PT extends object = T> {
	fuzzyFilter?: HxTableFuzzyFilterMode;
	// Declaration props currently in effect; re-pinned by the guard on every
	// check, so the next compare runs against the latest declarations.
	pagination?: HxTablePaginationProps<PT>;
	sortColumns?: HxTableSortColumns;
	filterColumns?: HxTableFilterColumns;

	// The applied criteria. Starts as the default criteria computed from the
	// declarations; every accepted interaction snapshot is written back into it.
	criteria: HxTableCriteriaApplied;
}

/**
 * Signature of the criteria-and-defs check the criteria guard sends to the
 * data processor. The receiver MUTATES `criteriaAndDefs` in place (see
 * {@link HxTableDataCriteriaAndDefs}), then answers through `callback`:
 * `shouldUpdate` tells whether the applied criteria actually changed and the
 * data pipeline must re-run, and the mutated snapshot travels back as the
 * payload.
 *
 * `T` / `PT` are the callback's own generics and are erased across the event
 * boundary, so assignments between different instantiations do not typecheck
 * (hence the `@ts-expect-error` at the call sites).
 */
export type HxTableAskCriteriaAndDefsCallback = <T extends object, PT extends object = T>(criteriaAndDefs: HxTableDataCriteriaAndDefs<T, PT>, callback: (shouldUpdate: boolean, criteriaAndDefs: HxTableDataCriteriaAndDefs<T, PT>) => void) => void;

export interface HxTableContext extends HxReactContext {
	/**
	 * Notify listeners that the table layout has been initialized
	 * @param layout - Initialized table layout
	 */
	layoutInitialized(layout: HxTableLayout): void;

	/**
	 * Register a listener for layout initialization
	 * @param listener - Callback function called with the initialized layout
	 */
	onLayoutInitialized(listener: (layout: HxTableLayout) => void): void;

	/**
	 * Remove a listener for layout initialization
	 * @param listener - Previously registered listener function
	 */
	offLayoutInitialized(listener: (layout: HxTableLayout) => void): void;

	/**
	 * Notify listeners that the displayed data may have changed and should be refreshed
	 */
	dataChanged(): void;

	/**
	 * Register a listener for data refreshes
	 * @param listener - Callback function called when the data should be refreshed
	 */
	onDataChanged(listener: () => void): void;

	/**
	 * Remove a listener for data refreshes
	 * @param listener - Previously registered listener function
	 */
	offDataChanged(listener: () => void): void;

	/**
	 * Request the table content to recalculate its layout
	 */
	contentLayout(): void;

	/**
	 * Register a listener that recalculates the content layout
	 * @param listener - Callback function that handles content layout requests
	 */
	onContentLayout(listener: () => void): void;

	/**
	 * Remove a listener that recalculates the content layout
	 * @param listener - Previously registered listener function
	 */
	offContentLayout(listener: () => void): void;

	/**
	 * Enable or disable the resize monitor
	 * @param enabled - Whether the resize monitor should be active
	 */
	toggleResizeMonitor(enabled: boolean): void;

	/**
	 * Register a listener for resize monitor toggles
	 * @param listener - Callback function that receives the new monitor state
	 */
	onToggleResizeMonitor(listener: (enabled: boolean) => void): void;

	/**
	 * Remove a listener for resize monitor toggles
	 * @param listener - Previously registered listener function
	 */
	offToggleResizeMonitor(listener: (enabled: boolean) => void): void;

	/**
	 * Request a page size change
	 * @param data - Pagination criteria with the new page size
	 * @param callback - Callback that receives whether the data was synchronized, and the error when it failed
	 */
	pageSizeChange(data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataSynchronized: boolean, error?: unknown) => void): void;

	/**
	 * Register a listener that applies page size change requests
	 * @param listener - Callback function that handles the change request and answers through its callback
	 */
	onPageSizeChange(listener: (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Remove a listener that applies page size change requests
	 * @param listener - Previously registered listener function
	 */
	offPageSizeChange(listener: (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Request a page number change
	 * @param data - Pagination criteria with the new page number
	 * @param callback - Callback that receives whether the data was synchronized, and the error when it failed
	 */
	pageNumberChange(data: HxTablePaginationCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void): void;

	/**
	 * Register a listener that applies page number change requests
	 * @param listener - Callback function that handles the change request and answers through its callback
	 */
	onPageNumberChange(listener: (data: HxTablePaginationCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Remove a listener that applies page number change requests
	 * @param listener - Previously registered listener function
	 */
	offPageNumberChange(listener: (data: HxTablePaginationCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Request a sort criteria change
	 * @param data - New sort criteria
	 * @param callback - Callback that receives whether the data was synchronized, and the error when it failed
	 */
	sortChange(data: HxTableSortCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void): void;

	/**
	 * Register a listener that applies sort change requests
	 * @param listener - Callback function that handles the change request and answers through its callback
	 */
	onSortChange(listener: (data: HxTableSortCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Remove a listener that applies sort change requests
	 * @param listener - Previously registered listener function
	 */
	offSortChange(listener: (data: HxTableSortCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Request a filter criteria change
	 * @param data - New filter criteria
	 * @param callback - Callback that receives whether the data was synchronized, and the error when it failed
	 */
	filterChange(data: HxTableFilterCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void): void;

	/**
	 * Register a listener that applies filter change requests
	 * @param listener - Callback function that handles the change request and answers through its callback
	 */
	onFilterChange(listener: (data: HxTableFilterCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Remove a listener that applies filter change requests
	 * @param listener - Previously registered listener function
	 */
	offFilterChange(listener: (data: HxTableFilterCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Request a fuzzy criteria change
	 * @param data - New fuzzy criteria
	 * @param callback - Callback that receives whether the data was synchronized, and the error when it failed
	 */
	fuzzyChange(data: HxTableFuzzyCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void): void;

	/**
	 * Register a listener that applies fuzzy change requests
	 * @param listener - Callback function that handles the change request and answers through its callback
	 */
	onFuzzyChange(listener: (data: HxTableFuzzyCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Remove a listener that applies fuzzy change requests
	 * @param listener - Previously registered listener function
	 */
	offFuzzyChange(listener: (data: HxTableFuzzyCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Request clearing the sort and filter criteria
	 *
	 * The result is always both cleared. `type` only tells what this operation
	 * actually cleared — both, or just one of them when the other was already
	 * empty — and it selects the `type` discriminant of the criteria snapshot
	 * handed to `onCriteriaChanged`: "sort" -> "sort-change", "filter" ->
	 * "filter-change", "both" -> "clear-sort-and-filter". The snapshot drops
	 * both sort and filter and carries over pagination and fuzzy in every case.
	 *
	 * @param type - What this clear operation actually cleared: "sort", "filter", or "both"
	 * @param callback - Callback that receives whether the data was synchronized, and the error when it failed
	 */
	clearSortAndFilter(type: 'sort' | 'filter' | 'both', callback: (dataSynchronized: boolean, error?: unknown) => void): void;

	/**
	 * Register a listener that applies clear criteria requests
	 * @param listener - Callback function that handles the request (which criteria to clear) and answers through its callback
	 */
	onClearSortAndFilter(listener: (type: 'sort' | 'filter' | 'both', callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Remove a listener that applies clear criteria requests
	 * @param listener - Previously registered listener function
	 */
	offClearSortAndFilter(listener: (type: 'sort' | 'filter' | 'both', callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void;

	/**
	 * Notify listeners that the applied criteria should be repainted
	 */
	repaintCriteria(): void;

	/**
	 * Register a listener that is notified when the applied criteria should be repainted
	 * @param listener - Callback function invoked when the applied criteria should be repainted
	 */
	onRepaintCriteria(listener: () => void): void;

	/**
	 * Remove a listener that is notified when the applied criteria should be repainted
	 * @param listener - Previously registered listener function
	 */
	offRepaintCriteria(listener: () => void): void;

	/**
	 * Ask for the current criteria
	 * @param callback - Callback that receives the current criteria, invoked synchronously
	 */
	askCriteria(callback: (criteria: HxTableCriteriaApplied) => void): void;

	/**
	 * Register a listener that answers criteria requests
	 * @param listener - Callback function that handles ask criteria requests
	 */
	onAskCriteria(listener: (callback: (criteria: HxTableCriteriaApplied) => void) => void): void;

	/**
	 * Remove a listener that answers criteria requests
	 * @param listener - Previously registered listener function
	 */
	offAskCriteria(listener: (callback: (criteria: HxTableCriteriaApplied) => void) => void): void;

	/**
	 * Ask for the current criteria with declaration defs, letting the asker reconcile the snapshot in place
	 * @param callback - Check function that mutates the snapshot and answers through its callback with whether the applied criteria changed, invoked synchronously
	 */
	askCriteriaAndDefs(callback: HxTableAskCriteriaAndDefsCallback): void;

	/**
	 * Register a listener that answers criteria-and-defs requests
	 * @param listener - Callback function that handles ask criteria-and-defs requests
	 */
	onAskCriteriaAndDefs(listener: (callback: HxTableAskCriteriaAndDefsCallback) => void): void;

	/**
	 * Remove a listener that answers criteria-and-defs requests
	 * @param listener - Previously registered listener function
	 */
	offAskCriteriaAndDefs(listener: (callback: HxTableAskCriteriaAndDefsCallback) => void): void;
}

const Context = createHxReactContext<HxTableContext>('HxTableContext');

export const HxTableProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [tableContext] = useState<HxTableContext>(() => new class extends AbstractHxReactContext implements HxTableContext {
		/** @inheritdoc */
		layoutInitialized(layout: HxTableLayout): void {
			this.emit('layout-initialized', layout);
		}

		/** @inheritdoc */
		onLayoutInitialized(listener: (layout: HxTableLayout) => void): void {
			this.on('layout-initialized', listener);
		}

		/** @inheritdoc */
		offLayoutInitialized(listener: (layout: HxTableLayout) => void): void {
			this.off('layout-initialized', listener);
		}

		/** @inheritdoc */
		dataChanged(): void {
			this.emit('data-changed');
		}

		/** @inheritdoc */
		onDataChanged(listener: () => void): void {
			this.on('data-changed', listener);
		}

		/** @inheritdoc */
		offDataChanged(listener: () => void): void {
			this.off('data-changed', listener);
		}

		/** @inheritdoc */
		contentLayout(): void {
			this.emit('content-layout');
		}

		/** @inheritdoc */
		onContentLayout(listener: () => void): void {
			this.on('content-layout', listener);
		}

		/** @inheritdoc */
		offContentLayout(listener: () => void): void {
			this.off('content-layout', listener);
		}

		/** @inheritdoc */
		toggleResizeMonitor(enabled: boolean): void {
			this.emit('toggle-resize-monitor', enabled);
		}

		/** @inheritdoc */
		onToggleResizeMonitor(listener: (enabled: boolean) => void): void {
			this.on('toggle-resize-monitor', listener);
		}

		/** @inheritdoc */
		offToggleResizeMonitor(listener: (enabled: boolean) => void): void {
			this.off('toggle-resize-monitor', listener);
		}

		/** @inheritdoc */
		pageSizeChange(data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataSynchronized: boolean, error?: unknown) => void): void {
			this.emit('page-size-change', data, callback);
		}

		/** @inheritdoc */
		onPageSizeChange(listener: (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.on('page-size-change', listener);
		}

		/** @inheritdoc */
		offPageSizeChange(listener: (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.off('page-size-change', listener);
		}

		/** @inheritdoc */
		pageNumberChange(data: HxTablePaginationCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void): void {
			this.emit('page-number-change', data, callback);
		}

		/** @inheritdoc */
		onPageNumberChange(listener: (data: HxTablePaginationCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.on('page-number-change', listener);
		}

		/** @inheritdoc */
		offPageNumberChange(listener: (data: HxTablePaginationCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.off('page-number-change', listener);
		}

		/** @inheritdoc */
		sortChange(data: HxTableSortCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void): void {
			this.emit('sort-change', data, callback);
		}

		/** @inheritdoc */
		onSortChange(listener: (data: HxTableSortCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.on('sort-change', listener);
		}

		/** @inheritdoc */
		offSortChange(listener: (data: HxTableSortCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.off('sort-change', listener);
		}

		/** @inheritdoc */
		filterChange(data: HxTableFilterCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void): void {
			this.emit('filter-change', data, callback);
		}

		/** @inheritdoc */
		onFilterChange(listener: (data: HxTableFilterCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.on('filter-change', listener);
		}

		/** @inheritdoc */
		offFilterChange(listener: (data: HxTableFilterCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.off('filter-change', listener);
		}

		/** @inheritdoc */
		fuzzyChange(data: HxTableFuzzyCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void): void {
			this.emit('fuzzy-change', data, callback);
		}

		/** @inheritdoc */
		onFuzzyChange(listener: (data: HxTableFuzzyCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.on('fuzzy-change', listener);
		}

		/** @inheritdoc */
		offFuzzyChange(listener: (data: HxTableFuzzyCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.off('fuzzy-change', listener);
		}

		/** @inheritdoc */
		clearSortAndFilter(type: 'sort' | 'filter' | 'both', callback: (dataSynchronized: boolean, error?: unknown) => void): void {
			this.emit('clear-sort-and-filter', type, callback);
		}

		/** @inheritdoc */
		onClearSortAndFilter(listener: (type: 'sort' | 'filter' | 'both', callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.on('clear-sort-and-filter', listener);
		}

		/** @inheritdoc */
		offClearSortAndFilter(listener: (type: 'sort' | 'filter' | 'both', callback: (dataSynchronized: boolean, error?: unknown) => void) => void): void {
			this.off('clear-sort-and-filter', listener);
		}

		/** @inheritdoc */
		repaintCriteria(): void {
			this.emit('repaint-criteria');
		}

		/** @inheritdoc */
		onRepaintCriteria(listener: () => void): void {
			this.on('repaint-criteria', listener);
		}

		/** @inheritdoc */
		offRepaintCriteria(listener: () => void): void {
			this.off('repaint-criteria', listener);
		}

		/** @inheritdoc */
		askCriteria(callback: (criteria: HxTableCriteriaApplied) => void): void {
			this.emit('ask-criteria', callback);
		}

		/** @inheritdoc */
		onAskCriteria(listener: (callback: (criteria: HxTableCriteriaApplied) => void) => void): void {
			this.on('ask-criteria', listener);
		}

		/** @inheritdoc */
		offAskCriteria(listener: (callback: (criteria: HxTableCriteriaApplied) => void) => void): void {
			this.off('ask-criteria', listener);
		}

		/** @inheritdoc */
		askCriteriaAndDefs(callback: HxTableAskCriteriaAndDefsCallback): void {
			this.emit('ask-criteria-and-defs', callback);
		}

		/** @inheritdoc */
		onAskCriteriaAndDefs(listener: (callback: HxTableAskCriteriaAndDefsCallback) => void): void {
			this.on('ask-criteria-and-defs', listener);
		}

		/** @inheritdoc */
		offAskCriteriaAndDefs(listener: (callback: HxTableAskCriteriaAndDefsCallback) => void): void {
			this.off('ask-criteria-and-defs', listener);
		}
	});

	return <Context.Provider value={tableContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxTable = () => useContext(Context);
