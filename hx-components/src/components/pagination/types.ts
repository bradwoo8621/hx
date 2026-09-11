import {type ReactNode} from 'react';
import {type HxContext} from '../../contexts';
import type {HxComponentDataProps, HxObject, HxOmittedDataAttributes, WithRequired} from '../../types';
import type {HxFlexProps} from '../flex';

/**
 * Pagination data structure that holds pagination state information
 */
export interface HxPaginationData {
	/** Number of items per page */
	pageSize?: number;
	/** Current active page number (1-based indexing) */
	pageNumber: number;
	/** Total number of available pages */
	totalPages?: number;
	/** Total number of items across all pages */
	totalItems?: number;
}

export type HxPaginationReadData<T extends object> = <V>($model: HxObject<T>, value: V | null | undefined, context: HxContext) => Partial<HxPaginationData>;
export type HxPaginationWriteData<T extends object> = ($model: HxObject<T>, data: HxPaginationData, context: HxContext) => void;
export type HxPaginationOnPageNumberChange<T extends object> = <V>(
	$model: HxObject<T>, value: V | undefined, data: HxPaginationData, context: HxContext
) => void;
export type HxPaginationOnPageSizeChange<T extends object> = <V>(
	$model: HxObject<T>, value: V | undefined, data: WithRequired<HxPaginationData, 'pageSize'>, context: HxContext
) => void;

export type ExcludedPaginationDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-pagination';

/**
 * Props interface for the HxPagination component
 * Extends HxFlex props to inherit all flex layout capabilities
 */
export interface HxPaginationProps<T extends object>
	extends Omit<HxFlexProps<T>, '$model' | 'direction' | 'wrap' | 'alignItems' | 'justifyContent' | 'children' | ExcludedPaginationDataAttrNames>,
		HxComponentDataProps<T> {
	/** List of allowed page size options displayed in the page size selector dropdown */
	allowedPageSizes?: Array<number>;
	/** Whether to show page size information even when only one page size option is available */
	showPageSize?: boolean;
	/**
	 * Custom formatter function to convert model data to standard HxPaginationData format.
	 * Use this when your model stores pagination data in a non-standard structure.
	 *
	 * @param $model - The full reactive model object
	 * @param value - The value extracted from $model using $field, or $model itself if no $field is specified
	 * @returns Formatted pagination data conforming to HxPaginationData interface
	 */
	read?: HxPaginationReadData<T>;
	/**
	 * Custom writer that persists pagination data back to the model.
	 * Use this when your model stores pagination data in a non-standard structure.
	 *
	 * When omitted, the changed field is written back to `$field.pageNumber` / `$field.pageSize`,
	 * or to the model root when no `$field` is given, which assumes the model already matches
	 * {@link HxPaginationData}.
	 *
	 * @param $model - The full reactive model object
	 * @param data - Updated pagination data after the page number or page size change
	 * @param context - HxContext
	 */
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
	/** i18n key or node rendered after the page size number, e.g. "20 / Page" (default `~HxCommon.PerPage`) */
	perPageKey?: ReactNode;
	/** i18n key or node rendered before the total item count, e.g. "Total 120 Items" (default `~HxCommon.TotalItems1`) */
	totalItemsKey1?: ReactNode;
	/** i18n key or node rendered after the total item count, e.g. "Total 120 Items" (default `~HxCommon.TotalItems2`) */
	totalItemsKey2?: ReactNode;
}
