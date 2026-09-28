import {ERO, type ReactiveRoot, type ValueChangedEvent} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type ReactNode, type RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import type {WithRequired} from '../../types';
import {HxConsole} from '../../utils';
import {HxButton} from '../button';
import {HxFlex} from '../flex';
import {ChevronLeft, ChevronRight, DotsY} from '../icons';
import {HxLabel} from '../label';
import {HxSelect} from '../select';
import type {HxSelectOption} from '../select-options';
import {HxPaginationDefaults} from './defaults';
import type {HxPaginationData, HxPaginationProps} from './types';
import {readPaginationData} from './utils';

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
			ofTotalPagesKey = HxPaginationDefaults.ofTotalPagesKey, perPageKey = HxPaginationDefaults.perPageKey,
			totalItemsKey1 = HxPaginationDefaults.totalItemsKey1, totalItemsKey2 = HxPaginationDefaults.totalItemsKey2,
			totalCommaKey = HxPaginationDefaults.totalCommaKey,
			...rest
		} = props;

		const context = useHxContext();

		const $pageNumberModel: ReactiveRoot & WithRequired<HxPaginationData, 'pageSize' | 'totalPages'> = ERO.reactive(
			readPaginationData({$model, $field, read, allowedPageSizes}, context));
		const writeValue = (field: 'pageNumber' | 'pageSize' | 'totalPages' | 'totalItems') => {
			if (write != null) {
				// call given write function to write value
				write?.($model, {...ERO.revoke($pageNumberModel)}, context);
			} else if ($field != null && $field.length != 0) {
				// value is get from model, write back
				// currently, the pagination data object is with the same format of value object itself
				ERO.setValue($model, `${$field}.${field}`, $pageNumberModel[field]);
			} else {
				// value is model itself
				// currently, the pagination data object is with the same format of value object ($model) itself
				ERO.setValue($model, field, $pageNumberModel[field]);
			}
		};
		const updateTotalFields = (pageNumber: number, totalPages?: number, totalItems?: number) => {
			let changed = false;
			if (pageNumber !== $pageNumberModel.pageNumber) {
				changed = true;
				writeValue('pageNumber');
			}
			if (totalPages !== $pageNumberModel.totalPages) {
				changed = true;
				writeValue('totalPages');
			}
			if (totalItems !== $pageNumberModel.totalItems) {
				changed = true;
				writeValue('totalItems');
			}
			if (changed) {
				context.forceUpdate();
			}
		};
		const handlePageNumberChange = async (ev: ValueChangedEvent) => {
			ERO.off($pageNumberModel, 'pageSize', handlePageSizeChange);
			try {
				const {pageNumber, totalPages, totalItems} = $pageNumberModel;
				await onPageNumberChange?.($model, $pageNumberModel, context);
				writeValue('pageNumber');
				updateTotalFields(pageNumber, totalPages, totalItems);
			} catch (e) {
				// force rollback value
				ERO.setValueSilent($pageNumberModel, 'pageNumber', ev.oldValue, 'mute-all');
				writeValue('pageNumber');
				context.forceUpdate();
				HxConsole.error('Failed to execute onPageNumberChange in HxPagination.', e);
			}
			ERO.on($pageNumberModel, 'pageSize', handlePageSizeChange);
		};
		ERO.on($pageNumberModel, 'pageNumber', handlePageNumberChange);
		const handlePageSizeChange = async (ev: ValueChangedEvent) => {
			ERO.off($pageNumberModel, 'pageNumber', handlePageNumberChange);
			try {
				const {pageNumber, totalPages, totalItems} = $pageNumberModel;
				await onPageSizeChange?.($model, $pageNumberModel, context);
				writeValue('pageSize');
				updateTotalFields(pageNumber, totalPages, totalItems);
			} catch (e) {
				// force rollback value
				ERO.setValueSilent($pageNumberModel, 'pageSize', ev.oldValue, 'mute-all');
				writeValue('pageSize');
				context.forceUpdate();
				HxConsole.error('Failed to execute onPageSizeChange in HxPagination.', e);
			}
			ERO.on($pageNumberModel, 'pageNumber', handlePageNumberChange);
		};
		ERO.on($pageNumberModel, 'pageSize', handlePageSizeChange);

		// previous page button
		let previousPageBtn: ReactNode | undefined = (void 0);
		if ($pageNumberModel.totalPages > 1) {
			const onPreviousClick = () => {
				ERO.setValue($pageNumberModel, 'pageNumber', $pageNumberModel.pageNumber - 1);
			};
			previousPageBtn = <HxButton data-hx-pagination-previous-page=""
			                            $model={$pageNumberModel} text={<ChevronLeft/>}
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
		if ($pageNumberModel.totalPages > 1 && $pageNumberModel.pageNumber !== $pageNumberModel.totalPages) {
			const onNextClick = () => {
				$pageNumberModel.pageNumber = $pageNumberModel.pageNumber + 1;
			};
			nextPageBtn = <HxButton data-hx-pagination-next-page=""
			                        $model={$pageNumberModel} text={<ChevronRight/>}
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
		if ($pageNumberModel.totalPages > 1) {
			const pages: Array<HxSelectOption<number>> = new Array($pageNumberModel.totalPages).fill(1).map((_, index) => {
				const page = index + 1;
				return {value: page, label: page};
			});
			const selectedLabel = ({value: page}: HxSelectOption<number>) => {
				return <>
					<HxLabel text={page} data-hx-pagination-page-number=""/>
					<HxLabel text={ofTotalPagesKey} data-hx-pagination-page-number-slash=""/>
					<HxLabel text={$pageNumberModel.totalPages} data-hx-pagination-total-pages=""/>
				</>;
			};
			pageNumberBtn = <HxSelect data-hx-pagination-page-number=""
			                          $model={$pageNumberModel} $field="pageNumber"
			                          options={pages}
			                          selectedLabel={selectedLabel} downIcon={<DotsY/>}
			                          $change={{on: 'pageNumber', handle: () => 'repaint'}}/>;
		} else {
			pageNumberBtn = <>
				<HxLabel text={$pageNumberModel.pageNumber} data-hx-pagination-page-number=""/>
				<HxLabel text={ofTotalPagesKey} data-hx-pagination-page-number-slash=""/>
				<HxLabel text={$pageNumberModel.totalPages} data-hx-pagination-total-pages=""/>
			</>;
		}

		// page sizes control
		let pageSizesBtn: ReactNode | undefined = (void 0);
		const pageSizes = [
			...new Set([
				...allowedPageSizes, $pageNumberModel.pageSize
			].filter(x => x != null))
		].sort((a, b) => a - b);
		if (pageSizes.length > 1) {
			const pageSizeOptions: Array<HxSelectOption<number>> = pageSizes.map(size => {
				return {value: size, label: size};
			});
			const selectedLabel = ({value: size}: HxSelectOption<number>) => {
				return <>
					<HxLabel data-hx-pagination-page-size-value="" text={size}/>
					<HxLabel data-hx-pagination-per-page-key="" text={perPageKey}/>
				</>;
			};
			pageSizesBtn = <HxSelect $model={$pageNumberModel} $field="pageSize"
			                         options={pageSizeOptions}
			                         selectedLabel={selectedLabel} downIcon={<DotsY/>}/>;
		} else if (showPageSize) {
			pageSizesBtn = <HxLabel text={<>
				<HxLabel data-hx-pagination-page-size-value="" text={$pageNumberModel.pageSize}/>
				<HxLabel data-hx-pagination-per-page-key="" text={perPageKey}/>
			</>} data-hx-pagination-page-size=""/>;
		}

		let totalItems: ReactNode | undefined = (void 0);
		if ($pageNumberModel.totalItems != null) {
			totalItems = <HxLabel text={<>
				<HxLabel data-hx-pagination-total-items-key1="" text={totalItemsKey1}/>
				<HxLabel data-hx-pagination-total-items-value="" text={$pageNumberModel.totalItems} format="nf0"/>
				<HxLabel data-hx-pagination-total-items-key2="" text={totalItemsKey2}/>
				{pageSizesBtn != null
					? <HxLabel data-hx-pagination-total-comma-key="" text={totalCommaKey}/>
					: (void 0)}
			</>} data-hx-pagination-total-items=""/>;
		}

		if (rest.gapX == null && rest['data-hx-cell-gap-x'] == null) {
			rest.gapX = HxPaginationDefaults.gapX;
		}

		return <HxFlex {...rest}
		               $model={$model} $field={$field} wrap={false}
		               data-hx-pagination=""
		               ref={ref}>
			{/** Use fragment to avoid unnecessary element cloning */}
			<>
				{previousPageBtn}
				{pageNumberBtn}
				{nextPageBtn}
				{totalItems}
				{pageSizesBtn}
			</>
		</HxFlex>;
	}) as unknown as HxPaginationType;
// @ts-expect-error assign component name
HxPagination.displayName = 'HxPagination';
