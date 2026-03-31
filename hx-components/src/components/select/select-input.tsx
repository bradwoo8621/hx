import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type MouseEventHandler, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import {exposePropsToDOM} from '../../utils';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {HxSelectDefaults} from './defaults';
import {EvtOptionsChange, EvtOptionSelect, EvtOptionsLoad, type HxSelectOption, type HxSelectProps} from './types';

/**
 * Select input component props
 * @template T - Type of the form model object
 */
export type HxSelectInputProps<T extends object> = Omit<
	HxSelectProps<T>,
	| 'zIndex' | 'gapToEdge' | 'options'
	| '$visible' | '$disabled'
> & {
	/** Whether the select is visible */
	visible: boolean;
	/** Whether the select is disabled */
	disabled: boolean;
};

/**
 * Select input component - renders the visible input field that triggers the popup
 * @template T - Type of the form model object
 * @param props - Component props
 * @param ref - Ref to the input element
 */
export const HxSelectInput =
	forwardRef(<T extends object>(props: HxSelectInputProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			minPopupWidth, maxPopupHeight = HxSelectDefaults.maxPopupHeight,
			visible, disabled,
			onClick,
			...rest
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const popupVisibleRef = useRef(false);
		const optionsRef = useRef({
			options: [] as Array<HxSelectOption>,
			loaded: false
		});
		const selectRef = useDualRef(ref);

		/**
		 * Handle click/focus outside events to close popup when user interacts outside
		 */
		useEffect(() => {
			const onCheck = (ev: Event) => {
				if (!disabled && popupVisibleRef.current) {
					const targetEl = ev.target as HTMLElement;
					// Ignore clicks on the select input itself
					if (targetEl.closest('div[data-hx-select]') === selectRef.current) {
						return;
					}
					// Check if clicked element is inside popup, close if not
					popupContext.checkFocusElement(targetEl, (inPopup: boolean) => {
						if (!inPopup) {
							popupVisibleRef.current = false;
							popupContext.hide();
						}
					});
				}
			};
			document.addEventListener('focus', onCheck);
			document.addEventListener('click', onCheck);

			// todo handle scroll, resize, intersection

			return () => {
				document.removeEventListener('focus', onCheck);
				document.removeEventListener('click', onCheck);
			};
		}, [disabled, popupContext, selectRef]);

		/**
		 * Register popup event listeners for option selection and options loading
		 */
		useEffect(() => {
			/**
			 * Handle option selection: update model value and close popup
			 */
			const onOptionSelect = (option: HxSelectOption) => {
				const currentValue = ERO.getValue($model, $field);
				if (currentValue != option.value) {
					ERO.setValue($model, $field, option.value);
					context.forceUpdate();
				}
				popupVisibleRef.current = false;
				popupContext.hide();
				// Return focus to select input after selection
				selectRef.current?.focus();
			};

			/**
			 * Handle options loaded/changed events: update local options cache
			 */
			const onOptionsLoadOrChange = (options: Array<HxSelectOption>) => {
				optionsRef.current = {options, loaded: true};
				context.forceUpdate();
			};

			popupContext.on(EvtOptionSelect, onOptionSelect);
			popupContext.on(EvtOptionsLoad, onOptionsLoadOrChange);
			popupContext.on(EvtOptionsChange, onOptionsLoadOrChange);
			return () => {
				popupContext.off(EvtOptionSelect, onOptionSelect);
				popupContext.off(EvtOptionsLoad, onOptionsLoadOrChange);
				popupContext.off(EvtOptionsChange, onOptionsLoadOrChange);
			};
		}, [$model, $field, popupContext, context, selectRef]);

		/**
		 * Handle select input click: open popup if not already open
		 */
		const onSelectClick: MouseEventHandler<HTMLDivElement> = (ev) => {
			if (!disabled && !popupVisibleRef.current) {
				popupVisibleRef.current = true;
				popupContext.show(selectRef.current!, {minWidth: minPopupWidth, maxHeight: maxPopupHeight});
			}
			onClick?.(ev, $model, context);
		};

		// TODO ESC, up/down arrow, whitespace, enter

		// Get current value and corresponding label
		const value = ERO.getValue($model, $field);
		let label;
		// eslint-disable-next-line react-hooks/refs
		if (optionsRef.current.loaded) {
			// eslint-disable-next-line react-hooks/refs
			label = optionsRef.current.options.find(option => option.value === value)?.label;
		} else {
			// Show loading state text while options are loading
			label = HxSelectDefaults.optionsOnLoadKey;
		}

		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            tabIndex={0}
		            onClick={onSelectClick}
		            data-hx-select=""
		            data-hx-visible={visible ?? true}
		            data-hx-disabled={disabled ?? false}
		            ref={selectRef}>
			<HxLabel text={label} clickable={disabled && true}/>
		</div>;
	});
