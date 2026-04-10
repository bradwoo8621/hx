import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type MouseEventHandler,
	type ReactNode,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {EditSingleFieldProps, HxHtmlElementProps, HxOmittedAttributes} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {Check} from '../icons';
import {HxLabel} from '../label';
import {HxCheckboxDefaults} from './defaults.ts';

export type HxCheckboxValue = string | number | boolean | null | undefined;
export type HxCheckboxValuePair =
// define the true and false value. any value not true is false.
	| [HxCheckboxValue, HxCheckboxValue]
	// define both the true and false value. any value not true and false, check it with given function
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| [HxCheckboxValue, HxCheckboxValue, (value: any) => boolean];

export interface HxExtCheckboxProps<T extends object>
	extends EditSingleFieldProps<T> {
	values?: HxCheckboxValuePair;
	/** Static checkbox text content. */
	text?: ReactNode;
}

export type OmittedCheckboxHTMLProps =
	| HxOmittedAttributes
	| 'children';

export type HxCheckboxProps<T extends object> =
	& HxExtCheckboxProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedCheckboxHTMLProps, T>;

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

export const HxCheckbox =
	forwardRef(<T extends object>(props: HxCheckboxProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			values = HxCheckboxDefaults.values, text,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);
		const checkboxRef = useRef<HTMLSpanElement | null>(null);

		const modelValue = ERO.getValue($model, $field);
		const checked = isChecked(modelValue, values);

		const switchValue = () => {
			if (checked) {
				ERO.setValue($model, $field, values[1]);
			} else {
				ERO.setValue($model, $field, values[0]);
			}
			context.forceUpdate();
		};
		const onCheckboxClick: MouseEventHandler<HTMLSpanElement> = () => {
			if (disabled) {
				return;
			}
			switchValue();
		};
		const onCheckboxLabelClick = () => {
			if (disabled) {
				return;
			}
			checkboxRef.current?.focus();
			switchValue();
		};
		const onCheckboxLabelMouseEnter = () => {
			checkboxRef.current?.setAttribute('data-hx-hover', '');
		};
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
			<span tabIndex={disabled ? (void 0) : 0} onClick={onCheckboxClick}
			      data-hx-checkbox=""
			      ref={checkboxRef}>
				<Check/>
				<span data-hx-checkbox-curtain=""/>
			</span>
			{hasText
				? <HxLabel text={text}
				           onClick={onCheckboxLabelClick}
				           onMouseEnter={onCheckboxLabelMouseEnter}
				           onMouseLeave={onCheckboxLabelMouseLeave}/>
				: (void 0)}
		</div>;
	});
HxCheckbox.displayName = 'HxCheckbox';
