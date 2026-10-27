// @ts-expect-error import React
import React, {useRef} from 'react';
import type {HxContext} from '../../contexts';
import type {HxObject, WithRequired} from '../../types';
import {HxPagination, type HxPaginationData} from '../pagination';
import {HxTableDefaults} from './defaults';
import {useHxTable} from './table-provider';
import type {HxTablePaginationProps, HxTableProps} from './types';

export type HxTableFooterPaginationProps<T extends object, PT extends object = T> =
	Pick<HxTableProps<T, PT>, | '$model' | 'pagination'>;

export const HxTableFooterPagination =
	<T extends object, PT extends object = T>(props: HxTableFooterPaginationProps<T, PT>) => {
		const {$model, pagination} = props;

		const tableContext = useHxTable();
		// ugly, but anyway, it is necessary
		const dataUpdatedRef = useRef(false);

		const hasPagination = pagination != null;
		if (!hasPagination) {
			return (void 0);
		}

		const {
			position: paginationPosition = HxTableDefaults.paginationPosition,
			...paginationProps
		} = pagination ?? ({} as HxTablePaginationProps<PT>);
		paginationProps.$model = paginationProps?.$model ?? $model;

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onPageSizeChange = async (_$model: HxObject<PT>, data: WithRequired<HxPaginationData, 'pageSize'>, _context: HxContext) => {
			return new Promise<void>((resolve, reject) => {
				tableContext.pageSizeChange(data, (dataUpdated, error) => {
					if (error == null) {
						dataUpdatedRef.current = dataUpdated;
						resolve();
					} else {
						dataUpdatedRef.current = false;
						reject(error);
					}
				});
			});
		};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onPageNumberChange = async (_$model: HxObject<PT>, data: HxPaginationData, _context: HxContext) => {
			return new Promise<void>((resolve, reject) => {
				tableContext.pageNumberChange(data, (dataUpdated, error) => {
					if (error == null) {
						dataUpdatedRef.current = dataUpdated;
						resolve();
					} else {
						dataUpdatedRef.current = false;
						reject(error);
					}
				});
			});
		};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onPageChanged = async (_$model: HxObject<PT>, _data: HxPaginationData, _context: HxContext) => {
			if (dataUpdatedRef.current) {
				dataUpdatedRef.current = false;
				tableContext.dataChanged();
			}
		};

		return <HxPagination {...paginationProps}
		                     onPageSizeChange={onPageSizeChange}
		                     onPageNumberChange={onPageNumberChange}
		                     onPageChanged={onPageChanged}
		                     gCol={paginationPosition === 'start' ? 1 : 3}/>;
	};
