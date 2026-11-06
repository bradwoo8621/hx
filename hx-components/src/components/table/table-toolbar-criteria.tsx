import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {useFuncResultRef} from '../../hooks';
import {HxButton} from '../button';
import {Filter, MagnifyingGlass, Sort} from '../icons';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {HxTableDefaults} from './defaults';
import type {HxTableProps} from './types';

export type HxTableToolbarCriteriaProps<T extends object, PT extends object = T> =
	& Pick<HxTableProps<T, PT>, 'sortColumns' | 'filterColumns'>
	& Required<Pick<HxTableProps<T, PT>, 'fuzzyFilter'>>
	& Pick<HxTableProps<T, PT>, 'fuzzyPlaceholderKey'>;

export const HxTableToolbarCriteria =
	<T extends object, PT extends object = T>(props: HxTableToolbarCriteriaProps<T, PT>) => {
		const {
			sortColumns, filterColumns, fuzzyFilter,
			fuzzyPlaceholderKey = HxTableDefaults.fuzzyPlaceholderKey
		} = props;

		// const tableContext = useHxTable();

		const $fuzzyFilterModel = useFuncResultRef(() => ERO.reactive({value: ''}));

		const hasSort = sortColumns != null && sortColumns.length !== 0;
		const hasFilter = filterColumns != null && filterColumns.length !== 0;

		return <div data-hx-table-toolbar-criteria="">
			{fuzzyFilter
				? <HxInput $model={$fuzzyFilterModel.current} $field="value"
				           prefix={[<HxLabel data-hx-label-input-embed="" data-hx-label-svg-icon=""
				                             text={<MagnifyingGlass/>}/>]}
				           placeholder={fuzzyPlaceholderKey}
				           data-hx-table-toolbar-fuzzy=""/>
				: (void 0)}
			<div data-hx-table-toolbar-criteria-spacer=""/>
			{hasSort
				? <HxButton variant="ghost" text={<Sort/>}
				            data-hx-button-svg-icon="" data-hx-table-toolbar-button="sort"/>
				: (void 0)}
			{hasFilter
				? <HxButton variant="ghost" text={<Filter/>}
				            data-hx-button-svg-icon="" data-hx-table-toolbar-button="filter"/>
				: (void 0)}
		</div>;
	};
