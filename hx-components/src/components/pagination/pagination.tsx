import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type ReactNode, type RefAttributes} from 'react';
import type {HxComponentDataProps, HxObject} from '../../types';
import {HxButton, type HxButtonColor, type HxButtonVarious} from '../button';
import {HxFlex, type HxFlexProps} from '../flex';
import {ChevronLeft, ChevronRight} from '../icons';
import {HxLabel} from '../label';
import {HxSelect} from '../select';
import type {HxSelectOption} from '../select-options';
import {HxPaginationDefaults} from './defaults';
import type {HxPaginationData} from './types';
import {computePaginationData} from './utils';

export type HxPaginationColor = HxButtonColor;
/** Style variant for actions component, excludes ghost variant which is not suitable for this component */
export type HxPaginationVarious = HxButtonVarious;

export interface HxPaginationProps<T extends object>
	extends Omit<HxFlexProps<T>, '$model' | 'gapX' | 'alignItems' | 'justifyContent' | 'children'>,
		HxComponentDataProps<T> {
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
		const $pageNumberModel = ERO.reactive(paginationData);

		// previous page button
		let previousPageBtn: ReactNode | undefined = (void 0);
		if (paginationData.totalPages > 1) {
			previousPageBtn = <HxButton text={<ChevronLeft/>}
			                            various="outline" data-hx-button-svg-icon=""/>;
		}
		// next page button
		let nextPageBtn: ReactNode | undefined = (void 0);
		if (paginationData.pageNumber !== paginationData.totalPages) {
			nextPageBtn = <HxButton text={<ChevronRight/>}
			                        various="outline" data-hx-button-svg-icon=""/>;
		}

		// page number control
		let pageNumberBtn: ReactNode | undefined;
		if (paginationData.totalPages > 1) {
			const pages: Array<HxSelectOption<number>> = new Array(paginationData.totalPages).fill(1).map((_, index) => {
				const page = index + 1;
				return {value: page, label: page};
			});
			pageNumberBtn = <HxSelect $model={$pageNumberModel} $field="pageNumber"
			                          options={pages}/>;
		} else {
			pageNumberBtn = <HxLabel text={paginationData.pageNumber}/>;
		}

		// page sizes control
		let pageSizesBtn: ReactNode | undefined = (void 0);
		const pageSizes = [
			...new Set([
				...allowedPageSizes, paginationData.pageSize
			].filter(x => x != null))
		].sort((a, b) => a - b);
		if (pageSizes.length > 1) {
			const pageSizeOptions: Array<HxSelectOption<number>> = pageSizes.map(size => {
				return {value: size, label: size};
			});
			// <HxLabel text="~HxCommon.PerPage"/>
			pageSizesBtn = <HxSelect $model={$pageNumberModel} $field="pageSize"
			                         options={pageSizeOptions}/>;
		} else if (showPageSize && pageSizes.length === 1) {
			pageSizesBtn = <HxLabel text={<>
				<HxLabel text={value.pageSize}/>
				<HxLabel text="~HxCommon.PerPage"/>
			</>} data-hx-pagination-page-size=""/>;
		}

		return <HxFlex {...rest}
		               $model={$model} $field={$field} gapX="xs"
		               data-hx-pagination=""
		               ref={ref}>
			{/** Use fragment to avoid unnecessary element cloning */}
			<>
				{previousPageBtn}
				{pageNumberBtn}
				<HxLabel text="/" data-hx-pagination-slash=""/>
				<HxLabel text={paginationData.totalPages} data-hx-pagination-total-pages=""/>
				{nextPageBtn}
				{pageSizesBtn}
			</>
		</HxFlex>;
	}) as unknown as HxPaginationType;
// @ts-expect-error assign component name
HxPagination.displayName = 'HxPagination';
