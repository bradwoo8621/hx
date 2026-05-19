import {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {HxInputInner} from '../input/inner';
import {HxFormatInputInner} from './inner';
import type {HxFormatInputDispatcherProps} from './types';
import {parsePattern} from './utils';

export type HxFormatInputDispatcherType = <T extends object>(
	props: HxFormatInputDispatcherProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

export const HxFormatInputDispatcher =
	forwardRef(<T extends object>(props: HxFormatInputDispatcherProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
		const {pattern} = props;

		const parsed = parsePattern(pattern);
		if (parsed === false) {
			// downgrade to HxInput
			return <HxInputInner {...props} ref={ref}/>;
		} else {
			return <HxFormatInputInner {...props} pattern={parsed} ref={ref}/>;
		}
	}) as unknown as HxFormatInputDispatcherType;
// @ts-expect-error assign component name
HxFormatInputDispatcher.displayName = 'HxFormatInputDispatcher';
