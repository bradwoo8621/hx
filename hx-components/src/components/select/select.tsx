// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {type CheckPropSuppliedOn, useDataMonitor} from '../../hooks';
import {HxPopupProvider} from '../popup';
import {HxWithCheck, type HxWithCheckCreateOptions, type HxWithCheckProps} from '../with-check';
import {HxSelectDefaults} from './defaults';
import {HxSelectInput} from './select-input';
import {HxSelectOptionsHolder} from './select-options-holder';
import {HxSelectPopup} from './select-popup';
import type {HxSelectProps, HxSelectType} from './types';

export const HxSelect =
	forwardRef(<T extends object>(props: HxSelectProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model,
			options,
			zIndex, gapToEdge = HxSelectDefaults.gapToEdge,
			...rest
		} = props;

		const {visible, disabled} = useDataMonitor(props);

		return <HxPopupProvider
			zIndex={zIndex} gapToEdge={gapToEdge}
			// @ts-expect-error ignore the generic type check
			trigger={<HxSelectInput {...rest}
			                        $model={$model}
			                        visible={visible} disabled={disabled}
			                        ref={ref}/>}
			data={<HxSelectOptionsHolder $model={$model} options={options}/>}>
			{/* @ts-expect-error "visible" is provided by popup provider, ignore check here */}
			<HxSelectPopup {...props}/>
		</HxPopupProvider>;
	}) as unknown as HxSelectType;
// @ts-expect-error assign component name
HxSelect.displayName = 'HxSelect';

/** select with check */
const HxWithCheckSelectOptions: HxWithCheckCreateOptions<object, HxSelectProps<object>> = {
	$supplyOn: (props: HxSelectProps<object>): CheckPropSuppliedOn => {
		return props.$field;
	}
};
export type HxWithCheckSelectType = <T extends object>(
	props: HxWithCheckProps<T, HxSelectProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;
export const HxWithCheckSelect = HxWithCheck(HxSelect, HxWithCheckSelectOptions) as unknown as HxWithCheckSelectType;
// @ts-expect-error assign component name
HxWithCheckSelect.displayName = 'HxWithCheckSelect';
