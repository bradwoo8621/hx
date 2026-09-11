import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {DOMUtils, HxDataPropToAttrValueComputer} from '../../utils';
import {HxSelectOptionsHolder, type HxSelectOptionsProps, HxSelectOptionsProvider} from '../select-options';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxMCheckboxDefaults} from './defaults';
import {HxMCheckboxOptions} from './m-checkbox-options';
import type {HxMCheckboxProps} from './types';

/**
 * Component type definition for HxMCheckbox
 */
export type HxMCheckboxType = <T extends object>(
	props: HxMCheckboxProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Multi-option checkbox group component with dynamic options support
 * Provides flexible layout, keyboard navigation, and integration with form validation
 * @param props - Component props
 * @param ref - Forwarded ref to root div element
 */
export const HxMCheckbox =
	forwardRef(<T extends object>(props: HxMCheckboxProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			maxChecked,
			options, optionsDependsOn, onOptionsChange = HxMCheckboxDefaults.onOptionsChange,
			enterToSwitchValue, spaceToSwitchValue,
			optionsOnLoadKey, noOptionsKey,
			...rest
		} = props;

		const context = useHxContext();
		/** Get visibility and disabled status from data monitor */
		const {visible, disabled} = useDataMonitor(props);

		/** Props passed to select options holder for managing dynamic options */
		const optionsHolderProps: HxSelectOptionsProps<T> = {$model, options, optionsDependsOn, onOptionsChange};

		/** Process and expose props to DOM with data attributes */
		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context, {
			key: 'HxMCheckbox', default: HxMCheckboxDefaults, visible, disabled
		});
		// lanes should be ignored when direction is vertical
		// @ts-expect-error ignore type check
		if (restProps['data-hx-m-checkbox-direction'] === 'dir-y') {
			// @ts-expect-error ignore type check
			delete restProps['data-hx-m-checkbox-lanes'];
		}

		return <HxSelectOptionsProvider>
			<div {...restProps}
			     data-hx-m-checkbox=""
			     data-hx-model-path={ERO.loosePathOf($model, $field)}
			     ref={ref}>
				{/* Render checkbox options with interaction handlers */}
				<HxMCheckboxOptions $model={$model} $field={$field}
				                    maxChecked={maxChecked}
				                    enterToSwitchValue={enterToSwitchValue} spaceToSwitchValue={spaceToSwitchValue}
				                    optionsOnLoadKey={optionsOnLoadKey} noOptionsKey={noOptionsKey}
				                    disabled={disabled}/>
			</div>
			{/* Hidden holder for managing dynamic options loading and change events */}
			<HxSelectOptionsHolder {...optionsHolderProps}/>
		</HxSelectOptionsProvider>;
	}) as unknown as HxMCheckboxType;
// @ts-expect-error assign component name
HxMCheckbox.displayName = 'HxMCheckbox';

HxDataPropToAttrValueComputer.create('HxMCheckbox')
	.propsAsIs({
		direction: 'data-hx-m-checkbox-direction',
		lanes: 'data-hx-m-checkbox-lanes'
	})
	.and('gapX', 'gapY')
	.register();

/**
 * Component type definition for HxWithCheckMCheckbox (form validation integrated version)
 */
export type HxWithCheckMCheckboxType = <T extends object>(
	props: HxWithCheckProps<T, HxMCheckboxProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * HxMCheckbox component integrated with form validation capabilities
 * Automatically shows validation messages and error states
 */
export const HxWithCheckMCheckbox = HxWithCheck(HxMCheckbox, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckMCheckboxType;
// @ts-expect-error assign component name
HxWithCheckMCheckbox.displayName = 'HxWithCheckMCheckbox';
