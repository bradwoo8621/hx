// @ts-expect-error import React
import React from 'react';
import {HxTableDefaults} from './defaults';
import {HxTableToolbarCriteria, type HxTableToolbarCriteriaProps} from './table-toolbar-criteria';
import {HxTableToolbarCriteriaApplied, type HxTableToolbarCriteriaAppliedProps} from './table-toolbar-criteria-applied';
import type {HxTableProps} from './types';

export type HxTableToolbarProps<T extends object, PT extends object = T> =
	& Pick<
		HxTableProps<T, PT>,
		| 'sortColumns' | 'filterColumns' | 'fuzzyFilter'
		| 'sortPopupZIndex' | 'sortPopupGapToEdge' | 'filterPopupZIndex' | 'filterPopupGapToEdge'
	>
	& Required<
	Pick<
		HxTableProps<T, PT>,
		| 'fuzzyPlaceholderKey'
		| 'noSortColumnKey' | 'addSortPlaceholderKey' | 'noMoreSortColumnKey'
		| 'sortPopupConfirmKey' | 'sortPopupCancelKey'
		| 'filterMatchKey' | 'filterNotMatchKey' | 'filterBetweenKey' | 'filterNotBetweenKey'
		| 'filterPopupConfirmKey' | 'filterPopupCancelKey'
		| 'clearCriteriaKey'
	>>;

/**
 * Table toolbar: the only entry for sort and filter, rendered as two rows.
 * The criteria row holds the global fuzzy input and the sort/filter entry
 * buttons; the applied-criteria row below shows the committed criteria.
 */
export const HxTableToolbar =
	<T extends object, PT extends object = T>(props: HxTableToolbarProps<T, PT>) => {
		const {
			sortColumns, filterColumns, fuzzyFilter = HxTableDefaults.fuzzyFilter,
			sortPopupZIndex = HxTableDefaults.sortPopupZIndex,
			sortPopupGapToEdge = HxTableDefaults.sortPopupGapToEdge,
			filterPopupZIndex = HxTableDefaults.filterPopupZIndex,
			filterPopupGapToEdge = HxTableDefaults.filterPopupGapToEdge,
			fuzzyPlaceholderKey,
			noSortColumnKey, addSortPlaceholderKey, noMoreSortColumnKey, sortPopupConfirmKey, sortPopupCancelKey,
			filterMatchKey, filterNotMatchKey, filterBetweenKey, filterNotBetweenKey,
			filterPopupConfirmKey, filterPopupCancelKey,
			clearCriteriaKey
		} = props;

		// const context = useHxContext();
		// const tableContext = useHxTable();

		const hasSort = sortColumns != null && sortColumns.length !== 0;
		const hasFuzzySearch = fuzzyFilter;
		const hasFilter = filterColumns != null && filterColumns.length !== 0;

		if (!hasSort && !hasFuzzySearch && !hasFilter) {
			return (void 0);
		}

		const criteriaProps: HxTableToolbarCriteriaProps<T, PT> = {
			sortColumns, filterColumns, fuzzyFilter,
			sortPopupZIndex, sortPopupGapToEdge, filterPopupZIndex, filterPopupGapToEdge,
			fuzzyPlaceholderKey,
			noSortColumnKey, addSortPlaceholderKey, noMoreSortColumnKey, sortPopupConfirmKey, sortPopupCancelKey,
			filterMatchKey, filterNotMatchKey, filterBetweenKey, filterNotBetweenKey,
			filterPopupConfirmKey, filterPopupCancelKey
		};
		const appliedProps: HxTableToolbarCriteriaAppliedProps<T, PT> = {
			sortColumns, filterColumns,
			filterMatchKey, filterNotMatchKey, filterBetweenKey, filterNotBetweenKey,
			clearCriteriaKey
		};

		return <div data-hx-table-toolbar="">
			<HxTableToolbarCriteria {...criteriaProps}/>
			<HxTableToolbarCriteriaApplied {...appliedProps}/>
		</div>;
	};
