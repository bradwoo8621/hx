// @ts-expect-error import React
import React from 'react';
import {HxTableDefaults} from './defaults';
import type {HxTableProps} from './types';

export type HxTableToolbarProps<T extends object, PT extends object = T> =
	Pick<
		HxTableProps<T, PT>,
		| 'sortColumns' | 'filterColumns' | 'fuzzyFilter'
	>;

/**
 * Table toolbar: the only entry for sort and filter. The toolbar row holds the
 * global search box and the sort/filter entry buttons; the condition bar below
 * shows the committed criteria as chips. Panels are non-modal popovers, and
 * every panel edit stays in a draft until Apply commits it in one criteria change.
 */
export const HxTableToolbar =
	<T extends object, PT extends object = T>(props: HxTableToolbarProps<T, PT>) => {
		const {sortColumns, filterColumns, fuzzyFilter = HxTableDefaults.fuzzyFilter} = props;

		// const context = useHxContext();
		// const tableContext = useHxTable();

		const hasSort = sortColumns != null && sortColumns.length !== 0;
		const hasFuzzySearch = fuzzyFilter;
		const hasFilter = filterColumns != null && filterColumns.length !== 0;

		if (!hasSort && !hasFuzzySearch && !hasFilter) {
			return (void 0);
		}

		return <div data-hx-table-toolbar="">
			<div data-hx-table-criteria-operate=""/>
			{(hasSort || hasFilter)
				? <div data-hx-table-criteria-display=""/>
				: (void 0)}
		</div>;
	};
