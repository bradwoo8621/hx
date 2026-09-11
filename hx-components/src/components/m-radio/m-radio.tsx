import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {DOMUtils, HxDataPropToAttrValueComputer} from '../../utils';
import {HxSelectOptionsHolder, type HxSelectOptionsProps, HxSelectOptionsProvider} from '../select-options';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxMRadioDefaults} from './defaults';
import {HxMRadioOptions} from './m-radio-options';
import type {HxMRadioProps} from './types';

/**
 * Component type definition for HxMRadio
 */
export type HxMRadioType = <T extends object>(
	props: HxMRadioProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Multi-option radio group component with dynamic options support
 * Provides flexible layout, keyboard navigation, and integration with form validation
 * @param props - Component props
 * @param ref - Forwarded ref to root div element
 */
export const HxMRadio =
	forwardRef(<T extends object>(props: HxMRadioProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			options, optionsDependsOn, onOptionsChange = HxMRadioDefaults.onOptionsChange,
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
			key: 'HxMRadio', default: HxMRadioDefaults, visible, disabled
		});
		// lanes should be ignored when direction is vertical
		// @ts-expect-error ignore type check
		if (restProps['data-hx-m-radio-direction'] === 'dir-y') {
			// @ts-expect-error ignore type check
			delete restProps['data-hx-m-radio-lanes'];
		}

		return <HxSelectOptionsProvider>
			<div {...restProps}
			     data-hx-m-radio=""
			     data-hx-model-path={ERO.loosePathOf($model, $field)}
			     ref={ref}>
				{/* Render radio options with interaction handlers */}
				<HxMRadioOptions $model={$model} $field={$field}
				                 enterToSwitchValue={enterToSwitchValue} spaceToSwitchValue={spaceToSwitchValue}
				                 optionsOnLoadKey={optionsOnLoadKey} noOptionsKey={noOptionsKey}
				                 disabled={disabled}/>
			</div>
			{/* Hidden holder for managing dynamic options loading and change events */}
			<HxSelectOptionsHolder {...optionsHolderProps}/>
		</HxSelectOptionsProvider>;
	}) as unknown as HxMRadioType;
// @ts-expect-error assign component name
HxMRadio.displayName = 'HxMRadio';

HxDataPropToAttrValueComputer.create('HxMRadio')
	.propsAsIs({
		direction: 'data-hx-m-radio-direction',
		lanes: 'data-hx-m-radio-lanes'
	})
	.and('gapX', 'gapY')
	.register();

/**
 * Component type definition for HxWithCheckMRadio (form validation integrated version)
 */
export type HxWithCheckMRadioType = <T extends object>(
	props: HxWithCheckProps<T, HxMRadioProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * HxMRadio component integrated with form validation capabilities
 * Automatically shows validation messages and error states
 */
export const HxWithCheckMRadio = HxWithCheck(HxMRadio, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckMRadioType;
// @ts-expect-error assign component name
HxWithCheckMRadio.displayName = 'HxWithCheckMRadio';
