// @ts-expect-error import React
import React from 'react';
import type {HxTableProps} from './types';

export type HxTableToolbarCriteriaAppliedProps<T extends object, PT extends object = T> =
	& Pick<HxTableProps<T, PT>, 'sortColumns' | 'filterColumns'>;

export const HxTableToolbarCriteriaApplied =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	<T extends object, PT extends object = T>(_props: HxTableToolbarCriteriaAppliedProps<T, PT>) => {
		// const {
		// 	sortColumns, filterColumns
		// } = props;

		// const tableContext = useHxTable();

		// const hasSort = sortColumns != null && sortColumns.length !== 0;
		// const hasFilter = filterColumns != null && filterColumns.length !== 0;

		return <div data-hx-table-toolbar-criteria-applied="">
		</div>;
	};
