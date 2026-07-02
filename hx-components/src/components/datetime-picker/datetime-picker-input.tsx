import {ERO} from '@hx/data';
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
import type {HxHtmlElementProps, HxObject, HxParsedDateTimeFormat} from '../../types';
import {DateUtils, DOMUtils} from '../../utils';
import {HxButton} from '../button';
import {Calendar, Clear} from '../icons';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {DateTimePickerSelection} from './types';
import {
	EvtHxDateTimePicker_ClosePanel,
	EvtHxDateTimePicker_DateSelect,
	EvtHxDateTimePicker_GetTrigger,
	EvtHxDateTimePicker_TimeChange
} from './types';

/**
 * DateTime picker input component props
 * @template T - Type of the form model object
 */
export type HxDateTimePickerInputProps<T extends object> = {
	$model: HxObject<T>;
	$field: string;
	/** Format for converting display string ↔ model value */
	valueFormat: Readonly<HxParsedDateTimeFormat>;
	/** Format for rendering the display string */
	displayFormat: Readonly<HxParsedDateTimeFormat>;
	/** Whether the input is visible */
	visible: boolean;
	/** Whether the input is disabled */
	disabled: boolean;
	/** Whether to open popup when Enter key is pressed */
	enterToOpenPopup?: boolean;
	/** Whether to open popup when Space key is pressed */
	spaceToOpenPopup?: boolean;
	/** Whether the value is clearable */
	clearable?: boolean;
	/** Whether to show placeholder text when no value is selected */
	placeholder?: boolean;
	/** i18n translation key or React node for placeholder text */
	placeholderKey?: React.ReactNode;
	/** Custom calendar icon */
	calendarIcon?: React.ReactNode;
	/** Z-index for the popup layer */
	zIndex?: number;
	/** Minimum gap between popup edge and viewport boundary */
	gapToEdge?: number;
	/** Minimum width for the popup */
	minPopupWidth?: number;
	/** Maximum height for the popup */
	maxPopupHeight?: number;
} & Omit<HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, 'children', T>, 'color'>;

/**
 * DateTime picker input component — renders the trigger element that opens the panel popup.
 * @template T - Type of the form model object
 */
export const HxDateTimePickerInput =
	forwardRef(<T extends object>(props: HxDateTimePickerInputProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			valueFormat, displayFormat,
			visible, disabled, clearable,
			enterToOpenPopup = false, spaceToOpenPopup = true,
			placeholder = true, placeholderKey,
			calendarIcon,
			zIndex, gapToEdge, minPopupWidth, maxPopupHeight,
			onClick, onKeyDown,
			...rest
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const selectRef = useDualRef(ref);
		const selectFocusRef = useRef(false);
		const value = ERO.getValue($model, $field) as string | null | undefined;

		// Format model value to display text
		const formatDisplayText = (): string => {
			if (value == null || value === '') {
				return '';
			}
			const parsed = DateUtils.parseValue(value, valueFormat, {
				partialMatch: true, collectLegalTillNot: false
			});
			if (parsed === false) {
				return value;
			}
			return DateUtils.formatValue(parsed, displayFormat);
		};

		const displayText = formatDisplayText();
		const isPlaceholder = placeholder && displayText === '' && placeholderKey != null;

		// --- popup visibility management (similar to select-input) ---
		const visibleRef = useRef((() => {
			const state: {
				visible: boolean;
				install: (disabled: boolean, minPopupWidth?: number, maxPopupHeight?: number) => (() => void);
				uninstall?: () => void;
				hide: () => void;
			} = {
				visible: false,
				install: (disabled: boolean, mpw?: number, mph?: number) => {
					const uninstall1 = DOMUtils.handleFocusClickOfOthers((ev: Event) => {
						if (!disabled && state.visible) {
							const targetEl = ev.target as HTMLElement;
							if (selectRef.current?.contains(targetEl)) {
								return;
							}
							popupContext.checkFocusElement(targetEl, (inPopup: boolean) => {
								if (!inPopup) {
									selectFocusRef.current = false;
									selectRef.current?.removeAttribute('data-hx-focus');
									state.hide();
									popupContext.hide();
								}
							});
						}
					});
					const uninstall2 = DOMUtils.handleScrollResizeOfAncestors(selectRef.current,
						() => {
							if (!disabled && state.visible) {
								popupContext.relayout(selectRef.current!, {
									minWidth: mpw, maxHeight: mph
								});
							}
						},
						() => {
							state.hide();
							popupContext.hide();
						});

					return () => {
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
				show: (disabled: boolean, mpw?: number, mph?: number) => {
					state.visible = true;
					state.uninstall?.();
					state.uninstall = state.install(disabled, mpw, mph);
				},
				hide: state.hide,
				isVisible: () => state.visible,
				clean: state.uninstall as (() => void) | undefined
			} as const;
		})());

		useEffect(() => {
			return () => {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				visibleRef.current.clean?.();
			};
		}, []);

		// --- popup event listeners ---
		useEffect(() => {
			const onDateSelect = (_selection: DateTimePickerSelection) => {
				visibleRef.current.hide();
				popupContext.hide();
				selectRef.current?.removeAttribute('data-hx-focus');
				selectRef.current?.focus();
			};
			const onTimeChange = (_h: number, _m: number, _s: number) => {
				// Time change doesn't close popup — it updates live
			};
			const onClosePanel = () => {
				if (!disabled && visibleRef.current.isVisible()) {
					selectFocusRef.current = false;
					selectRef.current?.removeAttribute('data-hx-focus');
					selectRef.current?.focus();
					visibleRef.current.hide();
					popupContext.hide();
				}
			};
			const onGetTrigger = (callback: (el?: HTMLElement) => void) => {
				callback(selectRef.current as HTMLElement | undefined);
			};

			popupContext.on(EvtHxDateTimePicker_DateSelect, onDateSelect);
			popupContext.on(EvtHxDateTimePicker_TimeChange, onTimeChange);
			popupContext.on(EvtHxDateTimePicker_ClosePanel, onClosePanel);
			popupContext.on(EvtHxDateTimePicker_GetTrigger, onGetTrigger);
			return () => {
				popupContext.off(EvtHxDateTimePicker_DateSelect, onDateSelect);
				popupContext.off(EvtHxDateTimePicker_TimeChange, onTimeChange);
				popupContext.off(EvtHxDateTimePicker_ClosePanel, onClosePanel);
				popupContext.off(EvtHxDateTimePicker_GetTrigger, onGetTrigger);
			};
		}, [$model, $field, popupContext, selectRef, disabled]);

		// --- open/close helpers ---
		const isPopupOpenable = (): boolean => !disabled && !visibleRef.current.isVisible();
		const isPopupOpened = (): boolean => !disabled && visibleRef.current.isVisible();

		const openPopup = () => {
			if (isPopupOpenable()) {
				visibleRef.current.show(disabled, minPopupWidth, maxPopupHeight);
				popupContext.show(selectRef.current!, {minWidth: minPopupWidth, maxHeight: maxPopupHeight});
			}
		};
		const closePopup = () => {
			if (isPopupOpened()) {
				visibleRef.current.hide();
				popupContext.hide();
			}
		};

		const clearValue = () => {
			const v = ERO.getValue($model, $field);
			if (v != null && v !== '') {
				ERO.setValue($model, $field, null);
				if (isPopupOpened()) {
					closePopup();
				}
				context.forceUpdate();
			}
		};

		// --- event handlers ---
		const onSelectClick: MouseEventHandler<HTMLDivElement> = (ev) => {
			openPopup();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onClick?.(ev as any, $model, context);
		};

		const onSelectKeyDown: KeyboardEventHandler<HTMLDivElement> = (ev) => {
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
					if (isPopupOpenable() && enterToOpenPopup) {
						openPopup();
					}
					break;
				}
				case ' ': {
					if (isPopupOpenable() && spaceToOpenPopup) {
						shouldPreventDefault = true;
						openPopup();
					}
					break;
				}
				case 'ArrowDown':
				case 'ArrowUp': {
					if (isPopupOpenable()) {
						shouldPreventDefault = true;
						openPopup();
					}
					break;
				}
				case 'Delete':
				case 'Backspace': {
					if (clearable && value != null && value !== '') {
						clearValue();
					}
					break;
				}
				default:
					break;
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onKeyDown?.(ev as any, $model, context);
			if (shouldPreventDefault) {
				ev.preventDefault();
			}
		};

		const onClearClick: MouseEventHandler<HTMLButtonElement> = (ev) => {
			clearValue();
			ev.stopPropagation();
		};

		const canClear = !disabled && clearable && value != null && value !== '';
		const restProps = DOMUtils.exposePropsToDOM(
			rest as HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, 'children', T>,
			$model, context
		);

		return <div {...restProps}
		            tabIndex={disabled ? (void 0) : 0}
		            onClick={onSelectClick} onKeyDown={onSelectKeyDown}
		            data-hx-datetime-picker=""
		            data-hx-model-path={ERO.pathOf($model, $field)}
		            data-hx-visible={(visible ?? true) ? '' : 'no'}
		            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		            data-hx-focus={selectFocusRef.current ? '' : (void 0)}
		            ref={selectRef}>
			{isPlaceholder
				? <HxLabel $model={$model} text={placeholderKey}
				           data-hx-label-input-embed=""
				           data-hx-label-input-placeholder=""/>
				: <HxLabel $model={$model}
				           text={displayText}
				           data-hx-label-input-embed=""/>}
			{canClear
				? <HxButton text={<Clear/>}
				            tabIndex={-1}
				            data-hx-button-input-embed="" data-hx-button-svg-icon=""
				            data-hx-datetime-picker-icon="clear"
				            color="danger" variant="outline"
				            onClick={onClearClick}/>
				: (void 0)}
			<HxButton text={calendarIcon ?? <Calendar/>}
			          $disabled={disabled}
			          tabIndex={-1}
			          data-hx-button-input-embed="" data-hx-button-svg-icon=""
			          data-hx-datetime-picker-icon="calendar"
			          variant="outline"/>
		</div>;
	});
HxDateTimePickerInput.displayName = 'HxDateTimePickerInput';
