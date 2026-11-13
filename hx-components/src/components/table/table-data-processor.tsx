import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {Fragment, useEffect} from 'react';
import {type HxContext, useHxContext} from '../../contexts';
import {useFuncResultRef} from '../../hooks';
import type {WithRequired} from '../../types';
import {readPaginationData} from '../pagination';
import {HxPaginationDefaults} from '../pagination/defaults';
import {HxTableDefaults} from './defaults';
import {useHxTable} from './table-provider';
import type {
	HxTableDataCriteria,
	HxTableFilterColumns,
	HxTableFilterCriteria,
	HxTableFuzzyCriteria,
	HxTablePaginationCriteria,
	HxTablePaginationProps,
	HxTableProps,
	HxTableSortColumns,
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

		const criteria: Omit<HxTableDataCriteria, 'type'> = {};
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

/**
 * Snapshot of the criteria pipeline state. Created once on the first render
 * and never rebuilt — see the comment at `criteriaRef` below.
 */
interface HxTableDataCriteriaRef<T extends object, PT extends object = T> {
	// Declaration props exactly as passed on the first render. They pin which
	// declaration objects seeded the pipeline; no later prop change reaches here.
	pagination?: HxTablePaginationProps<PT>;
	sortColumns?: HxTableSortColumns;
	filterColumns?: HxTableFilterColumns;

	// The applied criteria. Starts as the default criteria computed from the
	// declarations; every accepted interaction snapshot is written back into it.
	criteria: Omit<HxTableDataCriteria, 'type'>;
}

export const HxTableDataProcessor =
	<T extends object, PT extends object = T>(props: HxTableDataProcessorProps<T, PT>) => {
		const {$model, $field, pagination, sortColumns, filterColumns, onCriteriaChanged} = props;

		const context = useHxContext();
		const tableContext = useHxTable();
		// The criteria pipeline is seeded exactly once, on the first render.
		//
		// `useFuncResultRef` runs its factory a single time (a lazy useState
		// initializer that never re-runs), so this snapshot is frozen:
		// - `pagination` / `sortColumns` / `filterColumns` record the declaration
		//   objects as passed on the first render;
		// - `criteria` holds the default criteria computed from those declarations
		//   (pagination values read from the pagination model, sort directions from
		//   each column's `defaultMethod`, filter values from each column's
		//   `defaultValue`).
		//
		// No later render re-runs the factory or rebuilds the criteria from the
		// props: changing these declaration props after the first render is a
		// documented-forbidden usage. The pipeline keeps answering from the pinned
		// snapshot; keep the declarations static for the table's lifetime
		// (module-level constants, or values created outside the render function).
		//
		// `criteria` is the single source of truth for the applied state: the
		// interaction handlers below merge their changed part into it, `onChange`
		// writes each accepted snapshot back into it, and `askCriteria` serves it.
		// TODO table criteria ref should be updated when props changed (keep compare), and notify toolbar criteria, body and footer pagination.
		const criteriaRef = useFuncResultRef<HxTableDataCriteriaRef<T, PT>>(() => {
			return {pagination, sortColumns, filterColumns, criteria: createDefaultCriteria(props, context)};
		});
		useEffect(() => {
			const onChange = async (criteria: HxTableDataCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void): Promise<boolean> => {
				try {
					if (onCriteriaChanged != null) {
						await onCriteriaChanged($model, criteria, context);
					}
					// update criteria
					criteriaRef.current.criteria = criteria;
					callback(true);
					return true;
				} catch (e) {
					callback(false, e);
					return false;
				}
			};
			const onPageSizeChange = async (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				await onChange({
					...criteriaRef.current.criteria, pagination: data, type: 'page-size-change'
				}, (dataSynchronized, error) => {
					if (dataSynchronized) {
						const items = ERO.getValue($model, $field) ?? [];
						if (Array.isArray(items)) {
							const count = items.length;
							if (count === 0) {
								data.totalItems = 0;
								data.pageNumber = 1;
								data.totalPages = 1;
							} else if (count === data.totalItems) {
								// total items count is same, calculate anyway
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
			const onAskCriteria = (callback: (criteria: Omit<HxTableDataCriteria, 'type'>) => void) => {
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
