import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type KeyboardEventHandler,
	type MouseEventHandler,
	type ReactElement,
	type RefAttributes,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {AnyUtils, DOMUtils, HxDataPropToAttrValueComputer} from '../../utils';
import {HxLabel} from '../label';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxRadioDefaults} from './defaults';
import type {HxRadioProps, HxRadioValuePair} from './types';

/**
 * Check if the current value matches the checked state based on value pair configuration
 * @param value - Current model value
 * @param values - Value pair configuration
 * @returns True if the value should be considered checked
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isChecked = (value: any, values: HxRadioValuePair): boolean => {
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

export type HxRadioType = <T extends object>(
	props: HxRadioProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Radio form component with reactive model binding
 * Supports custom value pairs, accessible keyboard navigation, and theme integration
 * @param props - Component props
 * @param ref - Forwarded ref to the root div element
 */
export const HxRadio =
	forwardRef(<T extends object>(props: HxRadioProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			allowUnchecked = HxRadioDefaults.allowUnchecked,
			values = HxRadioDefaults.values,
			text,
			enterToSwitchValue = HxRadioDefaults.enterToSwitchValue,
			spaceToSwitchValue = HxRadioDefaults.spaceToSwitchValue,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);
		/** Ref to the interactive radio element for focus management */
		const radioRef = useRef<HTMLSpanElement | null>(null);

		const modelValue = ERO.getValue($model, $field);
		const checked = isChecked(modelValue, values);

		/**
		 * Toggle the radio state between checked and unchecked
		 * Updates the reactive model and triggers re-render
		 * @internal
		 */
		const switchValue = () => {
			if (checked) {
				if (allowUnchecked) {
					ERO.setValue($model, $field, values[1]);
					context.forceUpdate();
				}
			} else {
				ERO.setValue($model, $field, values[0]);
				context.forceUpdate();
			}
		};
		// noinspection DuplicatedCode
		const onKeyDown: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
			switch (ev.key) {
				case 'Enter': {
					if (enterToSwitchValue) {
						switchValue();
						ev.preventDefault();
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
		 * Handle click event on the radio element
		 * @internal
		 */
		const onRadioClick: MouseEventHandler<HTMLSpanElement> = () => {
			if (disabled) {
				return;
			}
			switchValue();
		};
		const onRadioKeyDown: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
			if (disabled) {
				return;
			}
			onKeyDown(ev);
		};
		/**
		 * Handle click event on the radio label
		 * Focuses the radio element before toggling state
		 * @internal
		 */
		const onRadioLabelClick = () => {
			if (disabled) {
				return;
			}
			radioRef.current?.focus();
			switchValue();
		};
		const onRadioLabelKeyDown: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
			if (disabled) {
				return;
			}
			radioRef.current?.focus();
			onKeyDown(ev);
		};
		/**
		 * Handle mouse enter event on the label
		 * Adds hover state to the radio element
		 * @internal
		 */
		const onRadioLabelMouseEnter = () => {
			radioRef.current?.setAttribute('data-hx-hover', '');
		};
		/**
		 * Handle mouse leave event on the label
		 * Removes hover state from the radio element
		 * @internal
		 */
		const onRadioLabelMouseLeave = () => {
			radioRef.current?.removeAttribute('data-hx-hover');
		};

		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context, {
			key: 'HxRadio', default: HxRadioDefaults, visible, disabled
		});
		const hasText = !AnyUtils.isEmpty(text, false);

		return <div {...restProps}
		            data-hx-radio=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            data-hx-radio-checked={checked ? '' : (void 0)}
		            ref={ref}>
			<span role="radio" tabIndex={disabled ? (void 0) : 0}
			      onClick={onRadioClick}
			      onKeyDown={onRadioKeyDown}
			      data-hx-radio=""
			      ref={radioRef}>
				<span data-hx-radio-curtain=""/>
			</span>
			{hasText
				? <HxLabel $model={$model}
				           text={text}
				           onClick={onRadioLabelClick}
				           onKeyDown={onRadioLabelKeyDown}
				           onMouseEnter={onRadioLabelMouseEnter}
				           onMouseLeave={onRadioLabelMouseLeave}/>
				: (void 0)}
		</div>;
	}) as unknown as HxRadioType;
// @ts-expect-error assign component name
HxRadio.displayName = 'HxRadio';

HxDataPropToAttrValueComputer.create('HxRadio').register();

export type HxWithCheckRadioType = <T extends object>(
	props: HxWithCheckProps<T, HxRadioProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;
export const HxWithCheckRadio = HxWithCheck(HxRadio, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckRadioType;
// @ts-expect-error assign component name
HxWithCheckRadio.displayName = 'HxWithCheckRadio';
