import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type KeyboardEventHandler,
	type MouseEventHandler,
	type ReactNode,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDualRef, usePropsToDomExpose} from '../../hooks';
import type {HxDateTimeValue, HxHtmlElementProps, HxParsedDateTimeFormat} from '../../types';
import {DateParseUtils, DateUtils, DeviceCheck, HxDataPropToAttrValueComputer} from '../../utils';
import {HxButton} from '../button';
import {Calendar, Clear} from '../icons';
import {HxLabel} from '../label';
import {usePopupVisibleRef} from '../popup';
import {HxDateTimePickerDefaults} from './defaults';
import {
	EvtHxDateTimePicker_ArrowKey,
	EvtHxDateTimePicker_ClosePopup,
	EvtHxDateTimePicker_GetPicker,
	EvtHxDateTimePicker_SelectHovered,
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
		| 'enterToOpenPopup' | 'spaceToOpenPopup' | 'popupPosition' | 'popupAlignTo'
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
			popupPosition, popupAlignTo,
			placeholder = HxDateTimePickerDefaults.placeholder,
			placeholderKey = HxDateTimePickerDefaults.placeholderKey,
			calendarIcon,
			visible, disabled,
			clearable,
			onClick, onKeyDown,
			...rest
		} = props;

		const context = useHxContext();
		const pickerRef = useDualRef(ref);
		/** Whether the picker input is currently focused */
		const pickerFocusRef = useRef(false);
		const {context: popupContext, visibleRef: popupVisibleRef} = usePopupVisibleRef({
			elementRef: pickerRef,
			beforeHideByFocusInOrClickOutPopup: (_, elementRef) => {
				pickerFocusRef.current = false;
				elementRef.current?.removeAttribute('data-hx-focus');
			},
			onFocusInOrClickInPopup: (_, elementRef) => {
				pickerFocusRef.current = true;
				elementRef.current?.setAttribute('data-hx-focus', '');
			}
		});
		const openPopupIndicatorRef = useRef<'open' | 'relayout' | undefined>();

		useEffect(() => {
			return () => {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				popupVisibleRef.current.clean();
			};
		}, [popupVisibleRef]);
		useEffect(() => {
			if (openPopupIndicatorRef.current === 'open' || openPopupIndicatorRef.current === 'relayout') {
				openPopupIndicatorRef.current = (void 0);
				if (!disabled && !popupVisibleRef.current.isVisible()) {
					popupVisibleRef.current.show(disabled, {
						position: popupPosition, alignTo: popupAlignTo
					});
				} else {
					popupContext.relayout(pickerRef.current!, {
						position: popupPosition, alignTo: popupAlignTo
					});
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [disabled, popupPosition, popupAlignTo, openPopupIndicatorRef.current]);
		/**
		 * Register popup event listeners for value change
		 */
		useEffect(() => {
			const onValueChange = (value: HxDateTimeValue) => {
				const currentValue = ERO.getValue($model, $field);
				// fill with default value
				value = DateParseUtils.fulfillWithDefault(value, defaultValue);
				const strValue = DateParseUtils.formatValue(DateParseUtils.toParsed(value), valueFormat);
				if (currentValue != strValue) {
					ERO.setValue($model, $field, strValue);
					context.forceUpdate();
				}
			};
			const onValueClear = () => {
				const value = ERO.getValue($model, $field);
				if (value != null) {
					ERO.setValue($model, $field, null);
					context.forceUpdate();
				}
			};
			const onClosePopup = () => {
				if (!disabled && popupVisibleRef.current.isVisible()) {
					pickerFocusRef.current = false;
					pickerRef.current?.removeAttribute('data-hx-focus');
					pickerRef.current?.focus();
					popupVisibleRef.current.hide();
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
		}, [$model, $field, disabled, valueFormat, defaultValue, pickerRef, popupVisibleRef, popupContext, context]);

		// noinspection DuplicatedCode
		/**
		 * Check if popup can be opened (not disabled and not already open)
		 * @returns True if popup can be opened, false otherwise
		 */
		const isPopupOpenable = (): boolean => {
			return !disabled && !popupVisibleRef.current.isVisible();
		};
		/**
		 * Check if popup is currently open
		 * @returns True if popup is open, false otherwise
		 */
		const isPopupOpened = (): boolean => {
			return !disabled && popupVisibleRef.current.isVisible();
		};
		/**
		 * Open the popup dropdown if it can be opened
		 */
		const openPopup = () => {
			if (isPopupOpenable()) {
				popupVisibleRef.current.show(disabled, {
					position: popupPosition, alignTo: popupAlignTo
				});
			}
		};
		// noinspection DuplicatedCode
		/**
		 * Close the popup dropdown if it is open
		 */
		const closePopup = () => {
			if (isPopupOpened()) {
				popupVisibleRef.current.hide();
			}
		};
		// noinspection DuplicatedCode
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
					} else if (isPopupOpened()) {
						// select the hovered (visual) grid cell, same as the select hover option
						popupContext.emit(EvtHxDateTimePicker_SelectHovered);
					}
					break;
				}
				case ' ': {
					if (isPopupOpenable()) {
						if (spaceToOpenPopup) {
							shouldPreventDefault = true;
							openPopup();
						}
					} else if (isPopupOpened()) {
						// select the hovered (visual) grid cell, same as the select hover option
						shouldPreventDefault = true;
						popupContext.emit(EvtHxDateTimePicker_SelectHovered);
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
					} else if (isPopupOpened()) {
						popupContext.emit(EvtHxDateTimePicker_ArrowKey, 'up');
					}
					break;
				}
				case 'ArrowDown': {
					if (isPopupOpenable()) {
						shouldPreventDefault = true;
						openPopup();
					} else if (isPopupOpened()) {
						popupContext.emit(EvtHxDateTimePicker_ArrowKey, 'down');
					}
					break;
				}
				case 'ArrowLeft': {
					if (isPopupOpened()) {
						popupContext.emit(EvtHxDateTimePicker_ArrowKey, 'left');
					}
					break;
				}
				case 'ArrowRight': {
					if (isPopupOpened()) {
						popupContext.emit(EvtHxDateTimePicker_ArrowKey, 'right');
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
			pickerRef.current?.focus();
		};

		// Get current value and corresponding label
		const value = ERO.getValue($model, $field);
		let isPlaceholder = false;
		let label: ReactNode;
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
				const value = DateParseUtils.fulfillWithDefault(DateParseUtils.fromParsed(parsed), defaultValue);
				label = displayFormat(DateUtils.asUtcDate(value), context);
			}
		}
		const canClear = !disabled && clearable && value != null && value !== '';

		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = usePropsToDomExpose(rest, $model, context, {
			key: 'HxDateTimePicker', default: HxDateTimePickerDefaults, visible, disabled
		});

		return <div {...restProps}
		            tabIndex={disabled ? (void 0) : 0}
		            onClick={onPickerClick} onKeyDown={onPickerKeydown}
		            data-hx-dtp=""
		            data-hx-model-path={ERO.pathOf($model, $field)}
		            ref={pickerRef}>
			<HxLabel $model={$model} text={label} clickable={disabled && true}
			         data-hx-label-input-embed=""
			         data-hx-label-input-placeholder={isPlaceholder ? '' : (void 0)}
			         data-hx-label-single-line-ellipsis=""/>
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

HxDataPropToAttrValueComputer.create('HxDateTimePicker').register();
