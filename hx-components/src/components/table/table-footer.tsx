// @ts-expect-error import React
import React, {useEffect, useState} from 'react';
import {HxTableFooterPagination} from './table-footer-pagination';
import {useHxTable} from './table-provider';
import type {HxTableLayout, HxTableProps} from './types';

export type HxTableFooterProps<T extends object, PT extends object = T> =
	Pick<HxTableProps<T, PT>, | '$model' | '$field' | 'pagination'>;

interface HxTableFooterState {
	initialized: boolean;
}

export const HxTableFooter =
	<T extends object, PT extends object = T>(props: HxTableFooterProps<T, PT>) => {
		const {$model, pagination} = props;

		const tableContext = useHxTable();
		const [state, setState] = useState<HxTableFooterState>({initialized: false});
		useEffect(() => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const onLayoutInitialized = (_layout: HxTableLayout) => {
				setState({initialized: true});
			};

			tableContext.onLayoutInitialized(onLayoutInitialized);
			return () => {
				tableContext.offLayoutInitialized(onLayoutInitialized);
			};
		}, [tableContext]);

		if (!state.initialized) {
			return (void 0);
		}

		return <div data-hx-table-footer="">
			<HxTableFooterPagination $model={$model} pagination={pagination}/>
			<div data-hx-table-footer-spreader="" data-hx-grid-cell-col="2"/>
		</div>;
	};
