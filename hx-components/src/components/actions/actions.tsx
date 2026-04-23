// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef} from 'react';
import {useDataMonitor} from '../../hooks';
import {HxPopupProvider, type HxPopupProviderProps} from '../popup';
import {HxSelectDefaults} from '../select/defaults';
import {HxActionsLeadingContent, type HxActionsLeadingProps} from './actions-leading';
import {HxActionsTailingContent, type HxActionsTailingProps} from './actions-tailing';
import {HxActionsDefaults} from './defaults';
import type {HxActionsProps, HxActionsType} from './types';

/**
 * HxActions Component
 * A versatile dropdown action menu component that supports multiple trigger types and nested action groups
 * Built on top of HxPopupProvider for popup management, provides keyboard navigation and accessibility features
 *
 * Features:
 * - Multiple trigger types: string, label, single button, button group
 * - Flexible popup content: single action, action groups, multiple nested groups
 * - Automatic divider rendering between action groups
 * - Full keyboard navigation support (arrow keys, enter, escape)
 * - Accessible with proper ARIA attributes and focus management
 * - Reactive state integration with HxObject model
 *
 * @param props - Component configuration properties
 * @param ref - Forwarded ref to the trigger container element
 */
export const HxActions =
	forwardRef(<T extends object>(props: HxActionsProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model,
			color = HxActionsDefaults.color, various = HxActionsDefaults.various,
			leading, tailing,
			zIndex, gapToEdge = HxSelectDefaults.gapToEdge,
			...rest
		} = props;

		// Get reactive visibility and disabled state from data monitor
		const {visible, disabled} = useDataMonitor(props);

		// Configure popup provider props
		// sameWidthAtMinimum: ensures popup is at least as wide as the trigger
		const providerProps: Omit<HxPopupProviderProps, 'trigger' | 'data' | 'children'> = {
			zIndex, gapToEdge, sameWidthAtMinimum: true
		};

		// Props passed to leading trigger content component
		const leadingProps: HxActionsLeadingProps<T> = {
			$model,
			color, various,
			leading,
			visible, disabled,
			...rest
		};

		// Props passed to tailing popup content component
		const tailingProps: Omit<HxActionsTailingProps<T>, 'visible'> = {$model, color, tailing};

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
