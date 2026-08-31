// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
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
