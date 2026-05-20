import {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {HxInputInner} from '../input/inner';
import {HxFormatInputInner} from './inner';
import {HxFormatInputPatternKits} from './pattern-kits';
import type {HxFormatInputDispatcherProps} from './types';

export type HxFormatInputDispatcherType = <T extends object>(
	props: HxFormatInputDispatcherProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

export const HxFormatInputDispatcher =
	forwardRef(<T extends object>(props: HxFormatInputDispatcherProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
		const {pattern} = props;

		const parsed = HxFormatInputPatternKits.build(pattern);
		if (parsed === false) {
			// downgrade to HxInput
			return <HxInputInner {...props} ref={ref}/>;
		} else {
			return <HxFormatInputInner {...props} kit={parsed} ref={ref}/>;
		}
	}) as unknown as HxFormatInputDispatcherType;
// @ts-expect-error assign component name
HxFormatInputDispatcher.displayName = 'HxFormatInputDispatcher';
