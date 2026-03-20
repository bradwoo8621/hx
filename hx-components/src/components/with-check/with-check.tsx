// @ts-expect-error React import is provided by the framework
import React, {
	type FC,
	type ForwardedRef,
	forwardRef,
	type PropsWithoutRef,
	type ReactNode,
	useEffect,
	useState
} from 'react';
import {type CheckPropSuppliedOn, useCheckMonitor} from '../../hooks';
import type {CheckProps, ComponentDataProps} from '../../types';
import {HxLabel} from '../label';
import {HxWithCheckDefaults} from './defaults';

/**
 * simplify given supplyOn:
 * - remove all null and empty string elements if given supplyOn is an array
 * - return undefined when given supplyOn is one of follows:
 *   - null,
 *   - empty string,
 *   - empty array,
 * - return array
 */
const simplifySupplyOn = (supplyOn?: CheckPropSuppliedOn): CheckPropSuppliedOn | undefined => {
	if (supplyOn == null) {
		return (void 0);
	} else if (Array.isArray(supplyOn)) {
		const filtered = supplyOn.filter(path => path != null && path.length !== 0);
		return filtered.length === 0 ? (void 0) : (filtered.length === 1 ? filtered[0] : [...new Set(filtered)]);
	} else {
		return supplyOn.length === 0 ? (void 0) : supplyOn;
	}
};

/**
 * compare the old and new values, return true if they are not same.
 * make sure each element is unique if given old and new values are array.
 *
 * @param oldValue
 * @param newValue
 */
const shouldUpdateSupplyOn = (oldValue?: CheckPropSuppliedOn, newValue?: CheckPropSuppliedOn): boolean => {
	if (oldValue == null) {
		// old: null. returns true when new is not null
		return newValue != null;
	} else if (newValue == null) {
		// old: not null. always returns true when new is null
		return true;
	} else if (typeof oldValue === 'string') {
		// old: string. returns true when new not equals old, new might be string or array
		return oldValue !== newValue;
	} else if (typeof newValue === 'string') {
		// old: array. always returns true when new is string
		return true;
	} else if (oldValue.length !== newValue.length) {
		// both are array, length not equals
		return true;
	} else {
		const oldKeys = oldValue.reduce((acc, key) => {
			acc[key] = 1;
			return acc;
		}, {} as Record<string, 1>);
		for (let index = 0, len = newValue.length; index < len; index++) {
			const v = oldKeys[newValue[index]];
			if (v == null) {
				// path exists in new, not exists in old
				return true;
			}
		}
		return false;
	}
};

/**
 * Options for creating a with-check wrapped component.
 * Provides configuration for how validation should be applied to the base component.
 */
export interface HxWithCheckCreateOptions<T extends object, P extends ComponentDataProps<T>> {
	/**
	 * Function that returns the field path(s) to monitor for changes.
	 * Validation will be triggered when any of these fields change.
	 */
	$supplyOn?: (props: P) => CheckPropSuppliedOn;
}

// @ts-expect-error Generic P type extends component props with $model field
export interface HxExtWithCheckProps<T extends object, P extends ComponentDataProps<T>> extends P, CheckProps<T> {
	/**
	 * When true, always renders the message DOM element even when there is no error.
	 * When false, only renders the message element when there is an error to display.
	 */
	alwaysKeepMessageDOM?: boolean;
}

/** Props for a component wrapped with HxWithCheck HOC */
export type HxWithCheckProps<T extends object, P extends ComponentDataProps<T>> = PropsWithoutRef<HxExtWithCheckProps<T, P>>;

/**
 * Higher-order component that adds form validation capabilities to any reactive component.
 * Wraps the base component and automatically displays validation error messages below it.
 * Supports custom validation rules and reactive updates when model values change.
 *
 * @component
 * @example
 * // Basic usage: create a validated input component
 * const HxWithCheckInput = HxWithCheck(HxInput, {
 *   $supplyOn: (props) => props.$field // Validate when the input field changes
 * });
 *
 * @example
 * // Usage in form
 * <HxWithCheckInput
 *   $model={formModel}
 *   $field="email"
 * />
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
	<T extends object, P extends ComponentDataProps<T>>(C: FC<P>, options?: HxWithCheckCreateOptions<T, P>) => {
		return forwardRef(
			(props: HxWithCheckProps<T, P>, ref: ForwardedRef<HTMLDivElement>) => {
				const {
					$model, $check,
					alwaysKeepMessageDOM = HxWithCheckDefaults.alwaysKeepMessageDOM,
					...rest
				} = props;

				const [supplyOn, setSupplyOn] = useState<CheckPropSuppliedOn | undefined>(() => {
					// @ts-expect-error Props type is compatible with the $supplyOn function signature
					return simplifySupplyOn(options?.$supplyOn?.(props));
				});
				useEffect(() => {
					// @ts-expect-error Props type is compatible with the $supplyOn function signature
					const newSupplyOn = simplifySupplyOn(options?.$supplyOn?.(props));
					const shouldUpdate = shouldUpdateSupplyOn(supplyOn, newSupplyOn);
					if (shouldUpdate) {
						setSupplyOn(newSupplyOn);
					}
				}, [options?.$supplyOn, props]);
				const {error} = useCheckMonitor({$model, $check, $supplyOn: supplyOn});
				let message: ReactNode | undefined = (void 0);
				if (alwaysKeepMessageDOM) {
					message = <HxLabel text={error?.message ?? ''}
					                   color={error?.level === 'error' ? 'danger' : error?.level}
					                   role="with-check-msg"/>;
				} else if (error?.message != null) {
					const msg = error.message;
					if (typeof msg === 'string' && msg.trim().length === 0) {
						// no message, ignore the message label
					} else {
						message = <HxLabel text={msg}
						                   color={error?.level === 'error' ? 'danger' : error?.level}
						                   role="with-check-msg"/>;
					}
				} else {
					// no message, ignore the message label
				}

				return <div data-hx-with-check="" ref={ref}>
					<C {...rest as any} $model={$model}/>
					{message}
				</div>;
			});
	};
