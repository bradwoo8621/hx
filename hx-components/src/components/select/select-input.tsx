import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type KeyboardEventHandler,
	type MouseEventHandler,
	type PropsWithoutRef,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import type {HxHtmlElementProps} from '../../types';
import {exposePropsToDOM, handleFocusClickOfOthers, handleScrollResizeOfAncestors} from '../../utils';
import {HxButton} from '../button';
import {CaretDown, Clear} from '../icons';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {HxSelectDefaults} from './defaults';
import {
	EvtHoverNextOption,
	EvtHoverPreviousOption,
	EvtOptionsChange,
	EvtOptionSelect,
	EvtOptionsLoad,
	EvtSelectHoverOption,
	type HxExtSelectProps,
	type HxSelectOption,
	type OmittedSelectHTMLProps
} from './types';

/**
 * Select input component props
 * @template T - Type of the form model object
 */
export type HxSelectInputProps<T extends object> = PropsWithoutRef<
	& Pick<
		HxExtSelectProps<T>,
		| '$model' | '$field'
		| 'clearable'
		| 'minPopupWidth' | 'maxPopupHeight'
		| 'enterToOpenPopup' | 'spaceToOpenPopup'
		| 'placeholder' | 'placeholderKey'
	>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedSelectHTMLProps, T>
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
			minPopupWidth = HxSelectDefaults.minPopupWidth, maxPopupHeight = HxSelectDefaults.maxPopupHeight,
			enterToOpenPopup = HxSelectDefaults.enterToOpenPopup, spaceToOpenPopup = HxSelectDefaults.spaceToOpenPopup,
			placeholder = HxSelectDefaults.placeholder, placeholderKey = HxSelectDefaults.placeholderKey,
			visible, disabled, clearable,
			onClick, onKeyDown,
			...rest
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const optionsRef = useRef({
			options: [] as Array<HxSelectOption>,
			loaded: false
		});
		const selectRef = useDualRef(ref);
		const visibleRef = useRef((() => {
			const state: {
				visible: boolean;
				install: (disabled: boolean, minPopupWidth?: number, maxPopupHeight?: number) => (() => void);
				uninstall?: (() => void),
				hide: () => void;
			} = {
				visible: false,
				install: (
					disabled: boolean, minPopupWidth?: number, maxPopupHeight?: number
				) => {
					// HxConsole.debug('Install focus/click/scroll/resize listeners for control the select popup.');
					const uninstall1 = handleFocusClickOfOthers((ev: Event) => {
						// HxConsole.debug('click or focus');
						if (!disabled && state.visible) {
							const targetEl = ev.target as HTMLElement;
							// Ignore clicks on the select input itself
							if (targetEl.closest('div[data-hx-select]') == selectRef.current) {
								return;
							}
							// Check if clicked element is inside popup, close if not
							popupContext.checkFocusElement(targetEl, (inPopup: boolean) => {
								if (!inPopup) {
									state.hide();
									popupContext.hide();
								}
							});
						}
					});
					const uninstall2 = handleScrollResizeOfAncestors(selectRef.current,
						() => {
							// HxConsole.debug('scroll or resize to relocate');
							if (!disabled && state.visible) {
								popupContext.movePosition(selectRef.current!, {
									minWidth: minPopupWidth,
									maxHeight: maxPopupHeight
								});
							}
						},
						() => {
							// HxConsole.debug('scroll or resize to hide');
							// no need to check event target, they are ancestors of select, always trigger
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
				show: (disabled: boolean, minPopupWidth?: number, maxPopupHeight?: number) => {
					state.visible = true;
					state.uninstall?.();
					state.uninstall = state.install(disabled, minPopupWidth, maxPopupHeight);
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
				visibleRef.current.hide();
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
				visibleRef.current.show(disabled, minPopupWidth, maxPopupHeight);
				popupContext.show(selectRef.current!, {minWidth: minPopupWidth, maxHeight: maxPopupHeight});
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
		/**
		 * Handle select input click: open popup if not already open
		 */
		const onSelectClick: MouseEventHandler<HTMLDivElement> = (ev) => {
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
			let shouldPreventDefault = false;
			switch (ev.key) {
				case 'Escape': {
					closePopup();
					break;
				}
				case 'Enter': {
					if (isPopupOpenable()) {
						if (enterToOpenPopup) {
							openPopup();
						}
					} else if (isPopupOpened()) {
						popupContext.emit(EvtSelectHoverOption);
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
						popupContext.emit(EvtSelectHoverOption);
					}
					break;
				}
				case 'ArrowUp': {
					if (isPopupOpenable()) {
						shouldPreventDefault = true;
						openPopup();
					} else if (isPopupOpened()) {
						shouldPreventDefault = true;
						popupContext.emit(EvtHoverPreviousOption);
					}
					break;
				}
				case 'ArrowDown': {
					if (isPopupOpenable()) {
						shouldPreventDefault = true;
						openPopup();
					} else if (isPopupOpened()) {
						shouldPreventDefault = true;
						popupContext.emit(EvtHoverNextOption);
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
		const onClearClick = () => {
			const value = ERO.getValue($model, $field);
			if (value != null) {
				ERO.setValue($model, $field, null);
				context.forceUpdate();
			}
			// TODO cannot open popup properly, don't know why yet
			// visibleRef.current.show(disabled, minPopupWidth, maxPopupHeight);
			// popupContext.show(selectRef.current!, {minWidth: minPopupWidth, maxHeight: maxPopupHeight});
		};

		// Get current value and corresponding label
		const value = ERO.getValue($model, $field);
		let selectedOption: HxSelectOption | undefined = (void 0);
		let label;
		if (optionsRef.current.loaded) {
			selectedOption = optionsRef.current.options.find(option => option.value === value);
			if (selectedOption == null) {
				if (placeholder) {
					label = placeholderKey;
				} else {
					// display nothing
					label = '';
				}
			} else {
				label = selectedOption?.label;
			}
		} else {
			// Show loading state text while options are loading
			label = HxSelectDefaults.optionsOnLoadKey;
		}
		const canClear = clearable && value != null && value !== '';

		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            tabIndex={0}
		            onClick={onSelectClick} onKeyDown={onSelectKeyDown}
		            data-hx-select=""
		            data-hx-visible={visible ?? true}
		            data-hx-disabled={disabled ?? false}
		            ref={selectRef}>
			{/** TODO didn't show with ellipsis, don't know why yet */}
			<HxLabel text={label} clickable={disabled && true}/>
			{canClear
				? <HxButton text={<Clear data-hx-select-icon="clear"/>}
				            tabIndex={-1}
				            data-hx-button-input-embed="" data-hx-button-svg-icon=""
				            data-hx-select-icon="clear"
				            color="danger" various="outline"
				            onClick={onClearClick}/>
				: (void 0)}
			<HxButton text={<CaretDown data-hx-select-icon="caret"/>}
			          tabIndex={-1}
			          data-hx-button-input-embed="" data-hx-button-svg-icon=""
			          data-hx-select-icon="caret"
			          various="outline"/>
		</div>;
	});
