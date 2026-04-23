// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {type CheckPropSuppliedOn, useCheckMonitor} from '../../hooks';
import type {CheckProps, HxComponentDataProps, HxHtmlElementProps} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {HxLabel, type OmittedLabelHTMLProps} from '../label';
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

export interface HxExtCheckMessageProps<T extends object, P extends object = object> extends HxComponentDataProps<T>, CheckProps<T> {
	/**
	 * When true, always renders the message DOM element even when there is no error.
	 * When false, only renders the message element when there is an error to display.
	 */
	alwaysKeepMessageDOM?: boolean;
	/**
	 * The props of checked, it will be supplied to $supplyOn function.
	 */
	$checkProps: P;
	/**
	 * Function that returns the field path(s) to monitor for changes.
	 * Validation will be triggered when any of these fields change.
	 */
	$supplyOn?: (props: P) => CheckPropSuppliedOn;
}

/** Props for a component wrapped with HxWithCheck HOC */
export type HxCheckMessageProps<T extends object> =
	& HxExtCheckMessageProps<T>
	& HxHtmlElementProps<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>, OmittedLabelHTMLProps, T>;

export const HxCheckMessage =
	forwardRef(<T extends object>(props: HxCheckMessageProps<T>, ref: ForwardedRef<HTMLSpanElement>) => {
		const {
			$model, $check, $checkProps, $supplyOn,
			alwaysKeepMessageDOM = HxWithCheckDefaults.alwaysKeepMessageDOM,
			...rest
		} = props;

		const context = useHxContext();
		const supplyOnRef = useRef<CheckPropSuppliedOn | undefined>(
			simplifySupplyOn($supplyOn?.($checkProps))
		);

		useEffect(() => {
			const newSupplyOn = simplifySupplyOn($supplyOn?.($checkProps));
			const shouldUpdate = shouldUpdateSupplyOn(supplyOnRef.current, newSupplyOn);
			if (shouldUpdate) {
				supplyOnRef.current = newSupplyOn;
				context.forceUpdate();
			}
		}, [$supplyOn, context, $checkProps]);

		// eslint-disable-next-line react-hooks/refs
		const {error} = useCheckMonitor({$model, $check, $supplyOn: supplyOnRef.current});

		let message: ReactNode | undefined = (void 0);
		if (alwaysKeepMessageDOM) {
			const restProps = rest != null ? exposePropsToDOM(rest, $model, context) : (void 0);

			message = <HxLabel {...restProps}  $model={$model}
			                   text={error?.message ?? ''}
			                   color={error?.level === 'error' ? 'danger' : error?.level}
			                   data-hx-label-check-msg=""
			                   ref={ref}/>;
		} else if (error?.message != null) {
			const msg = error.message;
			if (typeof msg === 'string' && msg.trim().length === 0) {
				// no message, ignore the message label
			} else {
				const restProps = rest != null ? exposePropsToDOM(rest, $model, context) : (void 0);
				message = <HxLabel {...restProps} $model={$model}
				                   text={msg}
				                   color={error?.level === 'error' ? 'danger' : error?.level}
				                   data-hx-label-check-msg=""
				                   ref={ref}/>;
			}
		} else {
			// no message, ignore the message label
		}

		return message;
	});
