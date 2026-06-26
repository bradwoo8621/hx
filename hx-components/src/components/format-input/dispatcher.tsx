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
		const parsed = HxFormatInputPatternKitsInner.build(props);
		if (parsed === false) {
			// downgrade to HxInput
			return <HxInputInner {...props} ref={ref}/>;
		} else {
			return <HxFormatInputInner {...parsed[1]} kit={parsed[0]} ref={ref}/>;
		}
	}) as unknown as HxFormatInputDispatcherType;
// @ts-expect-error assign component name
HxFormatInputDispatcher.displayName = 'HxFormatInputDispatcher';
