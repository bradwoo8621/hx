// @ts-expect-error import React
import React, {type FC, type ForwardedRef, forwardRef, type HTMLAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {type CheckPropSuppliedOn} from '../../hooks';
import type {CheckProps, HxComponentDataProps, HxHtmlElementProps, HxOmittedAttributes} from '../../types';
import {DOMUtils} from '../../utils';
import type {OmittedLabelHTMLProps} from '../label';
import {HxCheckMessage} from './check-message';

/**
 * Options for creating a with-check wrapped component.
 * Provides configuration for how validation should be applied to the base component.
 */
export interface HxWithCheckCreateOptions<T extends object, P extends HxComponentDataProps<T>> {
	/**
	 * Function that returns the field path(s) to monitor for changes.
	 * Validation will be triggered when any of these fields change.
	 */
	$supplyOn?: (props: P) => CheckPropSuppliedOn;
}

// @ts-expect-error Generic P type extends component props with $model field
export interface HxExtWithCheckProps<T extends object, P extends HxComponentDataProps<T>> extends P, CheckProps<T> {
	/**
	 * When true, always renders the message DOM element even when there is no error.
	 * When false, only renders the message element when there is an error to display.
	 */
	alwaysKeepMessageDOM?: boolean;
	/** Additional HTML attributes to apply to the wrapper div element */
	$domCheckBox?: HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, HxOmittedAttributes, T>;
	/** Additional HTML attributes to apply to the message element */
	$domCheckMsg?: HxHtmlElementProps<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>, OmittedLabelHTMLProps, T>;
}

/** Props for a component wrapped with HxWithCheck HOC */
export type HxWithCheckProps<T extends object, P extends HxComponentDataProps<T>> = HxExtWithCheckProps<T, P>;

/**
 * Higher-order component that adds form validation capabilities to any reactive component.
 * Wraps the base component and automatically displays validation error messages below it.
 * Supports custom validation rules and reactive updates when model values change.
 *
 * @example
 * ```tsx
 * // Basic usage: create a validated input component
 * const HxWithCheckInput = HxWithCheck(HxInput, {
 *   $supplyOn: (props) => props.$field // Validate when the input field changes
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Usage in form
 * <HxWithCheckInput
 *   $model={formModel}
 *   $field="email"
 * />
 * ```
 *
 * @features
 * - Adds validation support to any component that accepts $model and $field props
 * - Automatically displays validation errors with proper styling and i18n support
 * - Supports multiple validation rules: required, pattern, minLength, maxLength, custom validators
 * - Reactive validation triggers when monitored fields change
 * - Configurable error message display behavior
 * - Compatible with all existing Hx components
 *
 * @typeParam T - Type of the reactive model object
 * @typeParam P - Props type of the base component to wrap
 * @param C - Base component to wrap with validation capabilities
 * @param options - Configuration options for validation behavior
 * @returns Wrapped component with added validation props and error message display
 *
 * @remarks
 * When creating a wrapped component, always assign a specific type to ensure proper TypeScript hints:
 * ```ts
 * export type HxWithCheckInputType = <T extends object>(
 *   props: HxInputProps<T> & CheckProps<T> & RefAttributes<HTMLInputElement>
 * ) => ReactElement | null;
 * export const HxWithCheckInput = HxWithCheck(HxInput, HxWithCheckInputOptions) as unknown as HxWithCheckInputType;
 * ```
 */
export const HxWithCheck =
	<T extends object, P extends HxComponentDataProps<T>, EL extends HTMLElement>(C: FC<P>, options?: HxWithCheckCreateOptions<T, P>) => {
		return forwardRef(
			(props: HxWithCheckProps<T, P>, ref: ForwardedRef<EL>) => {
				const {
					$model, $check, alwaysKeepMessageDOM,
					$domCheckBox, $domCheckMsg,
					...rest
				} = props;

				const context = useHxContext();

				const $wrapper = {...$domCheckBox, ...DOMUtils.pickCommonProps(rest)};
				const wrapperProps = DOMUtils.exposePropsToDOM($wrapper, $model, context);

				return <div {...wrapperProps} data-hx-with-check="">
					{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
					<C {...rest as any} $model={$model} ref={ref}/>
					<HxCheckMessage {...$domCheckMsg} $model={$model}
						// @ts-expect-error ignore the generic type check
						            $check={$check}
						            $checkProps={props}
						// @ts-expect-error ignore the generic type check
						            $supplyOn={options?.$supplyOn}
						            alwaysKeepMessageDOM={alwaysKeepMessageDOM}/>
				</div>;
			});
	};
