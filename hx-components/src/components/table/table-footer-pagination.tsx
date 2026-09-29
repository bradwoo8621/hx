// @ts-expect-error import React
import React from 'react';
import {HxPagination} from '../pagination';
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

		const originOnPageChanged = paginationProps.onPageChanged;
		paginationProps.onPageChanged = async ($model, data, context) => {
			await originOnPageChanged?.($model, data, context);
			tableContext.pageChanged(data);
		};

		return <HxPagination {...paginationProps} gCol={paginationPosition === 'start' ? 1 : 3}/>;
	};
