// @ts-ignore
import React, {type FC, type ForwardedRef, forwardRef, type PropsWithoutRef, useEffect, useState} from 'react';
import {type CheckPropSuppliedOn, useCheckMonitor} from '../../hooks';
import type {CheckProps, ComponentDataProps} from '../../types';
import {HxLabel} from '../label';

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

export interface HxWithCheckCreateOptions<T extends object, P extends ComponentDataProps<T>> {
	$supplyOn?: (props: P) => CheckPropSuppliedOn;
}

export const HxWithCheck =
	<T extends object, P extends ComponentDataProps<T>>(C: FC<P>, options?: HxWithCheckCreateOptions<T, P>) => {
		return forwardRef(
			(props: PropsWithoutRef<P & CheckProps<T>>, ref: ForwardedRef<HTMLDivElement>) => {
				const {$model, $check, ...rest} = props;

				const [supplyOn, setSupplyOn] = useState<CheckPropSuppliedOn | undefined>(() => {
					// @ts-ignore
					return simplifySupplyOn(options?.$supplyOn?.(props));
				});
				useEffect(() => {
					// @ts-ignore
					const newSupplyOn = simplifySupplyOn(options?.$supplyOn?.(props));
					const shouldUpdate = shouldUpdateSupplyOn(supplyOn, newSupplyOn);
					if (shouldUpdate) {
						setSupplyOn(newSupplyOn);
					}
				}, [options?.$supplyOn, props]);
				const {error} = useCheckMonitor({$model, $check, $supplyOn: supplyOn});

				return <div data-hx-with-check="" ref={ref}>
					<C {...rest as any} $model={$model}/>
					<HxLabel text={error?.message ?? ''}
					         color={error?.level === 'error' ? 'danger' : error?.level}
					         role="with-check-msg"/>
				</div>;
			});
	};
