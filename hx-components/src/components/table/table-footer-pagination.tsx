// @ts-expect-error import React
import React from 'react';
import {HxPagination} from '../pagination';
import {HxPaginationDefaults} from '../pagination/defaults';
import {HxTableDefaults} from './defaults';
import {useHxTable} from './table-provider';
import type {HxTablePaginationProps, HxTableProps} from './types';

export type HxTableFooterPaginationProps<T extends object, PT extends object = T> =
	Pick<HxTableProps<T, PT>, | '$model' | 'pagination'>;

export const HxTableFooterPagination =
	<T extends object, PT extends object = T>(props: HxTableFooterPaginationProps<T, PT>) => {
		const {$model, pagination} = props;

		const tableContext = useHxTable();

		const hasPagination = pagination != null;
		if (!hasPagination) {
			return (void 0);
		}

		const {
			position: paginationPosition = HxTableDefaults.paginationPosition,
			...paginationProps
		} = pagination ?? ({} as HxTablePaginationProps<PT>);
		paginationProps.$model = paginationProps?.$model ?? $model;

		const originOnPageNumberChange = paginationProps.onPageNumberChange;
		paginationProps.onPageNumberChange = async ($model, data, context) => {
			await originOnPageNumberChange?.($model, data, context);
			tableContext.pageNumberChange({
				...data,
				pageSize: data.pageSize ?? paginationProps.allowedPageSizes?.[0] ?? HxPaginationDefaults.allowedPageSizes[0]
			});
		};
		const originOnPageSizeChange = paginationProps.onPageSizeChange;
		paginationProps.onPageSizeChange = async ($model, data, context) => {
			await originOnPageSizeChange?.($model, data, context);
			tableContext.pageSizeChange(data);
		};

		return <HxPagination {...paginationProps} gCol={paginationPosition === 'start' ? 1 : 3}/>;
	};
