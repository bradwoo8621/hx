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

	>
	& Required<
	Pick<
		HxTableProps<T, PT>,
		| 'fuzzyPlaceholderKey'
		| 'filterMatchKey' | 'filterNotMatchKey' | 'filterBetweenKey' | 'filterNotBetweenKey'
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
			fuzzyPlaceholderKey,
			filterMatchKey, filterNotMatchKey, filterBetweenKey, filterNotBetweenKey,
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
			fuzzyPlaceholderKey,
			filterMatchKey, filterNotMatchKey, filterBetweenKey, filterNotBetweenKey,
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
