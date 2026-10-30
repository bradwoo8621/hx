import {ERO} from '@hx/data';
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
import {useDualRef, usePropsToDomExpose} from '../../hooks';
import type {HxHtmlElementProps} from '../../types';
import {DeviceCheck, HxDataPropToAttrValueComputer} from '../../utils';
import {HxButton} from '../button';
import {CaretDown, Clear} from '../icons';
import {HxLabel} from '../label';
import {usePopupVisibleRef} from '../popup';
import {type HxSelectOption, useSelectOptions} from '../select-options';
import {HxSelectDefaults} from './defaults';
import {
	EvtHxSelect_ClosePopup,
	EvtHxSelect_GetFilterInput,
	EvtHxSelect_GetSelect,
	EvtHxSelect_HoverNextOption,
	EvtHxSelect_HoverPreviousOption,
	EvtHxSelect_OptionSelect,
	EvtHxSelect_SelectHoverOption,
	type HxExtSelectProps,
	type OmittedSelectHTMLProps
} from './types';

/**
 * Select input component props
 * @template T - Type of the form model object
 */
export type HxSelectInputProps<T extends object> =
	& Pick<
		HxExtSelectProps<T>,
		| '$model' | '$field'
		| 'clearable'
		| 'minPopupWidth' | 'maxPopupHeight'
		| 'enterToOpenPopup' | 'spaceToOpenPopup' | 'popupPosition' | 'popupAlignTo'
		| 'selectedLabel' | 'placeholder' | 'placeholderKey'
		| 'downIcon'
		| 'optionsOnLoadKey'
	>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedSelectHTMLProps, T>
	& {
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
			minPopupWidth = HxSelectDefaults.minPopupWidth, maxPopupHeight = HxSelectDefaults.maxPopupHeight,
			enterToOpenPopup = HxSelectDefaults.enterToOpenPopup, spaceToOpenPopup = HxSelectDefaults.spaceToOpenPopup,
			popupPosition, popupAlignTo,
			selectedLabel,
			placeholder = HxSelectDefaults.placeholder, placeholderKey = HxSelectDefaults.placeholderKey,
			downIcon,
			optionsOnLoadKey = HxSelectDefaults.optionsOnLoadKey,
			visible, disabled, clearable,
			onClick, onKeyDown,
			...rest
		} = props;

		const context = useHxContext();
		const optionsRef = useSelectOptions({$model, $field, mainOptionsHolder: true});
		const selectRef = useDualRef(ref);
		// noinspection DuplicatedCode
		/** Whether the select input is currently focused */
		const selectFocusRef = useRef(false);
		const {context: popupContext, visibleRef: popupVisibleRef} = usePopupVisibleRef({
			elementRef: selectRef,
			beforeHideByFocusInOrClickOutPopup: (_, elementRef) => {
				selectFocusRef.current = false;
				elementRef.current?.removeAttribute('data-hx-focus');
			},
			onFocusInOrClickInPopup: (_, elementRef) => {
				selectFocusRef.current = true;
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
						minWidth: minPopupWidth, maxHeight: maxPopupHeight,
						position: popupPosition, alignTo: popupAlignTo
					});
				} else {
					popupContext.relayout(selectRef.current!, {
						minWidth: minPopupWidth, maxHeight: maxPopupHeight,
						position: popupPosition, alignTo: popupAlignTo
					});
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [disabled, maxPopupHeight, minPopupWidth, popupPosition, popupAlignTo, openPopupIndicatorRef.current]);
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
				popupVisibleRef.current.hide();
				selectRef.current?.removeAttribute('data-hx-focus');
				// Return focus to select input after selection
				selectRef.current?.focus();
			};
			// noinspection DuplicatedCode
			const onClosePopup = () => {
				if (!disabled && popupVisibleRef.current.isVisible()) {
					selectFocusRef.current = false;
					selectRef.current?.removeAttribute('data-hx-focus');
					selectRef.current?.focus();
					popupVisibleRef.current.hide();
				}
			};
			const onGetSelect = (callback: (el?: HTMLElement) => void) => {
				callback(selectRef.current as HTMLElement | undefined);
			};

			popupContext.on(EvtHxSelect_OptionSelect, onOptionSelect);
			popupContext.on(EvtHxSelect_ClosePopup, onClosePopup);
			popupContext.on(EvtHxSelect_GetSelect, onGetSelect);
			return () => {
				popupContext.off(EvtHxSelect_OptionSelect, onOptionSelect);
				popupContext.off(EvtHxSelect_ClosePopup, onClosePopup);
				popupContext.off(EvtHxSelect_GetSelect, onGetSelect);
			};
		}, [$model, $field, disabled, selectRef, popupVisibleRef, popupContext, context]);

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
					minWidth: minPopupWidth, maxHeight: maxPopupHeight,
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
		const isTemporaryParalysis = (): boolean => {
			return selectRef.current?.hasAttribute('data-hx-temporary-paralysis') ?? false;
		};
		/**
		 * Handle select input click: open popup if not already open
		 */
		const onSelectClick: MouseEventHandler<HTMLDivElement> = (ev) => {
			if (isTemporaryParalysis()) {
				return;
			}
			openPopup();
			onClick?.(ev, $model, context);
		};
		/**
		 * Handle keyboard navigation for select component
		 * Supports standard select keyboard interactions:
		 * - ESC: Close popup
		 * - Enter/Space: Open popup or select hovered option
		 * - Arrow Up/Down: Open popup or navigate options
		 * @param ev Keyboard event object
		 */
		const onSelectKeyDown: KeyboardEventHandler<HTMLDivElement> = (ev) => {
			if (isTemporaryParalysis()) {
				return;
			}

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
						popupContext.emit(EvtHxSelect_SelectHoverOption);
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
						shouldPreventDefault = true;
						popupContext.emit(EvtHxSelect_SelectHoverOption);
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
						shouldPreventDefault = true;
						popupContext.emit(EvtHxSelect_HoverPreviousOption);
					}
					break;
				}
				case 'ArrowDown': {
					if (isPopupOpenable()) {
						shouldPreventDefault = true;
						openPopup();
					} else if (isPopupOpened()) {
						shouldPreventDefault = true;
						popupContext.emit(EvtHxSelect_HoverNextOption);
					}
					break;
				}
				case 'Tab': {
					if (!ev.shiftKey && isPopupOpened()) {
						popupContext.emit(EvtHxSelect_GetFilterInput, (el?: HTMLElement) => {
							shouldPreventDefault = true;
							el?.focus();
						});
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
			if (isTemporaryParalysis()) {
				return;
			}

			clearValue();
			// to avoid the click event notify the listeners installed in above
			// in that case, the clear button is already disappeared, but dom still in memory (event.target)
			// so listener will find that the event target is not child of select dom,
			// and of course it is not child of popup dom,
			// therefore a hide command will be sent, which is not expected
			// so simply stop propagation this event
			ev.stopPropagation();
			selectRef.current?.focus();
		};

		// Get current value and corresponding label
		const value = ERO.getValue($model, $field);
		let isPlaceholder = false;
		let isOnLoading = false;
		let label;
		if (optionsRef.current.loaded) {
			const selectedOption = optionsRef.current.options.find(option => option.value === value);
			if (selectedOption == null) {
				if (placeholder) {
					isPlaceholder = true;
					label = placeholderKey;
				} else {
					// display nothing
					label = '';
				}
			} else {
				label = selectedOption?.selectedLabel ?? selectedLabel?.(selectedOption) ?? selectedOption?.label;
			}
		} else {
			// Show loading state text while options are loading
			isOnLoading = true;
			label = optionsOnLoadKey;
		}
		const canClear = !disabled && clearable && value != null && value !== '';

		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = usePropsToDomExpose(rest, $model, context, {
			key: 'HxSelect', default: HxSelectDefaults, visible, disabled
		});

		return <div role="select" {...restProps}
		            tabIndex={disabled ? (void 0) : 0}
		            onClick={onSelectClick} onKeyDown={onSelectKeyDown}
		            data-hx-select=""
		            data-hx-model-path={ERO.pathOf($model, $field)}
		            ref={selectRef}>
			<HxLabel $model={$model} text={label} clickable={disabled && true}
			         data-hx-select-input-label=""
			         data-hx-label-input-embed=""
			         data-hx-label-input-placeholder={(isPlaceholder || isOnLoading) ? '' : (void 0)}
			         data-hx-label-single-line-ellipsis=""/>
			{canClear
				? <HxButton text={<Clear/>}
				            tabIndex={-1}
				            data-hx-button-input-embed="" data-hx-button-svg-icon=""
				            data-hx-select-icon="clear"
				            color="danger" variant="outline"
				            onClick={onClearClick}/>
				: (void 0)}
			<HxButton text={downIcon ?? <CaretDown/>}
			          $disabled={disabled}
			          tabIndex={-1}
			          data-hx-button-input-embed="" data-hx-button-svg-icon=""
			          data-hx-select-icon="caret-down"
			          variant="outline"/>
		</div>;
	});
HxSelectInput.displayName = 'HxSelectInput';

HxDataPropToAttrValueComputer.create('HxSelect').register();
