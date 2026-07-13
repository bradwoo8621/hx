import {ERO} from '@hx/data';
import dayjs from 'dayjs';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type KeyboardEventHandler,
	type MouseEventHandler,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import type {HxDateTimeValue, HxHtmlElementProps, HxParsedDateTimeFormat} from '../../types';
import {DateUtils, DeviceCheck, DOMUtils} from '../../utils';
import {HxButton} from '../button';
import {Calendar, Clear} from '../icons';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {HxDateTimePickerDefaults} from './defaults';
import {
	EvtHxDateTimePicker_ClosePopup,
	EvtHxDateTimePicker_GetPicker,
	EvtHxDateTimePicker_ValueChange,
	EvtHxDateTimePicker_ValueClear,
	type HxDateTimePickerDisplayFormatFunc,
	type HxExtDateTimePickerProps,
	type OmittedDateTimePickerHTMLProps
} from './types';
import {parseModelValue} from './utils';

export type HxDateTimePickerInputProps<T extends object> =
	& Pick<
		HxExtDateTimePickerProps<T>,
		| '$model' | '$field'
		| 'enterToOpenPopup' | 'spaceToOpenPopup'
		| 'placeholder' | 'placeholderKey'
		| 'calendarIcon'
	>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedDateTimePickerHTMLProps, T>
	& {
	/** Whether the picker is visible */
	visible: boolean;
	/** Whether the picker is disabled */
	disabled: boolean;
	defaultValue: HxDateTimeValue;
	displayFormat: HxDateTimePickerDisplayFormatFunc;
	valueFormat: HxParsedDateTimeFormat;
	clearable: boolean;
};

export const HxDateTimePickerInput =
	forwardRef(<T extends object>(props: HxDateTimePickerInputProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			displayFormat, defaultValue, valueFormat,
			enterToOpenPopup = HxDateTimePickerDefaults.enterToOpenPopup,
			spaceToOpenPopup = HxDateTimePickerDefaults.spaceToOpenPopup,
			placeholder = HxDateTimePickerDefaults.placeholder,
			placeholderKey = HxDateTimePickerDefaults.placeholderKey,
			calendarIcon,
			visible, disabled,
			clearable,
			onClick, onKeyDown,
			...rest
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const pickerRef = useDualRef(ref);
		/** Whether the picker input is currently focused */
		const pickerFocusRef = useRef(false);
		const visibleRef = useRef((() => {
			const state: {
				visible: boolean;
				install: (disabled: boolean) => (() => void);
				uninstall?: (() => void),
				hide: () => void;
			} = {
				visible: false,
				install: (disabled: boolean) => {
					// HxConsole.debug('Install focus/click/scroll/resize listeners for control the picker popup.');
					const uninstall1 = DOMUtils.handleFocusClickOfOthers((ev: Event) => {
						// HxConsole.debug('click or focus');
						if (!disabled && state.visible) {
							const targetEl = ev.target as HTMLElement;
							// Ignore clicks on the picker input itself
							if (pickerRef.current?.contains(targetEl)) {
								return;
							}
							// Check if clicked element is inside popup, close if not
							popupContext.checkFocusElement(targetEl, (inPopup: boolean) => {
								if (!inPopup) {
									pickerFocusRef.current = false;
									pickerRef.current?.removeAttribute('data-hx-focus');
									state.hide();
									popupContext.hide();
								} else {
									pickerFocusRef.current = true;
									pickerRef.current?.setAttribute('data-hx-focus', '');
								}
							});
						}
					});
					const uninstall2 = DOMUtils.handleScrollResizeOfAncestors(pickerRef.current,
						() => {
							// HxConsole.debug('scroll or resize to relocate');
							if (!disabled && state.visible) {
								popupContext.relayout(pickerRef.current!, {});
							}
						},
						() => {
							// HxConsole.debug('scroll or resize to hide');
							// no need to check event target, they are ancestors of picker, always trigger
							state.hide();
							popupContext.hide();
						});

					return () => {
						// HxConsole.debug('Uninstall focus/click/scroll/resize listeners.');
						uninstall1();
						uninstall2();
						delete state.uninstall;
					};
				},
				uninstall: (void 0),
				hide: () => {
					state.visible = false;
					state.uninstall?.();
				}
			};
			return {
				show: (disabled: boolean) => {
					state.visible = true;
					state.uninstall?.();
					state.uninstall = state.install(disabled);
				},
				hide: state.hide,
				isVisible: () => state.visible,
				clean: state.uninstall as (() => void) | undefined
			} as const;
		})());
		const openPopupIndicatorRef = useRef<'open' | 'relayout' | undefined>();

		useEffect(() => {
			return () => {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				visibleRef.current.clean?.();
			};
		}, []);
		useEffect(() => {
			if (openPopupIndicatorRef.current === 'open' || openPopupIndicatorRef.current === 'relayout') {
				openPopupIndicatorRef.current = (void 0);
				if (!disabled && !visibleRef.current.isVisible()) {
					visibleRef.current.show(disabled);
					popupContext.show(pickerRef.current!, {});
				} else {
					popupContext.relayout(pickerRef.current!, {});
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [disabled, popupContext, pickerRef, openPopupIndicatorRef.current]);
		/**
		 * Register popup event listeners for value change
		 */
		useEffect(() => {
			/**
			 * Handle value change: update model value and close popup
			 */
			const onValueChange = (value: HxDateTimeValue) => {
				const currentValue = ERO.getValue($model, $field);
				// fill with default value
				value = DateUtils.fulfillWithDefault(value, defaultValue);
				const strValue = DateUtils.formatValue(DateUtils.toParsed(value), valueFormat);
				if (currentValue != strValue) {
					ERO.setValue($model, $field, strValue);
					context.forceUpdate();
				}
			};
			const onValueClear = () => {
				const value = ERO.getValue($model, $field);
				if (value != null) {
					ERO.setValue($model, $field, null);
					// value change will lead resize (because of the clear icon was removed, and width change)
					//  so things following happen:
					//  - 1. open popup call visibleRef.show, install resize observers (async triggered)
					//  - 2. open popup call popupContext.show, call popup forceUpdate (async),
					//  - 3. above forceUpdate make resize, trigger resize (async)
					//  - 4. #1 call relayout
					//  which really is a mess!
					//  so have to move open popup to next round, after the dom rendered
					openPopupIndicatorRef.current = 'relayout';
					context.forceUpdate();
				}
			};
			const onClosePopup = () => {
				if (!disabled && visibleRef.current.isVisible()) {
					pickerFocusRef.current = false;
					pickerRef.current?.removeAttribute('data-hx-focus');
					pickerRef.current?.focus();
					visibleRef.current.hide();
					popupContext.hide();
				}
			};
			const onGetPicker = (callback: (el?: HTMLElement) => void) => {
				callback(pickerRef.current as HTMLElement | undefined);
			};

			popupContext.on(EvtHxDateTimePicker_ValueChange, onValueChange);
			popupContext.on(EvtHxDateTimePicker_ValueClear, onValueClear);
			popupContext.on(EvtHxDateTimePicker_ClosePopup, onClosePopup);
			popupContext.on(EvtHxDateTimePicker_GetPicker, onGetPicker);
			return () => {
				popupContext.off(EvtHxDateTimePicker_ValueChange, onValueChange);
				popupContext.off(EvtHxDateTimePicker_ValueClear, onValueClear);
				popupContext.off(EvtHxDateTimePicker_ClosePopup, onClosePopup);
				popupContext.off(EvtHxDateTimePicker_GetPicker, onGetPicker);
			};
		}, [$model, $field, popupContext, context, pickerRef, disabled, valueFormat, defaultValue]);

		/**
		 * Check if popup can be opened (not disabled and not already open)
		 * @returns True if popup can be opened, false otherwise
		 */
		const isPopupOpenable = (): boolean => {
			return !disabled && !visibleRef.current.isVisible();
		};
		/**
		 * Check if popup is currently open
		 * @returns True if popup is open, false otherwise
		 */
		const isPopupOpened = (): boolean => {
			return !disabled && visibleRef.current.isVisible();
		};
		/**
		 * Open the popup dropdown if it can be opened
		 */
		const openPopup = () => {
			if (isPopupOpenable()) {
				visibleRef.current.show(disabled);
				popupContext.show(pickerRef.current!, {});
			}
		};
		/**
		 * Close the popup dropdown if it is open
		 */
		const closePopup = () => {
			if (isPopupOpened()) {
				visibleRef.current.hide();
				popupContext.hide();
			}
		};
		const clearValue = () => {
			const value = ERO.getValue($model, $field);
			if (value != null) {
				ERO.setValue($model, $field, null);
				// value change will lead resize (because of the clear icon was removed, and width change)
				//  so things following happen:
				//  - 1. open popup call visibleRef.show, install resize observers (async triggered)
				//  - 2. open popup call popupContext.show, call popup forceUpdate (async),
				//  - 3. above forceUpdate make resize, trigger resize (async)
				//  - 4. #1 call relayout
				//  which really is a mess!
				//  so have to move open popup to next round, after the dom rendered
				if (isPopupOpened()) {
					openPopupIndicatorRef.current = 'relayout';
				} else {
					openPopupIndicatorRef.current = 'open';
				}
				context.forceUpdate();
			}
		};
		/**
		 * Handle picker input click: open popup if not already open
		 */
		const onPickerClick: MouseEventHandler<HTMLDivElement> = (ev) => {
			openPopup();
			onClick?.(ev, $model, context);
		};
		/**
		 * Handle keyboard navigation for picker component
		 * Supports standard picker keyboard interactions:
		 * - ESC: Close popup
		 * - Enter/Space: Open popup
		 * - Arrow Up/Down: Open popup
		 * @param ev Keyboard event object
		 */
		const onPickerKeydown: KeyboardEventHandler<HTMLDivElement> = (ev) => {
			let shouldPreventDefault = false;
			switch (ev.key) {
				case 'Escape': {
					if (isPopupOpened()) {
						shouldPreventDefault = true;
						closePopup();
					}
					break;
				}
				case 'Enter': {
					if (isPopupOpenable()) {
						if (enterToOpenPopup) {
							openPopup();
						}
					}
					break;
				}
				case ' ': {
					if (isPopupOpenable()) {
						if (spaceToOpenPopup) {
							shouldPreventDefault = true;
							openPopup();
						}
					}
					break;
				}
				case 'Delete': {
					if (clearable && value != null && value !== '') {
						clearValue();
					}
					break;
				}
				case 'Backspace': {
					if (DeviceCheck.checkMac()) {
						if (clearable && value != null && value !== '') {
							clearValue();
						}
					}
					break;
				}
				case 'ArrowUp': {
					if (isPopupOpenable()) {
						shouldPreventDefault = true;
						openPopup();
					}
					break;
				}
				case 'ArrowDown': {
					if (isPopupOpenable()) {
						shouldPreventDefault = true;
						openPopup();
					}
					break;
				}
				default: {
					// do nothing
					break;
				}
			}
			onKeyDown?.(ev, $model, context);
			if (shouldPreventDefault) {
				ev.preventDefault();
			}
		};
		const onClearClick: MouseEventHandler<HTMLButtonElement> = (ev) => {
			clearValue();
			// to avoid the click event notify the listeners installed in above
			// in that case, the clear button is already disappeared, but dom still in memory (event.target)
			// so listener will find that the event target is not child of picker dom,
			// and of course it is not child of popup dom,
			// therefore a hide command will be sent, which is not expected
			// so simply stop propagation this event
			ev.stopPropagation();
		};

		// Get current value and corresponding label
		const value = ERO.getValue($model, $field);
		let isPlaceholder = false;
		let label;
		if (value == null || value === '') {
			if (placeholder) {
				isPlaceholder = true;
				label = placeholderKey;
			} else {
				// display nothing
				label = '';
			}
		} else {
			const parsed = parseModelValue(value, valueFormat);
			if (parsed === false) {
				if (placeholder) {
					isPlaceholder = true;
					label = placeholderKey;
				} else {
					// display nothing
					label = '';
				}
			} else {
				const value = DateUtils.fulfillWithDefault(DateUtils.fromParsed(parsed), defaultValue);
				const v = dayjs()
					.year(value.year).month(value.month - 1).date(value.day)
					.hour(value.hour).minute(value.minute).second(value.second);
				label = displayFormat(v, context);
			}
		}
		const canClear = !disabled && clearable && value != null && value !== '';

		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            tabIndex={disabled ? (void 0) : 0}
		            onClick={onPickerClick} onKeyDown={onPickerKeydown}
		            data-hx-dtp=""
		            data-hx-model-path={ERO.pathOf($model, $field)}
		            data-hx-visible={(visible ?? true) ? '' : 'no'}
		            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		            ref={pickerRef}>
			<HxLabel $model={$model} text={label} clickable={disabled && true}
			         data-hx-label-input-embed=""
			         data-hx-label-input-placeholder={isPlaceholder ? '' : (void 0)}/>
			{canClear
				? <HxButton text={<Clear/>}
				            tabIndex={-1}
				            data-hx-button-input-embed="" data-hx-button-svg-icon=""
				            data-hx-dtp-icon="clear"
				            color="danger" variant="outline"
				            onClick={onClearClick}/>
				: (void 0)}
			<HxButton text={calendarIcon ?? <Calendar/>}
			          $disabled={disabled}
			          tabIndex={-1}
			          data-hx-button-input-embed="" data-hx-button-svg-icon=""
			          data-hx-dtp-icon="calendar"
			          variant="outline"/>
		</div>;
	});
HxDateTimePickerInput.displayName = 'HxDateTimePickerInput';
