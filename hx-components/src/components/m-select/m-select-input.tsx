import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type KeyboardEvent,
	type KeyboardEventHandler,
	type MouseEvent,
	type MouseEventHandler,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import type {HxHtmlElementProps} from '../../types';
import {DeviceCheck, DOMUtils, HxDataPropToAttrValueComputer} from '../../utils';
import {HxButton} from '../button';
import {CaretDown, Clear} from '../icons';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {type HxSelectOption, useSelectOptions} from '../select-options';
import {HxMSelectDefaults} from './defaults';
import {
	EvtHxMSelect_ClosePopup,
	EvtHxMSelect_GetFilterInput,
	EvtHxMSelect_GetSelect,
	EvtHxMSelect_HoverNextOption,
	EvtHxMSelect_HoverPreviousOption,
	EvtHxMSelect_OptionDeselect,
	EvtHxMSelect_OptionDeselectAll,
	EvtHxMSelect_OptionSelectedChange,
	EvtHxMSelect_SelectHoverOption,
	type HxExtMSelectProps,
	type OmittedMSelectHTMLProps
} from './types';
import {createFromAndToModelFuncs} from './utils';

/**
 * Select input component props
 * @template T - Type of the form model object
 */
export type HxMSelectInputProps<T extends object> =
	& Pick<
		HxExtMSelectProps<T>,
		| '$model' | '$field'
		| 'fromModel' | 'toModel' | 'compact'
		| 'clearable'
		| 'minPopupWidth' | 'maxPopupHeight'
		| 'enterToOpenPopup' | 'spaceToOpenPopup'
		| 'selectedLabel' | 'placeholder' | 'placeholderKey'
		| 'downIcon'
		| 'optionsOnLoadKey'
	>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedMSelectHTMLProps, T>
	& {
	/** Whether the select is visible */
	visible: boolean;
	/** Whether the select is disabled */
	disabled: boolean;
};

/**
 * MSelect input component - renders the visible input field that triggers the popup
 * @template T - Type of the form model object
 * @param props - Component props
 * @param ref - Ref to the input element
 */
export const HxMSelectInput =
	forwardRef(<T extends object>(props: HxMSelectInputProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			fromModel, toModel, compact,
			minPopupWidth = HxMSelectDefaults.minPopupWidth,
			maxPopupHeight = HxMSelectDefaults.maxPopupHeight,
			enterToOpenPopup = HxMSelectDefaults.enterToOpenPopup,
			spaceToOpenPopup = HxMSelectDefaults.spaceToOpenPopup,
			selectedLabel,
			placeholder = HxMSelectDefaults.placeholder,
			placeholderKey = HxMSelectDefaults.placeholderKey,
			downIcon,
			optionsOnLoadKey = HxMSelectDefaults.optionsOnLoadKey,
			visible, disabled, clearable,
			onClick, onKeyDown,
			...rest
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const optionsRef = useSelectOptions({$model, $field, mainOptionsHolder: true});
		const selectRef = useDualRef(ref);
		const optionsContainerRef = useRef<HTMLDivElement>(null);
		// noinspection DuplicatedCode
		/** Whether the select input is currently focused */
		const selectFocusRef = useRef(false);
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
					const uninstall1 = DOMUtils.handleFocusClickOfOthers((ev: Event) => {
						// HxConsole.debug('click or focus');
						if (!disabled && state.visible) {
							const targetEl = ev.target as HTMLElement;
							// Ignore clicks on the select input itself
							if (selectRef.current?.contains(targetEl)) {
								return;
							}
							// Check if clicked element is inside popup, close if not
							popupContext.checkFocusElement(targetEl, (inPopup: boolean) => {
								if (!inPopup) {
									selectFocusRef.current = false;
									selectRef.current?.removeAttribute('data-hx-focus');
									state.hide();
									popupContext.hide();
								} else {
									selectFocusRef.current = true;
									selectRef.current?.setAttribute('data-hx-focus', '');
								}
							});
						}
					});
					const uninstall2 = DOMUtils.handleScrollResizeOfAncestors(selectRef.current,
						() => {
							// HxConsole.debug('scroll or resize to relocate');
							if (!disabled && state.visible) {
								popupContext.relayout(selectRef.current!, {
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
				clean: () => state.uninstall?.()
			} as const;
		})());
		const openPopupIndicatorRef = useRef<'open' | 'relayout' | undefined>();

		useEffect(() => {
			return () => {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				visibleRef.current.clean();
			};
		}, []);
		useEffect(() => {
			if (openPopupIndicatorRef.current === 'open' || openPopupIndicatorRef.current === 'relayout') {
				openPopupIndicatorRef.current = (void 0);
				if (!disabled && !visibleRef.current.isVisible()) {
					visibleRef.current.show(disabled, minPopupWidth, maxPopupHeight);
					popupContext.show(selectRef.current!, {minWidth: minPopupWidth, maxHeight: maxPopupHeight});
				} else {
					popupContext.relayout(selectRef.current!, {minWidth: minPopupWidth, maxHeight: maxPopupHeight});
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [disabled, maxPopupHeight, minPopupWidth, popupContext, selectRef, openPopupIndicatorRef.current]);
		/**
		 * Register popup event listeners for option selection and options loading
		 */
		useEffect(() => {
			const {getValueFromModel, setValueToModel} = createFromAndToModelFuncs({
				$model, $field, fromModel, toModel, context
			});
			/**
			 * Handle option selection: update model value and close popup
			 */
			const onOptionSelect = (option: HxSelectOption) => {
				const currentValues = getValueFromModel().array;
				if (currentValues == null || currentValues.length === 0) {
					setValueToModel([option.value]);
				} else {
					const newValues = currentValues.filter(value => {
						return value != option.value;
					});
					if (newValues.length !== currentValues.length) {
						// option deselected
						setValueToModel(newValues);
					} else {
						// option selected
						setValueToModel([...currentValues, option.value]);
					}
				}
				context.forceUpdate();
			};
			// noinspection DuplicatedCode
			const onClosePopup = () => {
				if (!disabled && visibleRef.current.isVisible()) {
					selectFocusRef.current = false;
					selectRef.current?.removeAttribute('data-hx-focus');
					selectRef.current?.focus();
					visibleRef.current.hide();
					popupContext.hide();
				}
			};
			const onGetSelect = (callback: (el?: HTMLElement) => void) => {
				callback(selectRef.current as HTMLElement | undefined);
			};

			popupContext.on(EvtHxMSelect_OptionSelectedChange, onOptionSelect);
			popupContext.on(EvtHxMSelect_ClosePopup, onClosePopup);
			popupContext.on(EvtHxMSelect_GetSelect, onGetSelect);
			return () => {
				popupContext.off(EvtHxMSelect_OptionSelectedChange, onOptionSelect);
				popupContext.off(EvtHxMSelect_ClosePopup, onClosePopup);
				popupContext.off(EvtHxMSelect_GetSelect, onGetSelect);
			};
		}, [$model, $field, fromModel, toModel, popupContext, context, selectRef, disabled]);
		useEffect(() => {
			// for compact mode
			if (!compact || optionsContainerRef.current == null) {
				return;
			}

			const container = optionsContainerRef.current;
			const {right} = container.getBoundingClientRect();
			const optionElements = container.querySelectorAll<HTMLSpanElement>(':scope > span[data-hx-m-select-input-label]:not([data-hx-m-select-input-label-more])');
			// show all options, to get the width of options container
			optionElements.forEach(el => el.style.removeProperty('--hx-display-this'));
			const shownOptionElements: Array<HTMLSpanElement> = [];
			let hiddenOptionCount = 0;
			optionElements.forEach(el => {
				const {right: elRight} = el.getBoundingClientRect();
				if (elRight > right) {
					el.style.setProperty('--hx-display-this', 'none');
					hiddenOptionCount += 1;
				} else {
					shownOptionElements.push(el);
				}
			});
			if (hiddenOptionCount !== 0) {
				const moreEl = container.querySelector<HTMLSpanElement>(':scope > span[data-hx-m-select-input-label-more]');
				// has hidden option, check the more label is shown full or not
				if (moreEl != null) {
					moreEl.innerText = `+${hiddenOptionCount}`;
					moreEl.style.removeProperty('--hx-display-this');
					while (shownOptionElements.length > 0) {
						const {right: moreElRight} = moreEl.getBoundingClientRect();
						if (moreElRight > right) {
							shownOptionElements[shownOptionElements.length - 1].style.setProperty('--hx-display-this', 'none');
							shownOptionElements.length = shownOptionElements.length - 1;
							hiddenOptionCount += 1;
							moreEl.innerText = `+${hiddenOptionCount}`;
						} else {
							break;
						}
					}
				}
			} else {
				// no hidden option, hide the more label
				container.querySelector<HTMLSpanElement>(':scope > span[data-hx-m-select-input-label-more]')
					?.style.setProperty('--hx-display-this', 'none');
			}
		});

		// noinspection DuplicatedCode
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
		// noinspection DuplicatedCode
		/**
		 * Close the popup dropdown if it is open
		 */
		const closePopup = () => {
			if (isPopupOpened()) {
				visibleRef.current.hide();
				popupContext.hide();
			}
		};
		const forceUpdateWithRelayoutOrOpenPopup = () => {
			if (isPopupOpened()) {
				openPopupIndicatorRef.current = 'relayout';
			} else {
				openPopupIndicatorRef.current = 'open';
			}
			context.forceUpdate();
		};
		const clearValue = () => {
			const {getValueFromModel, setValueToModel} = createFromAndToModelFuncs({
				$model, $field, fromModel, toModel, context
			});
			const value = getValueFromModel().array;
			if (value != null && value.length !== 0) {
				setValueToModel((void 0));
				// value change will lead resize (because of the clear icon was removed, and width change)
				//  so things following happen:
				//  - 1. open popup call visibleRef.show, install resize observers (async triggered)
				//  - 2. open popup call popupContext.show, call popup forceUpdate (async),
				//  - 3. above forceUpdate make resize, trigger resize (async)
				//  - 4. #1 call relayout
				//  which really is a mess!
				//  so have to move open popup to next round, after the dom rendered
				popupContext.emit(EvtHxMSelect_OptionDeselectAll);
				forceUpdateWithRelayoutOrOpenPopup();
			}
		};
		const removeValue = (option: HxSelectOption) => {
			const {getValueFromModel, setValueToModel} = createFromAndToModelFuncs({
				$model, $field, fromModel, toModel, context
			});
			const currentValues = getValueFromModel().array;
			if (currentValues != null && currentValues.length !== 0) {
				const newValues = currentValues.filter(value => {
					return value != option.value;
				});
				if (newValues.length !== currentValues.length) {
					// option deselected
					setValueToModel(newValues);
					popupContext.emit(EvtHxMSelect_OptionDeselect, option);
					forceUpdateWithRelayoutOrOpenPopup();
				}
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
						popupContext.emit(EvtHxMSelect_SelectHoverOption);
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
						popupContext.emit(EvtHxMSelect_SelectHoverOption);
					}
					break;
				}
				case 'Delete': {
					if (clearable && optionsContainerRef.current != null) {
						clearValue();
					}
					break;
				}
				case 'Backspace': {
					if (DeviceCheck.checkMac()) {
						if (clearable && optionsContainerRef.current != null) {
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
						popupContext.emit(EvtHxMSelect_HoverPreviousOption);
					}
					break;
				}
				case 'ArrowDown': {
					if (isPopupOpenable()) {
						shouldPreventDefault = true;
						openPopup();
					} else if (isPopupOpened()) {
						shouldPreventDefault = true;
						popupContext.emit(EvtHxMSelect_HoverNextOption);
					}
					break;
				}
				case 'Tab': {
					if (compact || optionsContainerRef.current == null) {
						// no option selected
						if (!ev.shiftKey && isPopupOpened()) {
							popupContext.emit(EvtHxMSelect_GetFilterInput, (el?: HTMLElement) => {
								shouldPreventDefault = true;
								el?.focus();
							});
						}
					} else {
						// otherwise follow default tab behavior, do nothing
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
			// so listener will find that the event target is not child of select dom,
			// and of course it is not child of popup dom,
			// therefore a hide command will be sent, which is not expected
			// so simply stop propagation this event
			ev.stopPropagation();
			selectRef.current?.focus();
		};

		// Get current value and corresponding label
		const {getValueFromModel} = createFromAndToModelFuncs({$model, $field, fromModel, toModel, context});
		let hasValueSelected = false;
		let label;
		if (optionsRef.current.loaded) {
			const values = getValueFromModel().array;
			hasValueSelected = values != null && values.length !== 0;
			const selectedOptions = optionsRef.current.options
				.filter(option => values.some(value => option.value == value));
			if (selectedOptions == null || selectedOptions.length === 0) {
				if (placeholder) {
					label = <HxLabel $model={$model} text={placeholderKey} clickable={disabled && true}
					                 data-hx-m-select-input-label=""
					                 data-hx-label-input-embed=""
					                 data-hx-label-input-placeholder=""
					                 data-hx-label-single-line-ellipsis=""/>;
				} else {
					// display nothing
					label = (void 0);
				}
			} else if (compact) {
				label = <div data-hx-m-select-input-options="" data-hx-m-select-input-options-compact=""
				             ref={optionsContainerRef}>
					{selectedOptions.map(option => {
						const label = option?.selectedLabel ?? selectedLabel?.(option) ?? option?.label;
						return <HxLabel $model={$model} text={label}
						                clickable={disabled && true}
						                data-hx-m-select-input-label=""
						                data-hx-label-input-embed="" data-hx-label-single-line-ellipsis=""
						                key={option.value}/>;
					})}
					<HxLabel text="+0"
					         data-hx-m-select-input-label="" data-hx-m-select-input-label-more=""
					         data-hx-label-input-embed="" data-hx-label-single-line-ellipsis=""/>
				</div>;
			} else {
				label = <div data-hx-m-select-input-options="" ref={optionsContainerRef}>
					{selectedOptions.map(option => {
						const label = option?.selectedLabel ?? selectedLabel?.(option) ?? option?.label;
						let text = label;
						let onOptionKeyDown: KeyboardEventHandler<HTMLSpanElement> | undefined = (void 0);
						if (!disabled) {
							// remove icon only rendered in non-compact mode
							const deselectOption = (ev: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLSpanElement>) => {
								ev.stopPropagation();
								// catch the next option el before it is removed
								const el = ev.currentTarget.closest<HTMLSpanElement>('span[data-hx-m-select-input-label]');
								const next = el?.nextElementSibling as HTMLSpanElement | null;
								removeValue(option);
								// focus
								if (next != null) {
									next.focus();
								} else {
									selectRef.current?.focus();
								}
							};
							text = <>
								{label}
								<HxButton text={<Clear/>}
								          tabIndex={-1}
								          data-hx-button-input-embed="" data-hx-button-svg-icon=""
								          data-hx-m-select-icon="clear"
								          color="danger" variant="outline"
								          onClick={deselectOption}/>
							</>;
							onOptionKeyDown = (ev) => {
								switch (ev.key) {
									case 'Delete': {
										deselectOption(ev);
										break;
									}
									case 'Backspace': {
										if (DeviceCheck.checkMac()) {
											deselectOption(ev);
										} else {
											ev.stopPropagation();
										}
										break;
									}
									case 'Tab': {
										// check there is next option selected or not
										const next = ev.currentTarget.nextElementSibling as HTMLSpanElement | null;
										if (next == null) {
											// this is the last selected option
											if (!ev.shiftKey && isPopupOpened()) {
												ev.stopPropagation();
												ev.preventDefault();
												popupContext.emit(EvtHxMSelect_GetFilterInput, (el?: HTMLElement) => {
													el?.focus();
												});
											}
										}
										break;
									}
									default: {
										// do nothing
										break;
									}
								}
							};
						}
						return <HxLabel $model={$model} text={text}
						                tabIndex={disabled ? (void 0) : 0}
						                clickable={disabled && true}
						                data-hx-m-select-input-label="" data-hx-label-input-embed=""
						                onKeyDown={onOptionKeyDown}
						                key={option.value}/>;
					})}
				</div>;
			}
		} else {
			// Show loading state text while options are loading
			label = <HxLabel $model={$model} text={optionsOnLoadKey} clickable={disabled && true}
			                 data-hx-m-select-input-label=""
			                 data-hx-label-input-embed="" data-hx-label-input-placeholder=""
			                 data-hx-label-single-line-ellipsis=""/>;
		}
		const canClear = !disabled && clearable && hasValueSelected;

		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context, {
			key: 'HxMSelect', default: HxMSelectDefaults, visible, disabled
		});

		return <div role="select" {...restProps}
		            tabIndex={disabled ? (void 0) : 0}
		            onClick={onSelectClick} onKeyDown={onSelectKeyDown}
		            data-hx-m-select=""
		            data-hx-model-path={ERO.pathOf($model, $field)}
		            ref={selectRef}>
			{label}
			{canClear
				? <HxButton text={<Clear/>}
				            tabIndex={-1}
				            data-hx-button-input-embed="" data-hx-button-svg-icon=""
				            data-hx-m-select-icon="clear"
				            color="danger" variant="outline"
				            onClick={onClearClick}/>
				: (void 0)}
			<HxButton text={downIcon ?? <CaretDown/>}
			          $disabled={disabled}
			          tabIndex={-1}
			          data-hx-button-input-embed="" data-hx-button-svg-icon=""
			          data-hx-m-select-icon="caret-down"
			          variant="outline"/>
		</div>;
	});
HxMSelectInput.displayName = 'HxMSelectInput';

HxDataPropToAttrValueComputer.create('HxMSelect').register();
