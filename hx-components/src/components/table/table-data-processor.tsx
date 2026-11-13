import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {Fragment, useEffect} from 'react';
import {type HxContext, useHxContext} from '../../contexts';
import {useFuncResultRef} from '../../hooks';
import type {WithRequired} from '../../types';
import {HxConsole} from '../../utils';
import {readPaginationData} from '../pagination';
import {HxPaginationDefaults} from '../pagination/defaults';
import {HxTableDefaults} from './defaults';
import {type HxTableAskCriteriaAndDefsCallback, type HxTableDataCriteriaAndDefs, useHxTable} from './table-provider';
import type {
	HxTableCriteriaApplied,
	HxTableDataCriteria,
	HxTableFilterCriteria,
	HxTableFuzzyCriteria,
	HxTablePaginationCriteria,
	HxTableProps,
	HxTableSortCriteria
} from './types';
import {createColumnFilterCriteria} from './utils';

export type HxTableDataProcessorProps<T extends object, PT extends object = T> =
	Pick<
		HxTableProps<T, PT>,
		| '$model' | '$field'
		| 'pagination' | 'sortColumns' | 'filterColumns' | 'fuzzyFilter' | 'onCriteriaChanged'
	>

const createDefaultCriteria =
	<T extends object, PT extends object = T>(options: Omit<HxTableDataProcessorProps<T, PT>, 'onCriteriaChanged'>, context: HxContext) => {
		const {$model, pagination, sortColumns, filterColumns} = options;

		const criteria: HxTableCriteriaApplied = {};
		if (pagination != null) {
			criteria.pagination = readPaginationData({
				...pagination,
				$model: pagination.$model ?? $model,
				allowedPageSizes: pagination.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes
			}, context);
		}
		if (sortColumns != null && sortColumns.length !== 0) {
			const defaultSort = sortColumns.reduce((acc, column) => {
				if (column.defaultMethod === 'asc' || column.defaultMethod === 'desc') {
					// not asc/desc, ignore
					acc.push({key: column.key, method: column.defaultMethod});
				}
				return acc;
			}, [] as HxTableSortCriteria);
			if (defaultSort.length !== 0) {
				criteria.sort = defaultSort;
			}
		}
		if (filterColumns != null && filterColumns.length !== 0) {
			const defaultFilter = filterColumns.reduce((acc, column) => {
				if (column.defaultValue == null
					|| (Array.isArray(column.defaultValue) && column.defaultValue.length === 0)) {
					// ignore
				} else {
					acc.push(createColumnFilterCriteria(column, false));
				}
				return acc;
			}, [] as HxTableFilterCriteria);
			if (defaultFilter.length !== 0) {
				criteria.filter = defaultFilter;
			}
		}

		return criteria;
	};

export const HxTableDataProcessor =
	<T extends object, PT extends object = T>(props: HxTableDataProcessorProps<T, PT>) => {
		const {$model, $field, pagination, sortColumns, filterColumns, fuzzyFilter, onCriteriaChanged} = props;

		const context = useHxContext();
		const tableContext = useHxTable();
		// The criteria pipeline is seeded exactly once, on the first render.
		//
		// `useFuncResultRef` runs its factory a single time (a lazy useState
		// initializer that never re-runs), so the snapshot starts with:
		// - the declaration props (`pagination` / `sortColumns` / `filterColumns` /
		//   `fuzzyFilter`) as passed on the first render;
		// - `criteria`, the default criteria computed from those declarations
		//   (pagination values read from the pagination model, sort directions from
		//   each column's `defaultMethod`, filter values from each column's
		//   `defaultValue`).
		//
		// When the declaration props change on a later render, HxTableCriteriaGuard
		// asks for this snapshot through askCriteriaAndDefs and reconciles it IN
		// PLACE (see the contract on HxTableDataCriteriaAndDefs): applied entries
		// whose definitions remain are kept, entries whose definitions are gone or
		// whose effective filter type changed are pruned, fuzzy/pagination are
		// dropped when their declarations disappear, pagination is seeded when it
		// appears, and the declaration pins are refreshed. When the applied criteria
		// actually changed, the reconciliation fires onCriteriaChanged with type
		// 'props-change' and notifies the toolbar and the body; the footer follows
		// the declaration props themselves. Keeping the declarations static is still
		// recommended — every change costs a data fetch.
		//
		// `criteria` is the single source of truth for the applied state: the
		// interaction handlers below merge their changed part into it, `onChange`
		// writes each accepted snapshot back into it, and `askCriteria` serves it.
		const criteriaRef = useFuncResultRef<HxTableDataCriteriaAndDefs<T, PT>>(() => {
			return {
				pagination, sortColumns, filterColumns, fuzzyFilter,
				criteria: createDefaultCriteria(props, context)
			};
		});
		useEffect(() => {
			const onAskCriteriaAndDefs = (callback: HxTableAskCriteriaAndDefsCallback) => {
				const callbackToMe = async (shouldUpdate: boolean, criteriaAndDefs: HxTableDataCriteriaAndDefs<T, PT>) => {
					criteriaRef.current = criteriaAndDefs;

					if (!shouldUpdate) {
						return;
					}

					try {
						if (onCriteriaChanged != null) {
							await onCriteriaChanged($model, {
								...criteriaRef.current.criteria, type: 'props-change'
							}, context);
						}
						tableContext.repaintCriteria();
						tableContext.dataChanged();
					} catch (e) {
						HxConsole.error('HxTable criteria changed by properties, and error raised on fetch data.', e);
					}
				};

				callback(criteriaRef.current, callbackToMe);
			};
			tableContext.onAskCriteriaAndDefs(onAskCriteriaAndDefs);

			return () => {
				tableContext.offAskCriteriaAndDefs(onAskCriteriaAndDefs);
			};
		}, [$model, onCriteriaChanged, criteriaRef, tableContext, context]);
		useEffect(() => {
			const onChange = async (criteria: HxTableDataCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void): Promise<boolean> => {
				try {
					if (onCriteriaChanged != null) {
						await onCriteriaChanged($model, criteria, context);
					}
					// update criteria, omit type
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const {type, ...rest} = criteria;
					criteriaRef.current.criteria = rest;
					callback(true);
					return true;
				} catch (e) {
					callback(false, e);
					return false;
				}
			};
			const onPageSizeChange = async (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				const keepPageNumberWhenSizeChange = pagination?.keepPageNumberWhenSizeChange ?? HxTableDefaults.keepPageNumberWhenSizeChange;
				if (!keepPageNumberWhenSizeChange) {
					// no need to keep the page number, reset to the first page.
					// note this must be written directly to the given data object in memory,
					// because HxPagination writes this data back to the UI
					data.pageNumber = 1;
				}
				await onChange({
					...criteriaRef.current.criteria, pagination: data, type: 'page-size-change'
				}, (dataSynchronized, error) => {
					if (dataSynchronized) {
						const items = ERO.getValue($model, $field) ?? [];
						if (Array.isArray(items)) {
							const count = items.length;
							if (count === 0) {
								// just a guard for no data
								data.totalItems = 0;
								data.pageNumber = 1;
								data.totalPages = 1;
							} else if (count === data.totalItems) {
								// total items count is same
								// - server-side:
								data.totalPages = Math.ceil(count / data.pageSize);
								const keepPageNumberWhenSizeChange = pagination?.keepPageNumberWhenSizeChange ?? HxTableDefaults.keepPageNumberWhenSizeChange;
								if (data.pageNumber > data.totalPages) {
									if (keepPageNumberWhenSizeChange) {
										data.pageNumber = data.totalPages;
									} else {
										data.pageNumber = 1;
									}
								} else if (!keepPageNumberWhenSizeChange) {
									data.pageNumber = 1;
								}
							} else {
								// must be server-side, leave it be as-is
							}
						}
					}
					callback(dataSynchronized, error);
				});
			};
			const onPageNumberChange = async (data: HxTablePaginationCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				await onChange({
					...criteriaRef.current.criteria, pagination: data, type: 'page-number-change'
				}, callback);
			};
			const onSortChange = async (data: HxTableSortCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				await onChange({...criteriaRef.current.criteria, sort: data, type: 'sort-change'}, callback);
			};
			const onFilterChange = async (data: HxTableFilterCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				await onChange({...criteriaRef.current.criteria, filter: data, type: 'filter-change'}, callback);
			};
			const onClearSortAndFilter = async (type: 'sort' | 'filter' | 'both', callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				await onChange({
					pagination: criteriaRef.current.criteria.pagination, fuzzy: criteriaRef.current.criteria.fuzzy,
					type: type === 'sort' ? 'sort-change' : (type === 'filter' ? 'filter-change' : 'clear-sort-and-filter')
				}, callback);
			};
			const onFuzzyChange = async (data: HxTableFuzzyCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				await onChange({...criteriaRef.current.criteria, fuzzy: data, type: 'fuzzy-change'}, callback);
			};
			const onAskCriteria = (callback: (criteria: HxTableCriteriaApplied) => void) => {
				callback(criteriaRef.current.criteria);
			};

			tableContext.onPageSizeChange(onPageSizeChange);
			tableContext.onPageNumberChange(onPageNumberChange);
			tableContext.onSortChange(onSortChange);
			tableContext.onFilterChange(onFilterChange);
			tableContext.onClearSortAndFilter(onClearSortAndFilter);
			tableContext.onFuzzyChange(onFuzzyChange);
			tableContext.onAskCriteria(onAskCriteria);

			return () => {
				tableContext.offPageSizeChange(onPageSizeChange);
				tableContext.offPageNumberChange(onPageNumberChange);
				tableContext.offSortChange(onSortChange);
				tableContext.offFilterChange(onFilterChange);
				tableContext.offClearSortAndFilter(onClearSortAndFilter);
				tableContext.offFuzzyChange(onFuzzyChange);
				tableContext.offAskCriteria(onAskCriteria);
			};
		}, [$model, $field, pagination?.keepPageNumberWhenSizeChange, onCriteriaChanged, criteriaRef, tableContext, context]);

		return <Fragment/>;
	};
