// @ts-expect-error import React
import React from 'react';
import type {HxTableProps} from './types';

export type HxTableFooterProps<T extends object, PT extends object = T> = Pick<
	HxTableProps<T, PT>,
	| '$model' | '$field'
	| 'pagination'
>;

export const HxTableFooter =
	<T extends object, PT extends object = T>(props: HxTableFooterProps<T, PT>) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const {$model: _1, $field: _2, pagination: _3} = props;

		return <>
			<div data-hx-table-footer="start"/>

			<div data-hx-table-footer="end"/>
		</>;
	};
