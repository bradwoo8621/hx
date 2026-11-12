// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {HxSelectOptionsHolder, type HxSelectOptionsProps, HxSelectOptionsProvider} from '../select-options';
import {HxOptionsLabelText} from './text-label';
import type {HxOptionsLabelProps} from './types';

export type HxOptionsLabelType = <T extends object>(
	props: HxOptionsLabelProps<T> & RefAttributes<HTMLSpanElement>
) => ReactElement | null;

export const HxOptionsLabel =
	forwardRef(<T extends object>(props: HxOptionsLabelProps<T>, ref: ForwardedRef<HTMLSpanElement>) => {
		const {
			$model,
			options, optionsDependsOn, onOptionsChange,
			...rest
		} = props;

		/** Props passed to select options holder for managing dynamic options */
		const optionsHolderProps: HxSelectOptionsProps<T> = {$model, options, optionsDependsOn, onOptionsChange};

		return <HxSelectOptionsProvider>
			{/* @ts-expect-error ignore check */}
			<HxOptionsLabelText $model={$model} {...rest} ref={ref}/>
			{/* Hidden holder for managing dynamic options loading and change events */}
			<HxSelectOptionsHolder {...optionsHolderProps}/>
		</HxSelectOptionsProvider>;
	}) as unknown as HxOptionsLabelType;
// @ts-expect-error assign component name
HxOptionsLabel.displayName = 'HxOptionsLabel';
