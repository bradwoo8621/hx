// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type HTMLAttributes, type ReactElement, type RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {
	EditSingleFieldProps,
	HxDirection,
	HxGap,
	HxHtmlElementProps,
	HxOmittedAttributes,
	WithRequired
} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {HxSelectOptionsHolder, type HxSelectOptionsProps, HxSelectOptionsProvider} from '../select-options';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxMRadioDefaults} from './defaults';
import {HxMRadioOptions} from './m-radio-options';

/**
 * Layout direction type for radio options
 */
export type HxMRadioDirection = HxDirection;
/**
 * Number of lanes (columns/rows) for multi-line radio layout
 */
export type HxMRadioLanes = number;
/**
 * Horizontal gap size between radio options
 */
export type HxMRadioGapX = HxGap;
/**
 * Vertical gap size between radio options
 */
export type HxMRadioGapY = HxGap;

/**
 * Extended props for HxMRadio component
 */
export interface HxExtMRadioProps<T extends object>
	extends WithRequired<HxSelectOptionsProps<T>, '$model'>, EditSingleFieldProps<T> {
	/** Layout direction of radio options: horizontal (dir-x) or vertical (dir-y) */
	direction?: HxMRadioDirection;
	/** Number of columns when direction is horizontal, rows when direction is vertical */
	lanes?: HxMRadioLanes;
	/** Horizontal gap size between radio options */
	gapX?: HxMRadioGapX;
	/** Vertical gap size between radio options */
	gapY?: HxMRadioGapY;
	/** Whether to allow Enter key to switch radio value */
	enterToSwitchValue?: boolean;
	/** Whether to allow Space key to switch radio value */
	spaceToSwitchValue?: boolean;
	/** Custom i18n key for loading state text */
	optionsOnLoadKey?: string;
	/** Custom i18n key for empty options state text */
	noOptionsKey?: string;
}

/**
 * HTML attributes that are omitted from root div element
 */
export type OmittedMRadioHTMLProps =
	| HxOmittedAttributes
	| 'children';

/**
 * Complete props interface for HxMRadio component
 */
export type HxMRadioProps<T extends object> =
	& HxExtMRadioProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedMRadioHTMLProps, T>;

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
			direction = HxMRadioDefaults.direction, lanes, gapX, gapY,
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
		const restProps = exposePropsToDOM(rest, $model, context);

		return <HxSelectOptionsProvider>
			<div {...restProps}
			     data-hx-m-radio=""
			     data-hx-m-radio-direction={direction} data-hx-m-radio-lanes={lanes}
			     data-hx-cell-gap-x={gapX} data-hx-cell-gap-y={gapY}
			     data-hx-visible={(visible ?? true) ? '' : (void 0)}
			     data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
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
