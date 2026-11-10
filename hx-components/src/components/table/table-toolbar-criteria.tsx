import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {useFuncResultRef} from '../../hooks';
import {MagnifyingGlass} from '../icons';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {HxTableToolbarFilterButton, type HxTableToolbarFilterButtonProps} from './table-toolbar-filter-button';
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
		| 'filterPopupConfirmKey' | 'filterPopupCancelKey'
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
			filterPopupConfirmKey, filterPopupCancelKey
		} = props;

		// const tableContext = useHxTable();

		const $fuzzyFilterModel = useFuncResultRef(() => ERO.reactive({value: ''}));

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
				filterPopupConfirmKey, filterPopupCancelKey
			}
			: (void 0);

		return <div data-hx-table-toolbar-criteria="">
			{fuzzyFilter
				? <HxInput $model={$fuzzyFilterModel.current} $field="value"
				           prefix={[<HxLabel data-hx-label-input-embed="" data-hx-label-svg-icon=""
				                             text={<MagnifyingGlass/>}/>]}
				           placeholder={fuzzyPlaceholderKey}
				           data-hx-table-toolbar-fuzzy=""/>
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
