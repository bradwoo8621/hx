import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type KeyboardEventHandler,
	type MouseEventHandler,
	type ReactElement,
	type ReactNode,
	type RefAttributes,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {EditSingleFieldProps, HxHtmlElementProps, HxOmittedAttributes} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {Check} from '../icons';
import {HxLabel} from '../label';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxCheckboxDefaults} from './defaults';

/**
 * Supported value types for checkbox state
 */
export type HxCheckboxValue = string | number | boolean | null | undefined;

/**
 * Checkbox value pair configuration
 * - 2-element tuple: [checkedValue, uncheckedValue]
 * - 3-element tuple: [checkedValue, uncheckedValue, customCheckFunction]
 * The custom function returns true when the value should be considered checked
 */
export type HxCheckboxValuePair =
	| [HxCheckboxValue, HxCheckboxValue]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| [HxCheckboxValue, HxCheckboxValue, (value: any) => boolean];

/**
 * Extended props for HxCheckbox component
 */
export interface HxExtCheckboxProps<T extends object>
	extends EditSingleFieldProps<T> {
	/** Custom value pair for checked/unchecked states */
	values?: HxCheckboxValuePair;
	/** Checkbox label text content */
	text?: ReactNode;
	enterToSwitchValue?: boolean;
	spaceToSwitchValue?: boolean;
}

/**
 * HTML attributes that are omitted from the root div element
 */
export type OmittedCheckboxHTMLProps =
	| HxOmittedAttributes
	| 'children';

/**
 * Complete props interface for HxCheckbox component
 */
export type HxCheckboxProps<T extends object> =
	& HxExtCheckboxProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedCheckboxHTMLProps, T>;

/**
 * Check if the current value matches the checked state based on value pair configuration
 * @param value - Current model value
 * @param values - Value pair configuration
 * @returns True if the value should be considered checked
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isChecked = (value: any, values: HxCheckboxValuePair): boolean => {
	if (values.length === 2) {
		return value === values[0];
	} else if (value === values[0]) {
		return true;
	} else if (value === values[1]) {
		return false;
	} else {
		return values[2](value);
	}
};

export type HxCheckboxType = <T extends object>(
	props: HxCheckboxProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Checkbox form component with reactive model binding
 * Supports custom value pairs, accessible keyboard navigation, and theme integration
 * @param props - Component props
 * @param ref - Forwarded ref to the root div element
 */
export const HxCheckbox =
	forwardRef(<T extends object>(props: HxCheckboxProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model,
			$field,
			values = HxCheckboxDefaults.values,
			text,
			enterToSwitchValue = HxCheckboxDefaults.enterToSwitchValue,
			spaceToSwitchValue = HxCheckboxDefaults.spaceToSwitchValue,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);
		/** Ref to the interactive checkbox element for focus management */
		const checkboxRef = useRef<HTMLSpanElement | null>(null);

		const modelValue = ERO.getValue($model, $field);
		const checked = isChecked(modelValue, values);

		/**
		 * Toggle the checkbox state between checked and unchecked
		 * Updates the reactive model and triggers re-render
		 * @internal
		 */
		const switchValue = () => {
			if (checked) {
				ERO.setValue($model, $field, values[1]);
			} else {
				ERO.setValue($model, $field, values[0]);
			}
			context.forceUpdate();
		};
		// noinspection DuplicatedCode
		const onKeyDown: KeyboardEventHandler = (ev) => {
			switch (ev.key) {
				case 'Enter': {
					if (enterToSwitchValue) {
						switchValue();
					}
					break;
				}
				case ' ': {
					if (spaceToSwitchValue) {
						switchValue();
						ev.preventDefault();
					}
					break;
				}
			}
		};
		/**
		 * Handle click event on the checkbox element
		 * @internal
		 */
		const onCheckboxClick: MouseEventHandler<HTMLSpanElement> = () => {
			if (disabled) {
				return;
			}
			switchValue();
		};
		const onCheckboxKeyDown: KeyboardEventHandler = (ev) => {
			if (disabled) {
				return;
			}
			onKeyDown(ev);
		};
		/**
		 * Handle click event on the checkbox label
		 * Focuses the checkbox element before toggling state
		 * @internal
		 */
		const onCheckboxLabelClick = () => {
			if (disabled) {
				return;
			}
			checkboxRef.current?.focus();
			switchValue();
		};
		const onCheckboxLabelKeyDown: KeyboardEventHandler = (ev) => {
			if (disabled) {
				return;
			}
			checkboxRef.current?.focus();
			onKeyDown(ev);
		};
		/**
		 * Handle mouse enter event on the label
		 * Adds hover state to the checkbox element
		 * @internal
		 */
		const onCheckboxLabelMouseEnter = () => {
			checkboxRef.current?.setAttribute('data-hx-hover', '');
		};
		/**
		 * Handle mouse leave event on the label
		 * Removes hover state from the checkbox element
		 * @internal
		 */
		const onCheckboxLabelMouseLeave = () => {
			checkboxRef.current?.removeAttribute('data-hx-hover');
		};

		const restProps = exposePropsToDOM(rest, $model, context);
		const hasText = (typeof text === 'string' && text.length !== 0) || text != null;

		return <div {...restProps}
		            data-hx-checkbox=""
		            data-hx-checkbox-checked={checked ? '' : (void 0)}
		            data-hx-visible={(visible ?? true) ? '' : (void 0)}
		            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		            ref={ref}>
			<span tabIndex={disabled ? (void 0) : 0}
			      onClick={onCheckboxClick}
			      onKeyDown={onCheckboxKeyDown}
			      data-hx-checkbox=""
			      ref={checkboxRef}>
				<Check/>
				<span data-hx-checkbox-curtain=""/>
			</span>
			{hasText
				? <HxLabel text={text}
				           onClick={onCheckboxLabelClick}
				           onKeyDown={onCheckboxLabelKeyDown}
				           onMouseEnter={onCheckboxLabelMouseEnter}
				           onMouseLeave={onCheckboxLabelMouseLeave}/>
				: (void 0)}
		</div>;
	}) as unknown as HxCheckboxType;
// @ts-expect-error assign component name
HxCheckbox.displayName = 'HxCheckbox';

export type HxWithCheckCheckboxType = <T extends object>(
	props: HxWithCheckProps<T, HxCheckboxProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;
export const HxWithCheckCheckbox = HxWithCheck(HxCheckbox, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckCheckboxType;
// @ts-expect-error assign component name
HxWithCheckCheckbox.displayName = 'HxWithCheckCheckbox';
