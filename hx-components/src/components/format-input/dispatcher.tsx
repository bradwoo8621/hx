// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {HxInputInner} from '../input/inner';
import {HxFormatInputInner} from './inner';
import {HxFormatInputPatternKitsInner} from './pattern-kits';
import type {HxFormatInputDispatcherProps} from './types';

export type HxFormatInputDispatcherType = <T extends object>(
	props: HxFormatInputDispatcherProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

export const HxFormatInputDispatcher =
	forwardRef(<T extends object>(props: HxFormatInputDispatcherProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const {pattern: _, ...rest} = props;

		const parsed = HxFormatInputPatternKitsInner.build(props);
		if (parsed === false) {
			// downgrade to HxInput
			return <HxInputInner {...rest} ref={ref}/>;
		} else {
			return <HxFormatInputInner {...rest} kit={parsed} ref={ref}/>;
		}
	}) as unknown as HxFormatInputDispatcherType;
// @ts-expect-error assign component name
HxFormatInputDispatcher.displayName = 'HxFormatInputDispatcher';
