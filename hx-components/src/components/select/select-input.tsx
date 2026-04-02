import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type KeyboardEventHandler,
	type MouseEventHandler,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import {
	exposePropsToDOM,
	handleFocusClickOfOthers,
	handleIntersection,
	handleScrollResizeOfAncestors
} from '../../utils';
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
	type HxSelectOption,
	type HxSelectProps
} from './types';

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
			minPopupWidth = HxSelectDefaults.minPopupWidth, maxPopupHeight = HxSelectDefaults.maxPopupHeight,
			enterToOpenPopup = HxSelectDefaults.enterToOpenPopup, spaceToOpenPopup = HxSelectDefaults.spaceToOpenPopup,
			placeholder = HxSelectDefaults.placeholder, placeholderKey = HxSelectDefaults.placeholderKey,
			visible, disabled,
			onClick, onKeyDown,
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
			const uninstall1 = handleFocusClickOfOthers((ev: Event) => {
				if (!disabled && popupVisibleRef.current) {
					const targetEl = ev.target as HTMLElement;
					// Ignore clicks on the select input itself
					if (targetEl.closest('div[data-hx-select]') == selectRef.current) {
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
			});
			const uninstall2 = handleScrollResizeOfAncestors(selectRef.current, () => {
				if (!disabled && popupVisibleRef.current) {
					popupContext.checkPosition(selectRef.current!, {
						minWidth: minPopupWidth,
						maxHeight: maxPopupHeight
					});
				}
			});
			const uninstall3 = handleIntersection(selectRef.current, () => {
				if (!disabled && popupVisibleRef.current) {
					popupVisibleRef.current = false;
					popupContext.hide();
				}
			});

			return () => {
				uninstall1();
				uninstall2();
				uninstall3();
			};
			// eslint-disable-next-line react-hooks/refs,react-hooks/exhaustive-deps
		}, [disabled, minPopupWidth, maxPopupHeight, popupContext, selectRef.current]);

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
		 * Check if popup can be opened (not disabled and not already open)
		 * @returns True if popup can be opened, false otherwise
		 */
		const isPopupOpenable = (): boolean => {
			return !disabled && !popupVisibleRef.current;
		};
		/**
		 * Check if popup is currently open
		 * @returns True if popup is open, false otherwise
		 */
		const isPopupOpened = (): boolean => {
			return !disabled && popupVisibleRef.current;
		};
		/**
		 * Open the popup dropdown if it can be opened
		 */
		const openPopup = () => {
			if (isPopupOpenable()) {
				popupVisibleRef.current = true;
				popupContext.show(selectRef.current!, {minWidth: minPopupWidth, maxHeight: maxPopupHeight});
			}
		};
		/**
		 * Close the popup dropdown if it is open
		 */
		const closePopup = () => {
			if (isPopupOpened()) {
				popupVisibleRef.current = false;
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

		// Get current value and corresponding label
		const value = ERO.getValue($model, $field);
		let selectedOption: HxSelectOption | undefined = (void 0);
		let label;
		// eslint-disable-next-line react-hooks/refs
		if (optionsRef.current.loaded) {
			// eslint-disable-next-line react-hooks/refs
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

		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            tabIndex={0}
		            onClick={onSelectClick} onKeyDown={onSelectKeyDown}
		            data-hx-select=""
		            data-hx-visible={visible ?? true}
		            data-hx-disabled={disabled ?? false}
		            ref={selectRef}>
			<HxLabel text={label} clickable={disabled && true}/>
		</div>;
	});
