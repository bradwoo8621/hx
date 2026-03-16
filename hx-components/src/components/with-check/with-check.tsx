import type {ReactiveObject} from '@hx/data';
// @ts-ignore
import React, {type FC, type ForwardedRef, forwardRef, type PropsWithoutRef, type RefAttributes} from 'react';
import type {CheckProps} from '../../types';

/** origin component for high-order with check */
export type HxWithCheckOrgFC<P extends object> = FC<P>;
/** props of high-order with check component */
export type HxWithCheckPropsWithoutRef<T extends ReactiveObject & object, P extends object> = PropsWithoutRef<P & CheckProps<T>>;
/** high-order component which with check */
export type HxWithCheckFC<T extends ReactiveObject & object, P extends object> = FC<PropsWithoutRef<P & CheckProps<T>> & RefAttributes<HTMLDivElement>>;
export const HxWithCheck =
	<T extends ReactiveObject & object, P extends object>(C: HxWithCheckOrgFC<P>): HxWithCheckFC<T, P> => {
		return forwardRef((props: HxWithCheckPropsWithoutRef<T, P>, ref: ForwardedRef<HTMLDivElement>) => {
			const {$check, ...rest} = props;

			return <div data-hx-check-box="" ref={ref}>
				<C {...rest as any}/>
			</div>;
		}) as HxWithCheckFC<T, P>;
	};
