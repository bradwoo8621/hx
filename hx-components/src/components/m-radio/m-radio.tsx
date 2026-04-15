// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type HTMLAttributes, type ReactElement, type RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {EditSingleFieldProps, HxDirection, HxGap, HxHtmlElementProps, HxOmittedAttributes} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {HxSelectOptionsHolder, type HxSelectOptionsProps, HxSelectOptionsProvider} from '../select-options';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxMRadioDefaults} from './defaults';
import {HxMRadioOptions} from './m-radio-options';

export type HxMRadioDirection = HxDirection;
export type HxMRadioLanes = number;
export type HxMRadioGapX = HxGap;
export type HxMRadioGapY = HxGap;

/**
 * Extended props for HxRadio component
 */
export interface HxExtMRadioProps<T extends object>
	extends Required<HxSelectOptionsProps<T>>, EditSingleFieldProps<T> {
	direction?: HxMRadioDirection;
	/** columns when direction is x-axis, rows when direction is y-axis */
	lanes?: HxMRadioLanes;
	/** Horizontal gap size between child items */
	gapX?: HxMRadioGapX;
	/** Vertical gap size between child items */
	gapY?: HxMRadioGapY;
	enterToSwitchValue?: boolean;
	spaceToSwitchValue?: boolean;
	optionsOnLoadKey?: string;
	noOptionsKey?: string;
}

export type OmittedMRadioHTMLProps =
	| HxOmittedAttributes
	| 'children';

export type HxMRadioProps<T extends object> =
	& HxExtMRadioProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedMRadioHTMLProps, T>;

export type HxMRadioType = <T extends object>(
	props: HxMRadioProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxMRadio =
	forwardRef(<T extends object>(props: HxMRadioProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			direction = HxMRadioDefaults.direction, lanes, gapX, gapY,
			options, optionsDependsOn, onOptionsChange = HxMRadioDefaults.onOptionsChange,
			enterToSwitchValue, spaceToSwitchValue,
			optionsOnLoadKey, noOptionsKey,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);

		const optionsHolderProps: HxSelectOptionsProps<T> = {$model, options, optionsDependsOn, onOptionsChange};

		const restProps = exposePropsToDOM(rest, $model, context);

		return <HxSelectOptionsProvider>
			<div {...restProps}
			     data-hx-m-radio=""
			     data-hx-m-radio-direction={direction} data-hx-m-radio-lanes={lanes}
			     data-hx-m-radio-gap-x={gapX} data-hx-m-radio-gap-y={gapY}
			     data-hx-visible={(visible ?? true) ? '' : (void 0)}
			     data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
			     ref={ref}>
				<HxMRadioOptions $model={$model} $field={$field}
				                 enterToSwitchValue={enterToSwitchValue} spaceToSwitchValue={spaceToSwitchValue}
				                 optionsOnLoadKey={optionsOnLoadKey} noOptionsKey={noOptionsKey}/>
			</div>
			<HxSelectOptionsHolder {...optionsHolderProps}/>
		</HxSelectOptionsProvider>;
	}) as unknown as HxMRadioType;
// @ts-expect-error assign component name
HxMRadio.displayName = 'HxMRadio';

export type HxWithCheckMRadioType = <T extends object>(
	props: HxWithCheckProps<T, HxMRadioProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;
export const HxWithCheckMRadio = HxWithCheck(HxMRadio, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckMRadioType;
// @ts-expect-error assign component name
HxWithCheckMRadio.displayName = 'HxWithCheckMRadio';
