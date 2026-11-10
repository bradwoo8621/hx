import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {Fragment, useEffect, useRef} from 'react';
import {type HxContext, useHxContext} from '../../contexts';
import type {WithRequired} from '../../types';
import {readPaginationData} from '../pagination';
import {HxPaginationDefaults} from '../pagination/defaults';
import {HxTableDefaults} from './defaults';
import {useHxTable} from './table-provider';
import type {
	HxTableDataCriteria,
	HxTableFilterCriteria,
	HxTableFuzzyCriteria,
	HxTablePaginationCriteria,
	HxTableProps,
	HxTableSortCriteria
} from './types';

export type HxTableDataProcessorProps<T extends object, PT extends object = T> =
	Pick<
		HxTableProps<T, PT>,
		| '$model' | '$field'
		| 'pagination' | 'sortColumns' | 'filterColumns' | 'onCriteriaChanged'
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
				if (column.defaultMethod != null) {
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
					acc.push({key: column.key, method: column.defaultMethod, value: column.defaultValue});
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
		const {$model, $field, pagination, sortColumns, filterColumns, onCriteriaChanged} = props;

		const context = useHxContext();
		const tableContext = useHxTable();
		const criteriaRef = useRef<Omit<HxTableDataCriteria, 'type'>>(createDefaultCriteria(props, context));
		useEffect(() => {
			criteriaRef.current = createDefaultCriteria({
				$model, $field,
				pagination, sortColumns, filterColumns
			}, context);
		}, [$model, $field, pagination, sortColumns, filterColumns, context]);
		useEffect(() => {
			const onChange = async (criteria: HxTableDataCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void): Promise<boolean> => {
				try {
					if (onCriteriaChanged != null) {
						await onCriteriaChanged($model, criteria, context);
					}
					callback(true);
					// update criteria
					criteriaRef.current = criteria;
					return true;
				} catch (e) {
					callback(false, e);
					return false;
				}
			};
			const onPageSizeChange = async (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				await onChange({
					...criteriaRef.current, pagination: data, type: 'page-size-change'
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
				await onChange({...criteriaRef.current, pagination: data, type: 'page-number-change'}, callback);
			};
			const onSortChange = async (data: HxTableSortCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				await onChange({...criteriaRef.current, sort: data, type: 'sort-change'}, callback);
			};
			const onFilterChange = async (data: HxTableFilterCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				await onChange({...criteriaRef.current, filter: data, type: 'filter-change'}, callback);
			};
			const onClearSortAndFilter = async (type: 'sort' | 'filter' | 'both', callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				await onChange({
					pagination: criteriaRef.current.pagination, fuzzy: criteriaRef.current.fuzzy,
					type: type === 'sort' ? 'sort-change' : (type === 'filter' ? 'filter-change' : 'clear-sort-and-filter')
				}, callback);
			};
			const onFuzzyChange = async (data: HxTableFuzzyCriteria, callback: (dataSynchronized: boolean, error?: unknown) => void) => {
				await onChange({...criteriaRef.current, fuzzy: data, type: 'fuzzy-change'}, callback);
			};
			const onAskCriteria = (callback: (criteria: Omit<HxTableDataCriteria, 'type'>) => void) => {
				callback(criteriaRef.current);
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
		}, [$model, $field, pagination?.keepPageNumberWhenSizeChange, onCriteriaChanged, tableContext, context]);

		return <Fragment/>;
	};
