// @ts-expect-error import React
import React from 'react';
import {HxTableToolbarFilterButton, type HxTableToolbarFilterButtonProps} from './table-toolbar-filter-button';
import {HxTableToolbarFuzzyInput, type HxTableToolbarFuzzyInputProps} from './table-toolbar-fuzzy-input';
import {HxTableToolbarSortButton, type HxTableToolbarSortButtonProps} from './table-toolbar-sort-button';
import type {HxTableProps} from './types';

export type HxTableToolbarCriteriaProps<T extends object, PT extends object = T> =
	& Pick<HxTableProps<T, PT>,
		| 'sortColumns' | 'filterColumns'
		| 'sortPopupZIndex' | 'sortPopupGapToEdge' | 'filterPopupZIndex' | 'filterPopupGapToEdge'
	>
	& Required<Pick<HxTableProps<T, PT>, 'fuzzyFilter'>>
	& Required<
	Pick<
		HxTableProps<T, PT>,
		| 'fuzzyPlaceholderKey'
		| 'noSortColumnKey' | 'addToSortKey' | 'noMoreSortColumnKey'
		| 'sortPopupConfirmKey' | 'sortPopupCancelKey' | 'sortPopupClearKey'
		| 'filterMatchKey' | 'filterNotMatchKey' | 'filterBetweenKey' | 'filterNotBetweenKey'
		| 'noFilterColumnKey' | 'filterMatchPlaceholderKey' | 'addToFilterKey' | 'noMoreFilterColumnKey'
		| 'filterPopupConfirmKey' | 'filterPopupCancelKey' | 'filterPopupClearKey'
	>>;

export const HxTableToolbarCriteria =
	<T extends object, PT extends object = T>(props: HxTableToolbarCriteriaProps<T, PT>) => {
		const {
			sortColumns, filterColumns, fuzzyFilter,
			sortPopupZIndex, sortPopupGapToEdge, filterPopupZIndex, filterPopupGapToEdge,
			fuzzyPlaceholderKey,
			noSortColumnKey, addToSortKey, noMoreSortColumnKey,
			sortPopupConfirmKey, sortPopupCancelKey, sortPopupClearKey,
			filterMatchKey, filterNotMatchKey, filterBetweenKey, filterNotBetweenKey,
			noFilterColumnKey, filterMatchPlaceholderKey, addToFilterKey, noMoreFilterColumnKey,
			filterPopupConfirmKey, filterPopupCancelKey, filterPopupClearKey
		} = props;

		const fuzzyInputProps: HxTableToolbarFuzzyInputProps<T, PT> = {
			fuzzyFilter, fuzzyPlaceholderKey
		};
		const hasSort = sortColumns != null && sortColumns.length !== 0;
		const sortProps: HxTableToolbarSortButtonProps<T, PT> | undefined = hasSort
			? {
				sortColumns,
				sortPopupZIndex, sortPopupGapToEdge,
				noSortColumnKey, addToSortKey, noMoreSortColumnKey,
				sortPopupConfirmKey, sortPopupCancelKey, sortPopupClearKey
			}
			: (void 0);
		const hasFilter = filterColumns != null && filterColumns.length !== 0;
		const filterProps: HxTableToolbarFilterButtonProps<T, PT> | undefined = hasFilter
			? {
				filterColumns,
				filterPopupZIndex, filterPopupGapToEdge,
				filterMatchKey, filterNotMatchKey, filterBetweenKey, filterNotBetweenKey,
				noFilterColumnKey, filterMatchPlaceholderKey, addToFilterKey, noMoreFilterColumnKey,
				filterPopupConfirmKey, filterPopupCancelKey, filterPopupClearKey
			}
			: (void 0);

		return <div data-hx-table-toolbar-criteria="">
			{['change', 'enter', 'enter+blur'].includes(fuzzyFilter)
				? <HxTableToolbarFuzzyInput {...fuzzyInputProps}/>
				: (void 0)}
			<div data-hx-table-toolbar-criteria-spacer=""/>
			{hasSort
				// @ts-expect-error ignore check
				? <HxTableToolbarSortButton {...sortProps}/>
				: (void 0)}
			{hasFilter
				// @ts-expect-error ignore check
				? <HxTableToolbarFilterButton {...filterProps}/>
				: (void 0)}
		</div>;
	};
