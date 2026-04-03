// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {type CheckPropSuppliedOn, useDataMonitor} from '../../hooks';
import {HxPopupProvider, type HxPopupProviderProps} from '../popup';
import {HxWithCheck, type HxWithCheckCreateOptions, type HxWithCheckProps} from '../with-check';
import {HxSelectDefaults} from './defaults';
import {HxSelectInput, type HxSelectInputProps} from './select-input';
import {HxSelectOptionsHolder, type HxSelectOptionsProps} from './select-options-holder';
import {HxSelectPopup, type HxSelectPopupProps} from './select-popup';
import type {HxSelectProps, HxSelectType} from './types';

/**
 * Select dropdown component for single selection from a list of options
 * Features:
 * - Supports static, sync, and async option sources
 * - Automatic positioning with viewport boundary detection
 * - Keyboard navigation support
 * - Click/focus outside handling
 * - Form model binding support
 *
 * @template T - Type of the form model object
 * @param props - Component props
 * @param ref - Ref to the underlying input element
 */
export const HxSelect =
	forwardRef(<T extends object>(props: HxSelectProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			options, optionsDependsOn,
			clearable, filter, sort,
			placeholder, placeholderKey,
			showSelectedOnPopupOpen,
			minPopupWidth, maxPopupHeight,
			zIndex, gapToEdge = HxSelectDefaults.gapToEdge, sameWidthAtMinimum = HxSelectDefaults.sameWidthAtMinimum,
			enterToOpenPopup, spaceToOpenPopup,
			...rest
		} = props;

		// Monitor reactive visibility and disabled state from model
		const {visible, disabled} = useDataMonitor(props);

		// for control the props precisely
		const providerProps: Omit<HxPopupProviderProps, 'trigger' | 'data' | 'children'> = {
			zIndex, gapToEdge, sameWidthAtMinimum: sameWidthAtMinimum!
		};
		const inputProps: HxSelectInputProps<T> = {
			$model, $field,
			visible, disabled,
			clearable,
			minPopupWidth, maxPopupHeight,
			enterToOpenPopup, spaceToOpenPopup,
			placeholder, placeholderKey,
			...rest
		};
		const optionsHolderProps: HxSelectOptionsProps<T> = {$model, $field, options, optionsDependsOn};
		const popupProps: Omit<HxSelectPopupProps<T>, 'visible'> = {
			$model, $field,
			showSelectedOnPopupOpen,
			sort, filter
		};

		return <HxPopupProvider
			{...providerProps}
			// @ts-expect-error ignore the generic type check
			trigger={<HxSelectInput {...inputProps} ref={ref}/>}
			// Data holder preloads options even when popup is closed
			data={<HxSelectOptionsHolder {...optionsHolderProps}/>}>
			{/* @ts-expect-error "visible" is provided by popup provider, ignore check here */}
			<HxSelectPopup {...popupProps}/>
		</HxPopupProvider>;
	}) as unknown as HxSelectType;
// @ts-expect-error assign component name
HxSelect.displayName = 'HxSelect';

/**
 * Configuration for HxWithCheck wrapper that adds validation support
 */
const HxWithCheckSelectOptions: HxWithCheckCreateOptions<object, HxSelectProps<object>> = {
	$supplyOn: (props: HxSelectProps<object>): CheckPropSuppliedOn => {
		return props.$field;
	}
};

/**
 * Select component with built-in form validation support
 * @template T - Type of the form model object
 */
export type HxWithCheckSelectType = <T extends object>(
	props: HxWithCheckProps<T, HxSelectProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Select component wrapped with validation capabilities
 */
export const HxWithCheckSelect = HxWithCheck(HxSelect, HxWithCheckSelectOptions) as unknown as HxWithCheckSelectType;
// @ts-expect-error assign component name
HxWithCheckSelect.displayName = 'HxWithCheckSelect';
