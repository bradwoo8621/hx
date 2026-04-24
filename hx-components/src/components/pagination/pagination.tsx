import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import type {HxComponentDataProps, HxObject} from '../../types';
import {HxButton, type HxButtonColor, type HxButtonVarious} from '../button';
import {HxFlex, type HxFlexProps} from '../flex';
import {ChevronLeft, ChevronRight} from '../icons';
import {HxLabel} from '../label';
import {HxSelect} from '../select';
import type {HxSelectOptions} from '../select-options';
import {HxPaginationDefaults} from './defaults';
import type {HxPaginationData} from './types';
import {computePaginationData} from './utils';

export interface HxPaginationProps<T extends object>
	extends Omit<HxFlexProps<T>, '$model' | 'alignItems' | 'justifyContent' | 'children'>,
		HxComponentDataProps<T> {
	color?: HxButtonColor;
	various?: HxButtonVarious;
	allowedPageSizes?: Array<number>;
	/** show page size when only one page size allowed */
	showPageSize?: boolean;
	/**
	 * to format the data in model to pagination data.
	 * when format not provided, the data in model must be HxPaginationData
	 *
	 * - $model: model itself
	 * - value: value get from $model, or $model itself when $field not provided
	 */
	format?: <V>($model: HxObject<T>, value?: V) => HxPaginationData;
	onPageNumberChange?: <V>($model: HxObject<T>, value: V | undefined, current: HxPaginationData, pageNumber: number) => void;
	onPageSizeChange?: <V>($model: HxObject<T>, value: V | undefined, current: HxPaginationData, pageSize: number) => void;
}

export type HxPaginationType = <T extends object>(
	props: HxPaginationProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxPagination =
	forwardRef(<T extends object>(props: HxPaginationProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			color = HxPaginationDefaults.color, various = HxPaginationDefaults.various,
			allowedPageSizes = HxPaginationDefaults.allowedPageSizes, showPageSize = HxPaginationDefaults.showPageSize,
			format,
			...rest
		} = props;

		let value;
		if ($field != null && $field.length != 0) {
			value = ERO.getValue($model, $field);
		} else {
			value = $model;
		}
		const formattedValue = format != null ? format($model, value) : value;
		const paginationData = computePaginationData(formattedValue, allowedPageSizes[0]);
		const pageSizes = [...allowedPageSizes, paginationData.pageSize].filter(x => x != null).sort();
		const $pageNumberModel = ERO.reactive(paginationData);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const pages: HxSelectOptions<any, number> = new Array(paginationData.totalPages).fill(1).map((_, index) => {
			const page = index + 1;
			return {value: page, label: `${page}`};
		});

		return <HxFlex {...rest}
		               $model={$model} $field={$field}
		               data-hx-pagination=""
		               ref={ref}>
			{/** Use fragment to avoid unnecessary element cloning */}
			<>
				{value.totalPages > 1
					? <HxButton text={<ChevronLeft/>}
					            various={various} color={color}
					            data-hx-button-svg-icon=""/>
					: (void 0)}
				{value.totalPages > 1
					? <HxSelect $model={$pageNumberModel} $field="pageNumber" options={pages}/>
					: <HxLabel text={value.pageNumber}/>}
				<HxLabel text=" / "/>
				<HxLabel text={value.totalPages}/>
				{value.pageNumber !== value.totalPages
					? <HxButton text={<ChevronRight/>}
					            various={various} color={color}
					            data-hx-button-svg-icon=""/>
					: (void 0)}
				{pageSizes.length > 1
					? <HxSelect $model={$pageNumberModel} $field="pageSize" options={pages}/>
					: (showPageSize && pageSizes.length === 1
						? <HxLabel text={<>
							<HxLabel text={value.pageSize}/>
							<HxLabel text=" / "/>
							<HxLabel text="~HxCommon.Page"/>
						</>}/>
						: (void 0))}
			</>
		</HxFlex>;
	}) as unknown as HxPaginationType;
// @ts-expect-error assign component name
HxPagination.displayName = 'HxPagination';
