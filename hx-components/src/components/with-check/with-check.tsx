import type {ReactiveObject} from '@hx/data';
// @ts-ignore
import React, {type FC, type ForwardedRef, forwardRef, type PropsWithoutRef} from 'react';
import type {CheckProps} from '../../types';

/** origin component for high-order with check */
export type HxWithCheckOrgFC<P extends object> = FC<P>;
/** props of high-order with check component */
export type HxWithCheckPropsWithoutRef<T extends ReactiveObject & object, P extends object> = PropsWithoutRef<P & CheckProps<T>>;
export const HxWithCheck =
	<P extends object>(C: HxWithCheckOrgFC<P>) => {
		return forwardRef(<T extends ReactiveObject & object>(props: HxWithCheckPropsWithoutRef<T, P>, ref: ForwardedRef<HTMLDivElement>) => {
			const {$check, ...rest} = props;

			return <div data-hx-check-box="" ref={ref}>
				<C {...rest as any}/>
			</div>;
		});
	};
