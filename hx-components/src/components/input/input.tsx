import {type ReactElement, type RefAttributes} from 'react';
import {type HxExtInputBoxProps, HxInputBox} from '../input-box';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxInputInner} from './inner';
import type {HxInputInnerProps} from './types';

export type HxInputProps<T extends object> = HxExtInputBoxProps<T, HxInputInnerProps<T>>;

export type HxInputType = <T extends object>(
	props: HxInputProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

export const HxInput = HxInputBox(HxInputInner) as unknown as HxInputType;
// @ts-expect-error assign component name
HxInput.displayName = 'HxInput';

/**
 * Input component with built-in validation support.
 * Combines HxInput functionality with HxWithCheck validation capabilities.
 *
 * @example
 * ```tsx
 * <HxWithCheckInput
 *   $model={formModel}
 *   $field="email"
 *   $check={...}
 * />
 * ```
 */
export type HxWithCheckInputType = <T extends object>(
	props: HxWithCheckProps<T, HxInputProps<T>> & RefAttributes<HTMLInputElement>
) => ReactElement | null;
/**
 * Input component with built-in form validation features.
 * Supports all HxInput props plus additional validation rules from HxWithCheck.
 */
export const HxWithCheckInput = HxWithCheck(HxInput, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckInputType;
// @ts-expect-error assign component name
HxWithCheckInput.displayName = 'HxWithCheckInput';
