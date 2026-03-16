import type {ReactiveObject} from '@hx/data';
// noinspection TypeScriptCheckImport
import {type FC, type ForwardedRef, forwardRef, type PropsWithoutRef} from 'react';
import type {CheckProps} from '../../types';

export const WithCheck =
	<T extends ReactiveObject & object, P>(C: FC<P>) => {
		return forwardRef((props: PropsWithoutRef<P & CheckProps<T>>, ref: ForwardedRef<HTMLDivElement>) => {
			const {$check, ...rest} = props;

			return <div data-hx-check-box="" ref={ref}>
				<C {...rest as any}/>
			</div>;
		});
	};
