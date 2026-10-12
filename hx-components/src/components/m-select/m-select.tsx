// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {useDataMonitor} from '../../hooks';
import {HxPopupProvider, type HxPopupProviderProps} from '../popup';
import {HxSelectOptionsHolder, type HxSelectOptionsProps, HxSelectOptionsProvider} from '../select-options';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxMSelectDefaults} from './defaults';
import {HxMSelectInput, type HxMSelectInputProps} from './m-select-input';
import {HxMSelectPopup, type HxMSelectPopupProps} from './m-select-popup';
import type {HxMSelectProps} from './types';

/**
 * Component type definition for HxMSelect
 */
export type HxMSelectType = <T extends object>(
	props: HxMSelectProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * MSelect component with dynamic options support
 * Provides flexible layout, keyboard navigation, and integration with form validation
 * @param props - Component props
 * @param ref - Forwarded ref to root div element
 */
export const HxMSelect =
	forwardRef(<T extends object>(props: HxMSelectProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			fromModel, toModel, compact,
			options, optionsDependsOn, onOptionsChange = HxMSelectDefaults.onOptionsChange,
			clearable, filter, filterWhenOptionExceed, filterPlaceholderKey, sort,
			selectedLabel, placeholder, placeholderKey,
			showSelectedOnPopupOpen,
			minPopupWidth, maxPopupHeight,
			zIndex, gapToEdge = HxMSelectDefaults.gapToEdge, sameWidthAtMinimum = HxMSelectDefaults.sameWidthAtMinimum,
			enterToOpenPopup, spaceToOpenPopup,
			optionsOnLoadKey, noOptionsKey,
			...rest
		} = props;

		// Monitor reactive visibility and disabled state from model
		const {visible, disabled} = useDataMonitor(props);

		// for control the props precisely
		const providerProps: Omit<HxPopupProviderProps, 'trigger' | 'steady' | 'children'> = {
			zIndex, gapToEdge, sameWidthAtMinimum
		};
		const inputProps: HxMSelectInputProps<T> = {
			$model, $field,
			visible, disabled,
			fromModel, toModel, compact,
			clearable,
			minPopupWidth, maxPopupHeight,
			enterToOpenPopup, spaceToOpenPopup,
			selectedLabel, placeholder, placeholderKey,
			optionsOnLoadKey,
			...rest
		};
		const optionsHolderProps: HxSelectOptionsProps<T> = {$model, options, optionsDependsOn, onOptionsChange};
		const popupProps: Omit<HxMSelectPopupProps<T>, 'visible'> = {
			$model, $field,
			fromModel, toModel,
			showSelectedOnPopupOpen,
			optionsOnLoadKey, noOptionsKey,
			filter, filterWhenOptionExceed, filterPlaceholderKey, sort
		};

		return <HxSelectOptionsProvider>
			<HxPopupProvider
				{...providerProps}
				data-hx-popup-for-m-select=""
				// @ts-expect-error ignore the generic type check
				trigger={<HxMSelectInput {...inputProps} ref={ref}/>}
				// Data holder preloads options even when popup is closed
				steady={<HxSelectOptionsHolder {...optionsHolderProps}/>}>
				{/* @ts-expect-error "visible" is provided by popup provider, ignore check here */}
				<HxMSelectPopup {...popupProps}/>
			</HxPopupProvider>
		</HxSelectOptionsProvider>;
	}) as unknown as HxMSelectType;
// @ts-expect-error assign component name
HxMSelect.displayName = 'HxMSelect';

/**
 * MSelect component with built-in form validation support
 * @template T - Type of the form model object
 */
export type HxWithCheckMSelectType = <T extends object>(
	props: HxWithCheckProps<T, HxMSelectProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * MSelect component wrapped with validation capabilities
 */
export const HxWithCheckMSelect = HxWithCheck(HxMSelect, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckMSelectType;
// @ts-expect-error assign component name
HxWithCheckMSelect.displayName = 'HxWithCheckMSelect';
