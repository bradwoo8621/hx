import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef, usePropsToDomExpose} from '../../hooks';
import {HxDataPropToAttrValueComputer} from '../../utils';
import {HxTableDefaults} from './defaults';
import {HxTableBody, type HxTableBodyProps} from './table-body';
import {HxTableContentLayout} from './table-content-layout';
import {HxTableCriteria, type HxTableCriteriaProps} from './table-criteria';
import {HxTableFooter, type HxTableFooterProps} from './table-footer';
import {HxTableHeader, type HxTableHeaderProps} from './table-header';
import {HxTableLayout, type HxTableLayoutProps} from './table-layout';
import {HxTableToolbar, type HxTableToolbarProps} from './table-toolbar';
import type {HxTableProps} from './types';

export const HxTableInner =
	forwardRef(<T extends object, PT extends object = T>(props: HxTableProps<T, PT>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model,
			$field,
			columnGridLines = HxTableDefaults.columnGridLines,
			rowGridLines = HxTableDefaults.rowGridLines,
			stripeRow = HxTableDefaults.stripeRow,
			scrollHeight,
			rowIndex = HxTableDefaults.rowIndex,
			rowIndexMinWidth = Math.max(0, HxTableDefaults.rowIndexMinWidth),
			rowIndexMaxWidth = Math.max(0, HxTableDefaults.rowIndexMaxWidth),
			nestedRow,
			nestedRowOperatorWidth = Math.max(0, HxTableDefaults.nestedRowOperatorWidth),
			nestedRowHover = HxTableDefaults.nestedRowHover,
			nestedRowIndependentHover = HxTableDefaults.nestedRowIndependentHover,

			headers,
			columns,
			fixedStartColumns,
			fixedEndColumns,
			pagination,
			sort,
			filter,
			onCriteriaChanged,
			renderPrepare,

			renderAsForm,
			ignoreHeaders,

			noDataKey = HxTableDefaults.noDataKey,

			toolbarSearchPlaceholderKey = HxTableDefaults.toolbarSearchPlaceholderKey,
			toolbarSortKey = HxTableDefaults.toolbarSortKey,
			toolbarFilterKey = HxTableDefaults.toolbarFilterKey,
			toolbarAddKey = HxTableDefaults.toolbarAddKey,
			toolbarResetKey = HxTableDefaults.toolbarResetKey,
			toolbarApplyKey = HxTableDefaults.toolbarApplyKey,
			toolbarClearAllKey = HxTableDefaults.toolbarClearAllKey,
			toolbarNoChangesKey = HxTableDefaults.toolbarNoChangesKey,
			toolbarUnsavedChangesKey = HxTableDefaults.toolbarUnsavedChangesKey,
			toolbarNoSortKey = HxTableDefaults.toolbarNoSortKey,
			toolbarNoFilterKey = HxTableDefaults.toolbarNoFilterKey,
			toolbarAscKey = HxTableDefaults.toolbarAscKey,
			toolbarDescKey = HxTableDefaults.toolbarDescKey,
			toolbarFilterMatchKey = HxTableDefaults.toolbarFilterMatchKey,
			toolbarFilterUnmatchKey = HxTableDefaults.toolbarFilterUnmatchKey,
			toolbarFilterAndKey = HxTableDefaults.toolbarFilterAndKey,
			toolbarFilterOrKey = HxTableDefaults.toolbarFilterOrKey,

			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);
		const containerRef = useDualRef(ref);

		let scrollable = false;
		let contentMaxHeight: string | undefined = (void 0);
		if (scrollHeight != null && scrollHeight > 0) {
			scrollable = true;
			contentMaxHeight = `${scrollHeight}px`;
		}
		const criteriaProps: HxTableCriteriaProps<T, PT> = {
			$model, $field,
			pagination, sort, filter, onCriteriaChanged
		};
		const toolbarProps: HxTableToolbarProps<T, PT> | undefined =
			onCriteriaChanged != null && ((sort != null && sort.length !== 0) || (filter != null))
				? {
					sort, filter,
					toolbarSearchPlaceholderKey,
					toolbarSortKey, toolbarFilterKey,
					toolbarAddKey, toolbarResetKey, toolbarApplyKey, toolbarClearAllKey,
					toolbarNoChangesKey, toolbarUnsavedChangesKey,
					toolbarNoSortKey, toolbarNoFilterKey,
					toolbarAscKey, toolbarDescKey,
					toolbarFilterMatchKey, toolbarFilterUnmatchKey, toolbarFilterAndKey, toolbarFilterOrKey
				}
				: (void 0);
		const layoutProps: HxTableLayoutProps<T> = {
			rowIndex, rowIndexMinWidth, rowIndexMaxWidth, nestedRow, nestedRowOperatorWidth,
			headers, columns
		};
		const headerProps: HxTableHeaderProps<T> = {
			columnGridLines,
			headers, fixedStartColumns, fixedEndColumns, ignoreHeaders, scrollable
		};
		const bodyProps: HxTableBodyProps<T, PT> = {
			$model, $field,
			rowIndex, nestedRowHover, nestedRowIndependentHover, columnGridLines, rowGridLines, stripeRow,
			columns, fixedStartColumns, fixedEndColumns, renderAsForm, ignoreHeaders,
			noDataKey,
			pagination, renderPrepare
		};
		const footerProps: HxTableFooterProps<T, PT> = {
			$model, $field,
			pagination: onCriteriaChanged != null ? pagination : (void 0)
		};

		// const $modelToChild = HxDataUtils.resolveChildModel($model, $field);
		const restProps = usePropsToDomExpose(rest, $model, context, {
			key: 'HxTable', default: HxTableDefaults, visible
		});
		const hasStickyCell = rowIndex || scrollable
			|| (fixedStartColumns != null && fixedStartColumns > 0)
			|| (fixedEndColumns != null && fixedEndColumns > 0);

		return <div {...restProps}
		            data-hx-table=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            ref={containerRef}>
			<HxTableCriteria {...criteriaProps}/>
			{toolbarProps != null
				? <HxTableToolbar {...toolbarProps}/>
				: (void 0)}
			<div data-hx-table-content=""
			     data-hx-table-content-sticky={hasStickyCell ? '' : (void 0)}
			     data-hx-table-content-v-scroll={scrollable ? '' : (void 0)}
			     style={{maxHeight: contentMaxHeight}}>
				<HxTableContentLayout/>
				<HxTableHeader {...headerProps}/>
				<HxTableBody {...bodyProps}/>
			</div>
			<HxTableFooter {...footerProps}/>
			{/* must at bottom, will compute layout and notify others */}
			<HxTableLayout {...layoutProps}/>
		</div>;
	});
HxTableInner.displayName = 'HxTableInner';

HxDataPropToAttrValueComputer.create('HxTable').and('color').register();
