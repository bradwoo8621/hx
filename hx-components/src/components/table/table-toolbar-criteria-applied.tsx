// @ts-expect-error import React
import React, {type ReactNode, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {HxBadge} from '../badge';
import {HxButton} from '../button';
import {SortAsc, SortDesc} from '../icons';
import {HxLabel} from '../label';
import {useHxTable} from './table-provider';
import type {HxTableDataCriteria, HxTableFilterColumn, HxTableProps, HxTableSortColumn} from './types';

export type HxTableToolbarCriteriaAppliedProps<T extends object, PT extends object = T> =
	& Pick<
		HxTableProps<T, PT>,
		| 'sortColumns' | 'filterColumns'
	>
	& Required<
	Pick<
		HxTableProps<T, PT>,
		| 'filterMatchKey' | 'filterNotMatchKey' | 'filterBetweenKey' | 'filterNotBetweenKey'
		| 'clearCriteriaKey'
	>>;

type HxTableToolbarCriteriaAppliedRef = Pick<HxTableDataCriteria, 'sort' | 'filter'>;

export const HxTableToolbarCriteriaApplied =
	<T extends object, PT extends object = T>(props: HxTableToolbarCriteriaAppliedProps<T, PT>) => {
		const {
			sortColumns, filterColumns,
			filterMatchKey, filterNotMatchKey, filterBetweenKey, filterNotBetweenKey,
			clearCriteriaKey
		} = props;

		const context = useHxContext();
		const tableContext = useHxTable();
		const criteriaRef = useRef<HxTableToolbarCriteriaAppliedRef>({});
		useEffect(() => {
			const updateCriteria = () => {
				tableContext.askCriteria((criteria) => {
					criteriaRef.current = {sort: criteria.sort, filter: criteria.filter};
					if (criteriaRef.current.sort == null || criteriaRef.current.sort.length === 0) {
						delete criteriaRef.current.sort;
					}
					if (criteriaRef.current.filter == null || criteriaRef.current.filter.length === 0) {
						delete criteriaRef.current.filter;
					}
					context.forceUpdate();
				});
			};
			// first round
			updateCriteria();

			tableContext.onSortOrFilterChanged(updateCriteria);

			return () => {
				tableContext.offSortOrFilterChanged(updateCriteria);
			};
		}, [tableContext, context]);

		// eslint-disable-next-line react-hooks/refs
		if (Object.keys(criteriaRef.current).length === 0) {
			return (void 0);
		}

		let sorts: Array<ReactNode> | undefined = (void 0);
		// eslint-disable-next-line react-hooks/refs
		if (criteriaRef.current.sort != null && criteriaRef.current.sort.length !== 0 && sortColumns != null && sortColumns.length !== 0) {
			const sortColumnMap = (sortColumns ?? []).reduce((map, column) => {
				map[column.key] = column;
				return map;
			}, {} as Record<string, HxTableSortColumn>);
			// eslint-disable-next-line react-hooks/refs
			sorts = criteriaRef.current.sort.reduce((sorts, sort) => {
				const key = sort.key;
				const sortColumn = sortColumnMap[key];
				if (sortColumn != null) {
					sorts.push(<HxBadge variant="outline" color="waive" text={<>
						<HxLabel text={sortColumn.text}/>
						{sort.method === 'asc' ? <SortAsc/> : <SortDesc/>}
					</>} data-hx-table-toolbar-applied-sort="" key={sort.key}/>);
				}
				return sorts;
			}, [] as Array<ReactNode>);
		}
		let filters: Array<ReactNode> | undefined = (void 0);
		// eslint-disable-next-line react-hooks/refs
		if (criteriaRef.current.filter != null && criteriaRef.current.filter.length !== 0 && filterColumns != null && filterColumns.length !== 0) {
			const filterColumnMap = (filterColumns ?? []).reduce((map, column) => {
				map[column.key] = column;
				return map;
			}, {} as Record<string, HxTableFilterColumn>);
			// eslint-disable-next-line react-hooks/refs
			filters = criteriaRef.current.filter.reduce((filters, filter) => {
				const key = filter.key;
				const filterColumn = filterColumnMap[key];
				if (filterColumn != null) {
					let method: ReactNode;
					let value: ReactNode;
					switch (filter.method) {
						case 'not-match': {
							method = filterNotMatchKey;
							value = <HxLabel text={filter.value || ''}/>;
							break;
						}
						case 'between': {
							method = filterBetweenKey;
							value = <HxLabel text={<>
								{
									// @ts-expect-error ignore check
									`${filter.value[0] || ''}`.trim()}, {`${filter.value[1] || ''}`.trim()
							}
							</>}/>;
							break;
						}
						case 'not-between': {
							method = filterNotBetweenKey;
							value = <HxLabel text={<>
								{
									// @ts-expect-error ignore check
									`${filter.value[0] || ''}`.trim()}, {`${filter.value[1] || ''}`.trim()
							}
							</>}/>;
							break;
						}
						case 'match':
						default: {
							method = filterMatchKey;
							value = <HxLabel text={filter.value || ''}/>;
							break;
						}
					}

					filters.push(<HxBadge variant="outline" color="waive" text={<>
						<HxLabel text={filterColumn.text}/>
						<HxLabel text={method} data-hx-table-toolbar-applied-filter-method=""/>
						{value}
					</>} data-hx-table-toolbar-applied-filter="" key={filter.key}/>);
				}
				return filters;
			}, [] as Array<ReactNode>);
		}

		const onClearClick = () => {
			let type: 'sort' | 'filter' | 'both' = 'both';
			if (criteriaRef.current.sort == null) {
				type = 'filter';
			} else if (criteriaRef.current.filter == null) {
				type = 'sort';
			}
			tableContext.clearSortAndFilter(type);
		};

		return <div data-hx-table-toolbar-criteria-applied="">
			{sorts}
			{filters}
			<HxButton variant="ghost" color="waive" text={clearCriteriaKey}
			          data-hx-table-toolbar-button="clear-criteria"
			          onClick={onClearClick}/>
		</div>;
	};
