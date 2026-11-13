// @ts-expect-error import React
import React, {Fragment, useEffect} from 'react';
import {useHxContext} from '../../contexts';
import {readPaginationData} from '../pagination';
import {HxPaginationDefaults} from '../pagination/defaults';
import {type HxTableAskCriteriaAndDefsCallback, useHxTable} from './table-provider';
import type {HxTableFilterColumn, HxTableFilterColumnType, HxTableProps, HxTableSortColumn} from './types';

export type HxTableCriteriaGuardProps<T extends object, PT extends object = T> =
	Pick<
		HxTableProps<T, PT>,
		| '$model' | '$field'
		| 'pagination' | 'sortColumns' | 'filterColumns' | 'fuzzyFilter'
	>

export const HxTableCriteriaGuard =
	<T extends object, PT extends object = T>(props: HxTableCriteriaGuardProps<T, PT>) => {
		const {$model, pagination, sortColumns, filterColumns, fuzzyFilter} = props;

		const context = useHxContext();
		const tableContext = useHxTable();
		useEffect(() => {
			const check: HxTableAskCriteriaAndDefsCallback = (criteriaAndDefs, callback) => {
				let shouldUpdate = false;

				// fuzzy check
				if (criteriaAndDefs.criteria.fuzzy != null && criteriaAndDefs.criteria.fuzzy.length !== 0) {
					// applied has fuzzy words
					if (fuzzyFilter == null || fuzzyFilter === 'none') {
						// remove applied fuzzy words when no fuzzy anymore
						delete criteriaAndDefs.criteria.fuzzy;
						shouldUpdate = true;
					}
				}
				criteriaAndDefs.fuzzyFilter = fuzzyFilter;

				// pagination check
				if (criteriaAndDefs.criteria.pagination != null) {
					// applied has pagination
					if (pagination == null) {
						// remove applied pagination data when no pagination anymore
						delete criteriaAndDefs.criteria.pagination;
						shouldUpdate = true;
					}
				} else if (pagination != null) {
					// applied has no pagination, but now has
					// read pagination data to applied
					criteriaAndDefs.criteria.pagination = readPaginationData({
						...pagination,
						$model: pagination.$model ?? $model,
						allowedPageSizes: pagination.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes
					}, context);
					shouldUpdate = true;
				}
				// @ts-expect-error ignore check
				criteriaAndDefs.pagination = pagination;

				// sort column check
				if (criteriaAndDefs.criteria.sort == null || criteriaAndDefs.criteria.sort.length === 0) {
					// no applied sort column
					if (sortColumns == null || sortColumns.length === 0) {
						// no sort column now, remove sorted column from applied criteria anyway
						delete criteriaAndDefs.criteria.sort;
					}
				} else if (sortColumns == null || sortColumns.length === 0) {
					// has applied sort column, but no sort column defs anymore
					// remove the applied sort columns
					delete criteriaAndDefs.criteria.sort;
					shouldUpdate = true;
				} else {
					// has applied sort column and still has sort column defs, compare
					const sortColumnDefs = (sortColumns ?? []).reduce((map, column) => {
						map[column.key] = column;
						return map;
					}, {} as Record<string, HxTableSortColumn>);
					const appliedCount = criteriaAndDefs.criteria.sort.length;
					criteriaAndDefs.criteria.sort = criteriaAndDefs.criteria.sort.filter(column => {
						// keep the applied sort column when definition remains
						return sortColumnDefs[column.key] != null;
					});
					if (appliedCount !== criteriaAndDefs.criteria.sort.length) {
						// some applied sort columns removed
						shouldUpdate = true;
					}
					if (criteriaAndDefs.criteria.sort.length == 0) {
						delete criteriaAndDefs.criteria.sort;
					}
				}
				criteriaAndDefs.sortColumns = sortColumns;

				// check filter column
				if (criteriaAndDefs.criteria.filter == null || criteriaAndDefs.criteria.filter.length === 0) {
					// no applied filter column
					if (filterColumns == null || filterColumns.length === 0) {
						// no filter column now, remove filtered column from applied criteria anyway
						delete criteriaAndDefs.criteria.filter;
					}
				} else if (filterColumns == null || filterColumns.length === 0) {
					// has applied sort column, but no sort column defs anymore
					// remove the applied sort columns
					delete criteriaAndDefs.criteria.filter;
					shouldUpdate = true;
				} else {
					// has applied sort column and still has sort column defs, compare
					const getFilterType = (column?: HxTableFilterColumn): HxTableFilterColumnType => {
						if (column == null) {
							return 'words';
						}

						switch (column.type) {
							case 'select':
							case 'm-select': {
								if (column.options != null) {
									return column.type;
								} else {
									return 'words';
								}
							}
							case 'range' : {
								return 'range';
							}
							case 'words':
							default: {
								return 'words';
							}
						}
					};
					const appliedFilterColumnDefs = (criteriaAndDefs.filterColumns ?? []).reduce((map, column) => {
						map[column.key] = column;
						return map;
					}, {} as Record<string, HxTableFilterColumn>);
					const filterColumnDefs = (filterColumns ?? []).reduce((map, column) => {
						map[column.key] = column;
						return map;
					}, {} as Record<string, HxTableFilterColumn>);
					const appliedCount = criteriaAndDefs.criteria.filter.length;
					criteriaAndDefs.criteria.filter = criteriaAndDefs.criteria.filter.filter(column => {
						const def = filterColumnDefs[column.key];
						if (def == null) {
							// remove applied filter column when def not exists anymore
							return false;
						} else {
							// remove applied filter column when def type is changed
							return getFilterType(def) === getFilterType(appliedFilterColumnDefs[column.key]);
						}
					});
					if (appliedCount !== criteriaAndDefs.criteria.filter.length) {
						// some applied sort columns removed
						shouldUpdate = true;
					}
					if (criteriaAndDefs.criteria.filter.length == 0) {
						delete criteriaAndDefs.criteria.filter;
					}
				}

				callback(shouldUpdate, criteriaAndDefs);
			};

			tableContext.askCriteriaAndDefs(check);
			// only on shallow compare
		}, [$model, pagination, sortColumns, filterColumns, fuzzyFilter, tableContext, context]);

		return <Fragment/>;
	};
