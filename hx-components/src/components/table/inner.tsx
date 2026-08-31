import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef} from '../../hooks';
import {DOMUtils} from '../../utils';
import {HxTableDefaults} from './defaults';
import {HxTableBody, type HxTableBodyProps} from './table-body';
import {HxTableFooter} from './table-footer';
import {HxTableHeader, type HxTableHeaderProps} from './table-header';
import type {HxTableProps} from './types';

export const HxTableInner =
	forwardRef(<T extends object>(props: HxTableProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			border = HxTableDefaults.border, borderRadius = HxTableDefaults.borderRadius,
			columnGridLines = HxTableDefaults.columnGridLines,
			maxBodyHeight,
			rowIndex = HxTableDefaults.rowIndex,

			headers, columns,

			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);
		const containerRef = useDualRef(ref);

		const headerProps: HxTableHeaderProps<T> = {
			columnGridLines, rowIndex,
			headers
		};
		const bodyProps: HxTableBodyProps<T> = {
			columnGridLines, rowIndex,
			maxBodyHeight,
			columns
		};

		// const $modelToChild = HxDataUtils.resolveChildModel($model, $field);
		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            data-hx-table=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            data-hx-border={border ? '' : (void 0)} data-hx-border-radius={borderRadius}
		            data-hx-visible={(visible ?? true) ? '' : 'no'}
		            ref={containerRef}>
			<HxTableHeader {...headerProps}/>
			<HxTableBody {...bodyProps}/>
			<HxTableFooter/>
		</div>;
	});
HxTableInner.displayName = 'HxTableInner';
