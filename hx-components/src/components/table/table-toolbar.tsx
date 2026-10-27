// @ts-expect-error import React
import React from 'react';
import type {HxTableProps} from './types';

export type HxTableToolbarProps<T extends object, PT extends object = T> =
	Pick<HxTableProps<T, PT>, | 'sort' | 'filter'>;

export const HxTableToolbar =
	<T extends object, PT extends object = T>(props: HxTableToolbarProps<T, PT>) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const {sort: _sort, filter: _filter} = props;

		return <div data-hx-table-toolbar="">
		</div>;
	};
