import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef} from '../../hooks';
import {DOMUtils, HxDataPropToAttrValueComputer} from '../../utils';
import {HxTableDefaults} from './defaults';
import {HxTableBody, type HxTableBodyProps} from './table-body';
import {HxTableFooter} from './table-footer';
import {HxTableHeader, type HxTableHeaderProps} from './table-header';
import {HxTableLayout, type HxTableLayoutProps} from './table-layout';
import type {HxTableProps} from './types';

export const HxTableInner =
	forwardRef(<T extends object>(props: HxTableProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			columnGridLines = HxTableDefaults.columnGridLines,
			rowGridLines = HxTableDefaults.rowGridLines,
			stripeRow = HxTableDefaults.stripeRow,
			maxBodyHeight,
			rowIndex = HxTableDefaults.rowIndex, rowIndexMinWidth = Math.max(0, HxTableDefaults.rowIndexMinWidth),

			headers, columns,

			renderAsForm, ignoreHeaders,

			noDataKey = HxTableDefaults.noDataKey,

			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);
		const containerRef = useDualRef(ref);

		const layoutProps: HxTableLayoutProps<T> = {
			rowIndex, rowIndexMinWidth,
			headers, columns
		};
		const headerProps: HxTableHeaderProps<T> = {
			columnGridLines,
			headers, ignoreHeaders
		};
		const bodyProps: HxTableBodyProps<T> = {
			$model, $field,
			rowIndex, columnGridLines, rowGridLines, stripeRow,
			maxBodyHeight,
			columns, renderAsForm, ignoreHeaders,
			noDataKey
		};

		// const $modelToChild = HxDataUtils.resolveChildModel($model, $field);
		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context, {
			key: 'HxTable', default: HxTableDefaults, visible
		});

		return <div {...restProps}
		            data-hx-table=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            ref={containerRef}>
			<HxTableHeader {...headerProps}/>
			<HxTableBody {...bodyProps}/>
			<HxTableFooter/>
			{/* must at bottom, will compute layout and notify others */}
			<HxTableLayout {...layoutProps}/>
		</div>;
	});
HxTableInner.displayName = 'HxTableInner';

HxDataPropToAttrValueComputer.create('HxTable').and('color').register();
