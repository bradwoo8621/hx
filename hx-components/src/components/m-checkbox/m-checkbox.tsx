import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type HTMLAttributes, type ReactElement, type RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {
	HxDirection,
	HxEditSingleFieldProps,
	HxGap,
	HxHtmlElementProps,
	HxOmittedAttributes,
	WithRequired
} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {HxSelectOptionsHolder, type HxSelectOptionsProps, HxSelectOptionsProvider} from '../select-options';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxMCheckboxDefaults} from './defaults';
import {HxMCheckboxOptions} from './m-checkbox-options';

/**
 * Layout direction type for checkbox options
 */
export type HxMCheckboxDirection = HxDirection;
/**
 * Number of lanes (columns/rows) for multi-line checkbox layout
 */
export type HxMCheckboxLanes = number;
/**
 * Horizontal gap size between checkbox options
 */
export type HxMCheckboxGapX = HxGap;
/**
 * Vertical gap size between checkbox options
 */
export type HxMCheckboxGapY = HxGap;

/**
 * Extended props for HxMCheckbox component
 */
export interface HxExtMCheckboxProps<T extends object>
	extends WithRequired<HxSelectOptionsProps<T>, '$model'>, HxEditSingleFieldProps<T> {
	maxChecked?: number;
	/** Layout direction of checkbox options: horizontal (dir-x) or vertical (dir-y) */
	direction?: HxMCheckboxDirection;
	/** Number of columns when direction is horizontal, rows when direction is vertical */
	lanes?: HxMCheckboxLanes;
	/** Horizontal gap size between checkbox options */
	gapX?: HxMCheckboxGapX;
	/** Vertical gap size between checkbox options */
	gapY?: HxMCheckboxGapY;
	/** Whether to allow Enter key to switch checkbox value */
	enterToSwitchValue?: boolean;
	/** Whether to allow Space key to switch checkbox value */
	spaceToSwitchValue?: boolean;
	/** Custom i18n key for loading state text */
	optionsOnLoadKey?: string;
	/** Custom i18n key for empty options state text */
	noOptionsKey?: string;
}

/**
 * HTML attributes that are omitted from root div element
 */
export type OmittedMCheckboxHTMLProps =
	| HxOmittedAttributes
	| 'children';

/**
 * Complete props interface for HxMCheckbox component
 */
export type HxMCheckboxProps<T extends object> =
	& HxExtMCheckboxProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedMCheckboxHTMLProps, T>;

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
			direction = HxMCheckboxDefaults.direction, lanes, gapX, gapY,
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
		const restProps = exposePropsToDOM(rest, $model, context);

		return <HxSelectOptionsProvider>
			<div {...restProps}
			     data-hx-m-checkbox=""
			     data-hx-model-path={ERO.loosePathOf($model, $field)}
			     data-hx-m-checkbox-direction={direction} data-hx-m-checkbox-lanes={lanes}
			     data-hx-cell-gap-x={gapX} data-hx-cell-gap-y={gapY}
			     data-hx-visible={(visible ?? true) ? '' : 'no'}
			     data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
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
