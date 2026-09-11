// @ts-expect-error import React
import React, {type FC, type ForwardedRef, forwardRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {HxComponentDataProps} from '../../types';
import {DOMUtils, HxDataPropToAttrValueComputer} from '../../utils';
import {HxCheckMessage} from './check-message';
import type {HxWithCheckCreateOptions, HxWithCheckProps} from './types';

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
				const {visible, disabled, readonly} = useDataMonitor(props);
				const $wrapper = {...$domCheckBox, ...DOMUtils.pickCommonPositionProps(rest)};
				const wrapperProps = DOMUtils.exposePropsToDOM($wrapper, $model, context, {
					key: 'HxWithCheck', visible, disabled, readonly
				});

				return <div {...wrapperProps} data-hx-with-check="">
					{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
					<C {...rest as any}
					   $model={$model}
					   $visible={visible} $disabled={disabled} $readonly={readonly}
					   ref={ref}/>
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

HxDataPropToAttrValueComputer.create('HxWithCheck').register();
