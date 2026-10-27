// @ts-expect-error import React
import React, {Fragment, useEffect, useRef} from 'react';
import {type HxContext, useHxContext} from '../../contexts';
import type {WithRequired} from '../../types';
import {readPaginationData} from '../pagination';
import {HxPaginationDefaults} from '../pagination/defaults';
import {useHxTable} from './table-provider';
import type {
	HxTableDataCriteria,
	HxTableFilterCriteria,
	HxTablePaginationCriteria,
	HxTableProps,
	HxTableSortCriteria
} from './types';

export type HxTableCriteriaProps<T extends object, PT extends object = T> =
	Pick<HxTableProps<T, PT>, '$model' | 'pagination' | 'sort' | 'filter' | 'onCriteriaChanged'>

const createDefaultCriteria =
	<T extends object, PT extends object = T>(options: Omit<HxTableCriteriaProps<T, PT>, 'onCriteriaChanged'>, context: HxContext) => {
		const {$model, pagination, sort, filter} = options;

		const criteria: Omit<HxTableDataCriteria, 'type'> = {};
		if (pagination != null) {
			criteria.pagination = readPaginationData({
				...pagination,
				$model: pagination.$model ?? $model,
				allowedPageSizes: pagination.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes
			}, context);
		}
		if (sort != null && sort.length !== 0) {
			const defaultSort = sort.reduce((acc, column) => {
				if (column.default != null) {
					acc.push({key: column.key || column.text, method: column.default});
				}
				return acc;
			}, [] as HxTableSortCriteria);
			if (defaultSort.length !== 0) {
				criteria.sort = defaultSort;
			}
		}
		if (filter != null) {
			if (filter.columns != null && filter.columns.length !== 0) {
				const defaultFilter = filter.columns.reduce((acc, column) => {
					if (column.defaultValue != null || (Array.isArray(column.defaultValue) && column.defaultValue.length !== 0)) {
						acc.push({
							key: column.key || column.text,
							method: column.defaultMethod,
							value: column.defaultValue
						});
					}
					return acc;
				}, [] as HxTableFilterCriteria);
				if (defaultFilter.length !== 0) {
					criteria.filter = defaultFilter;
				}
			}
		}

		return criteria;
	};

export const HxTableCriteria =
	<T extends object, PT extends object = T>(props: HxTableCriteriaProps<T, PT>) => {
		const {$model, pagination, sort, filter, onCriteriaChanged} = props;

		const context = useHxContext();
		const tableContext = useHxTable();
		const criteriaRef = useRef<Omit<HxTableDataCriteria, 'type'>>(createDefaultCriteria(props, context));
		useEffect(() => {
			criteriaRef.current = createDefaultCriteria({$model, pagination, sort, filter}, context);
		}, [$model, pagination, sort, filter, context]);
		useEffect(() => {
			const onChange = async (criteria: HxTableDataCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => {
				try {
					if (onCriteriaChanged != null) {
						await onCriteriaChanged($model, criteria, context);
					}
					callback(true);
					// update criteria
					criteriaRef.current = criteria;
				} catch (e) {
					callback(false, e);
				}
			};
			const onPageSizeChange = async (data: WithRequired<HxTablePaginationCriteria, 'pageSize'>, callback: (dataUpdated: boolean, error?: unknown) => void) => {
				await onChange({...criteriaRef.current, pagination: data, type: 'page-size-change'}, callback);
			};
			const onPageNumberChange = async (data: HxTablePaginationCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => {
				await onChange({...criteriaRef.current, pagination: data, type: 'page-number-change'}, callback);
			};
			const onSortChange = async (data: HxTableSortCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => {
				await onChange({...criteriaRef.current, sort: data, type: 'sort-change'}, callback);
			};
			const onFilterChange = async (data: HxTableFilterCriteria, callback: (dataUpdated: boolean, error?: unknown) => void) => {
				await onChange({...criteriaRef.current, filter: data, type: 'filter-change'}, callback);
			};
			const onAskCriteria = (callback: (criteria: Omit<HxTableDataCriteria, 'type'>) => void) => {
				callback(criteriaRef.current);
			};

			tableContext.onPageSizeChange(onPageSizeChange);
			tableContext.onPageNumberChange(onPageNumberChange);
			tableContext.onSortChange(onSortChange);
			tableContext.onFilterChange(onFilterChange);
			tableContext.onAskCriteria(onAskCriteria);

			return () => {
				tableContext.offPageSizeChange(onPageSizeChange);
				tableContext.offPageNumberChange(onPageNumberChange);
				tableContext.offSortChange(onSortChange);
				tableContext.offFilterChange(onFilterChange);
				tableContext.offAskCriteria(onAskCriteria);
			};
		}, [$model, onCriteriaChanged, tableContext, context]);

		return <Fragment/>;
	};
