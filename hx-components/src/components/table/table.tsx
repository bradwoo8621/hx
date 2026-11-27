// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxTableInner} from './inner';
import {HxTableProvider} from './table-provider';
import type {HxTableProps} from './types';

export type HxTableType = <T extends object>(
	props: HxTableProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxTable =
	forwardRef(<T extends object>(props: HxTableProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		return <HxTableProvider>
			{/* @ts-expect-error ignore type check */}
			<HxTableInner {...props} ref={ref}/>
		</HxTableProvider>;
	}) as unknown as HxTableType;
// @ts-expect-error assign component name
HxTable.displayName = 'HxTable';

export type HxWithCheckTableType = <T extends object>(
	props: HxWithCheckProps<T, HxTableProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;
/**
 * Table component with built-in form validation features.
 * Supports all HxTable props plus additional validation rules from HxWithCheck.
 */
export const HxWithCheckTable = HxWithCheck(HxTable, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckTableType;
// @ts-expect-error assign component name
HxWithCheckTable.displayName = 'HxWithCheckTable';
