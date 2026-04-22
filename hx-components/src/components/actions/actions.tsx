// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef} from 'react';
import {useDataMonitor} from '../../hooks';
import {HxPopupProvider, type HxPopupProviderProps} from '../popup';
import {HxSelectDefaults} from '../select/defaults';
import {HxActionsLeadingContent, type HxActionsLeadingProps} from './actions-leading';
import {HxActionsTailingContent, type HxActionsTailingProps} from './actions-tailing';
import {HxActionsDefaults} from './defaults';
import type {HxActionsProps, HxActionsType} from './types';

export const HxActions =
	forwardRef(<T extends object>(props: HxActionsProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model,
			color = HxActionsDefaults.color, various = HxActionsDefaults.various,
			leading, tailing,
			zIndex, gapToEdge = HxSelectDefaults.gapToEdge,
			...rest
		} = props;

		const {visible, disabled} = useDataMonitor(props);

		const providerProps: Omit<HxPopupProviderProps, 'trigger' | 'data' | 'children'> = {
			zIndex, gapToEdge, sameWidthAtMinimum: true
		};
		const leadingProps: HxActionsLeadingProps<T> = {
			$model,
			color, various,
			leading,
			visible, disabled,
			...rest
		};
		const tailingProps: Omit<HxActionsTailingProps<T>, 'visible'> = {
			$model,
			color, various,
			tailing
		};

		return <HxPopupProvider
			{...providerProps}
			data-hx-popup-for-actions=""
			// @ts-expect-error ignore the generic type check
			trigger={<HxActionsLeadingContent {...leadingProps} ref={ref}/>}>
			{/* @ts-expect-error ignore the generic type check */}
			<HxActionsTailingContent {...tailingProps}/>
		</HxPopupProvider>;
	}) as unknown as HxActionsType;
// @ts-expect-error assign component name
HxActions.displayName = 'HxActions';
