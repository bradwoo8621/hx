import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type ReactNode, type RefAttributes} from 'react';
import {type HxContext, useHxContext} from '../../contexts';
import type {HxComponentDataProps, HxObject, WithRequired} from '../../types';
import {HxButton} from '../button';
import {HxFlex, type HxFlexProps} from '../flex';
import {ChevronLeft, ChevronRight, DotsY} from '../icons';
import {HxLabel} from '../label';
import {HxSelect} from '../select';
import type {HxSelectOption} from '../select-options';
import {HxPaginationDefaults} from './defaults';
import type {HxPaginationData} from './types';
import {computePaginationData} from './utils';

export type HxPaginationReadData<T extends object> = <V>($model: HxObject<T>, value?: V) => HxPaginationData;
export type HxPaginationWriteData<T extends object> = ($model: HxObject<T>, data: HxPaginationData) => void;
export type HxPaginationOnPageNumberChange<T extends object> = <V>(
	$model: HxObject<T>, value: V | undefined, data: HxPaginationData, context: HxContext
) => void;
export type HxPaginationOnPageSizeChange<T extends object> = <V>(
	$model: HxObject<T>, value: V | undefined, data: WithRequired<HxPaginationData, 'pageSize'>, context: HxContext
) => void;

/**
 * Props interface for the HxPagination component
 * Extends HxFlex props to inherit all flex layout capabilities
 */
export interface HxPaginationProps<T extends object>
	extends Omit<HxFlexProps<T>, '$model' | 'direction' | 'wrap' | 'gapX' | 'alignItems' | 'justifyContent' | 'children'>,
		HxComponentDataProps<T> {
	/** List of allowed page size options displayed in the page size selector dropdown */
	allowedPageSizes?: Array<number>;
	/** Whether to show page size information even when only one page size option is available */
	showPageSize?: boolean;
	/**
	 * Custom formatter function to convert model data to standard HxPaginationData format
	 * Use this when your model stores pagination data in a non-standard structure
	 * @param $model - The full reactive model object
	 * @param value - The value extracted from $model using $field, or $model itself if no $field is specified
	 * @returns Formatted pagination data conforming to HxPaginationData interface
	 */
	read?: HxPaginationReadData<T>;
	write?: HxPaginationWriteData<T>;
	/**
	 * Callback function triggered when the current page number changes
	 * @param $model - The full reactive model object
	 * @param value - The original value from the model
	 * @param data - Updated pagination data after the page number change
	 * @param context - HxContext
	 */
	onPageNumberChange?: HxPaginationOnPageNumberChange<T>;
	/**
	 * Callback function triggered when the page size changes
	 * @param $model - The full reactive model object
	 * @param value - The original value from the model
	 * @param data - Updated pagination data after the page size change
	 * @param context - HxContext
	 */
	onPageSizeChange?: HxPaginationOnPageSizeChange<T>;
	perPageKey?: ReactNode;
	totalItemsKey1?: ReactNode;
	totalItemsKey2?: ReactNode;
}

/**
 * Type definition for the HxPagination component function signature
 */
export type HxPaginationType = <T extends object>(
	props: HxPaginationProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * HxPagination Component
 *
 * A responsive pagination control component for navigating through paginated data.
 * Supports page navigation, page size selection, and integration with reactive data models.
 * Built on top of HxFlex for consistent layout and spacing.
 *
 * Features:
 * - Previous/next page navigation buttons
 * - Page number selector dropdown for quick navigation
 * - Page size selector with configurable options
 * - Automatic support for reactive data binding with $model
 * - Custom format function support for non-standard model structures
 * - Callback events for page number and page size changes
 * - Responsive design that adapts to different screen sizes
 *
 * @example
 * // Basic usage with standard pagination data
 * ```tsx
 * <HxPagination $model={paginationModel} />
 * ```
 *
 * @example
 * // With custom page size options
 * ```tsx
 * <HxPagination
 *   $model={paginationModel}
 *   allowedPageSizes={[10, 20, 50, 100]}
 *   showPageSize={true}
 * />
 * ```
 *
 * @example
 * // With custom format function for non-standard model structure
 * ```tsx
 * <HxPagination
 *   $model={customModel}
 *   format={(_, value) => ({
 *     pageNumber: value.currentPage,
 *     pageSize: value.itemsPerPage,
 *     totalPages: value.totalPageCount
 *   })}
 *   onPageNumberChange={(_, __, data) => handlePageChange(data.pageNumber)}
 * />
 * ```
 */
export const HxPagination =
	forwardRef(<T extends object>(props: HxPaginationProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			allowedPageSizes = HxPaginationDefaults.allowedPageSizes, showPageSize = HxPaginationDefaults.showPageSize,
			read, write,
			onPageNumberChange, onPageSizeChange,
			perPageKey = HxPaginationDefaults.perPageKey,
			totalItemsKey1 = HxPaginationDefaults.totalItemsKey1,
			totalItemsKey2 = HxPaginationDefaults.totalItemsKey2,
			...rest
		} = props;

		const context = useHxContext();

		let value;
		if ($field != null && $field.length != 0) {
			value = ERO.getValue($model, $field);
		} else {
			value = $model;
		}
		const formattedValue = read != null ? read($model, value) : value;
		const paginationData = computePaginationData(formattedValue, allowedPageSizes[0]);
		const $pageNumberModel = ERO.reactive(paginationData);
		ERO.on($pageNumberModel, 'pageNumber', () => {
			write?.($model, paginationData);
			onPageNumberChange?.($model, value, paginationData, context);
		});
		ERO.on($pageNumberModel, 'pageSize', () => {
			write?.($model, paginationData);
			// @ts-expect-error ignore the type check
			onPageSizeChange?.($model, value, paginationData, context);
		});

		// previous page button
		let previousPageBtn: ReactNode | undefined = (void 0);
		if (paginationData.totalPages > 1) {
			const onPreviousClick = () => {
				ERO.setValue($pageNumberModel, 'pageNumber', $pageNumberModel.pageNumber - 1);
			};
			previousPageBtn = <HxButton $model={$pageNumberModel} text={<ChevronLeft/>}
			                            variant="outline" data-hx-button-svg-icon=""
			                            onClick={onPreviousClick}
			                            $disabled={{
				                            on: 'pageNumber',
				                            handle: () => $pageNumberModel.pageNumber === 1,
				                            default: () => $pageNumberModel.pageNumber === 1
			                            }}/>;
		}
		// next page button
		let nextPageBtn: ReactNode | undefined = (void 0);
		if (paginationData.totalPages > 1 && paginationData.pageNumber !== paginationData.totalPages) {
			const onNextClick = () => {
				$pageNumberModel.pageNumber = $pageNumberModel.pageNumber + 1;
			};
			nextPageBtn = <HxButton $model={$pageNumberModel} text={<ChevronRight/>}
			                        variant="outline" data-hx-button-svg-icon=""
			                        onClick={onNextClick}
			                        $disabled={{
				                        on: ['pageNumber', 'totalPages'],
				                        handle: () => $pageNumberModel.pageNumber === $pageNumberModel.totalPages,
				                        default: () => $pageNumberModel.pageNumber === $pageNumberModel.totalPages
			                        }}/>;
		}

		// page number control
		let pageNumberBtn: ReactNode | undefined;
		if (paginationData.totalPages > 1) {
			const pages: Array<HxSelectOption<number>> = new Array(paginationData.totalPages).fill(1).map((_, index) => {
				const page = index + 1;
				return {value: page, label: page};
			});
			pageNumberBtn = <HxSelect $model={$pageNumberModel} $field="pageNumber"
			                          options={pages}
			                          downIcon={<DotsY/>}
			                          $change={{
				                          on: 'pageNumber',
				                          handle: () => 'repaint'
			                          }}/>;
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
				return {
					value: size,
					selectedLabel: <>
						<HxLabel text={size}/>
						<HxLabel text={perPageKey}/>
					</>,
					label: size
				};
			});
			pageSizesBtn = <HxSelect $model={$pageNumberModel} $field="pageSize"
			                         options={pageSizeOptions}
			                         downIcon={<DotsY/>}
			                         $change={{
				                         on: 'pageSize',
				                         handle: () => 'repaint'
			                         }}/>;
		} else if (showPageSize && pageSizes.length === 1) {
			pageSizesBtn = <HxLabel text={<>
				<HxLabel text={value.pageSize}/>
				<HxLabel text={perPageKey}/>
			</>} data-hx-pagination-page-size=""/>;
		}

		let totalItems: ReactNode | undefined = (void 0);
		if (paginationData.totalItems != null) {
			totalItems = <HxLabel text={<>
				<HxLabel text={totalItemsKey1} data-hx-pagination-total-items-key1=""/>
				<HxLabel text={paginationData.totalItems} format="nf0"/>
				<HxLabel text={totalItemsKey2} data-hx-pagination-total-items-key2=""/>
				{pageSizesBtn != null
					? <HxLabel text=","/>
					: (void 0)}
			</>} data-hx-pagination-total-items=""/>;
		}

		return <HxFlex {...rest}
		               $model={$model} $field={$field} gapX="xs"
		               data-hx-pagination=""
		               ref={ref}>
			{/** Use fragment to avoid unnecessary element cloning */}
			<>
				{previousPageBtn}
				{pageNumberBtn}
				<HxLabel text="/"/>
				<HxLabel text={paginationData.totalPages} data-hx-pagination-total-pages=""/>
				{nextPageBtn}
				{totalItems}
				{pageSizesBtn}
			</>
		</HxFlex>;
	}) as unknown as HxPaginationType;
// @ts-expect-error assign component name
HxPagination.displayName = 'HxPagination';
