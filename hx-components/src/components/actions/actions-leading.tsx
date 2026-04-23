import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type KeyboardEventHandler,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import type {HxHtmlElementProps} from '../../types';
import {exposePropsToDOM, handleFocusClickOfOthers, handleScrollResizeOfAncestors} from '../../utils';
import {HxFlex} from '../flex';
import {useHxPopupContext} from '../popup';
import {buildContent} from './actions-builder';
import {
	EvtHxActions_ClosePopup,
	EvtHxActions_HoverNextOption,
	EvtHxActions_HoverPreviousOption,
	EvtHxActions_SelectHoverOption,
	type HxActionsColor,
	type HxActionsLeading,
	type HxActionVarious,
	type HxExtActionsProps,
	type OmittedActionsHTMLProps
} from './types';

/**
 * Props for HxActionsLeadingContent component
 * Defines all properties needed to render the trigger part of the actions component
 */
export type HxActionsLeadingProps<T extends object> =
	& Pick<HxExtActionsProps<T>, '$model'>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedActionsHTMLProps, T>
	& {
	/** Color scheme for the trigger button(s) */
	color: HxActionsColor;
	/** Style variant for the trigger button(s) */
	various: HxActionVarious;
	/** Leading trigger content, can be string, label, button or button group */
	leading?: HxActionsLeading;
	/** Whether the actions component is visible */
	visible: boolean;
	/** Whether the actions component is disabled */
	disabled: boolean;
};

/**
 * HxActionsLeadingContent Component
 * Renders the trigger part of the actions component, handles all trigger interactions
 * Manages popup open/close state, keyboard navigation, and outside click handling
 *
 * @param props - Component configuration properties
 * @param ref - Forwarded ref to the trigger container element
 */
export const HxActionsLeadingContent =
	forwardRef(<T extends object>(props: HxActionsLeadingProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model,
			color, various, visible, disabled,
			leading,
			...rest
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		// Dual ref combines forwarded ref and internal ref for trigger container
		const actionsRef = useDualRef(ref);

		/**
		 * Visibility state manager with listener installation/uninstallation
		 * Manages external event listeners for outside click, scroll and resize
		 * Automatically cleans up listeners when popup is closed or component unmounts
		 */
		const visibleRef = useRef((() => {
			const state: {
				visible: boolean;
				install: (disabled: boolean) => (() => void);
				uninstall?: (() => void),
				hide: () => void;
			} = {
				visible: false,
				/**
				 * Install event listeners for popup management:
				 * - Outside click/focus: closes popup when clicking outside
				 * - Scroll/resize of ancestor elements: reposition popup or close if scrolled out of view
				 */
				install: (disabled: boolean) => {
					// Listener for outside click/focus events
					const uninstall1 = handleFocusClickOfOthers((ev: Event) => {
						if (!disabled && state.visible) {
							const targetEl = ev.target as HTMLElement;
							if (ev.type === 'focusin') {
								// Ignore focus events on the trigger itself
								if (actionsRef.current?.contains(targetEl)) {
									return;
								}
							} else if (actionsRef.current?.querySelector(':scope button:last-child')?.contains(targetEl)) {
								// Ignore clicks on the trigger dropdown button
								return;
							}
							// Check if clicked element is inside popup, close only if outside
							popupContext.checkFocusElement(targetEl, (inPopup: boolean) => {
								if (!inPopup) {
									state.hide();
									popupContext.hide();
								}
							});
						}
					});
					// Listener for scroll and resize events on ancestor elements
					const uninstall2 = handleScrollResizeOfAncestors(actionsRef.current,
						() => {
							// Reposition popup when ancestor is scrolled
							if (!disabled && state.visible) {
								popupContext.relayout(actionsRef.current!, {});
							}
						},
						() => {
							// Close popup when ancestor scroll would move it out of view
							state.hide();
							popupContext.hide();
						});

					// Return combined uninstall function
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
				/** Show popup and install event listeners */
				show: (disabled: boolean) => {
					state.visible = true;
					state.uninstall?.();
					state.uninstall = state.install(disabled);
				},
				/** Hide popup and uninstall event listeners */
				hide: state.hide,
				/** Check if popup is currently visible */
				isVisible: () => state.visible,
				/** Clean up event listeners manually */
				clean: state.uninstall as (() => void) | undefined
			} as const;
		})());

		/**
		 * Listen for custom close popup event from popup content
		 * Handles close requests from keyboard navigation or action selection
		 */
		useEffect(() => {
			const onClosePopup = () => {
				if (!disabled && visibleRef.current.isVisible()) {
					visibleRef.current.hide();
					popupContext.hide();
				}
			};

			popupContext.on(EvtHxActions_ClosePopup, onClosePopup);
			return () => {
				popupContext.off(EvtHxActions_ClosePopup, onClosePopup);
			};
		}, [$model, popupContext, context, actionsRef, disabled]);

		/** Check if popup can be opened (not disabled and not already open) */
		const isPopupOpenable = (): boolean => {
			return !disabled && !visibleRef.current.isVisible();
		};
		/** Check if popup is currently opened */
		const isPopupOpened = (): boolean => {
			return !disabled && visibleRef.current.isVisible();
		};
		/** Open popup and install event listeners */
		const openPopup = () => {
			if (isPopupOpenable()) {
				visibleRef.current.show(disabled);
				popupContext.show(actionsRef.current!, {});
			}
		};
		/** Close popup and uninstall event listeners */
		const closePopup = () => {
			if (isPopupOpened()) {
				visibleRef.current.hide();
				popupContext.hide();
			}
		};

		/**
		 * Keyboard event handler for trigger button
		 * Provides full keyboard navigation support:
		 * - Esc: closes open popup
		 * - Enter/Space: selects currently hovered action when popup is open
		 * - ArrowUp/ArrowDown: opens popup or navigates through action items
		 */
		const onPopupStickKeyDown: KeyboardEventHandler<HTMLButtonElement> = (ev) => {
			let shouldPreventDefault = false;
			switch (ev.key) {
				case 'Escape': {
					if (isPopupOpened()) {
						shouldPreventDefault = true;
						closePopup();
					}
					break;
				}
				case 'Enter':
				case ' ': {
					if (isPopupOpened()) {
						shouldPreventDefault = true;
						popupContext.emit(EvtHxActions_SelectHoverOption);
					}
					break;
				}
				case 'ArrowUp': {
					shouldPreventDefault = true;
					if (isPopupOpenable()) {
						openPopup();
					} else if (isPopupOpened()) {
						popupContext.emit(EvtHxActions_HoverPreviousOption);
					}
					break;
				}
				case 'ArrowDown': {
					shouldPreventDefault = true;
					if (isPopupOpenable()) {
						openPopup();
					} else if (isPopupOpened()) {
						popupContext.emit(EvtHxActions_HoverNextOption);
					}
					break;
				}
				default: {
					// do nothing for other keys
					break;
				}
			}
			if (shouldPreventDefault) {
				ev.preventDefault();
			}
		};

		/** Processed props with reactive values exposed as DOM data attributes for styling */
		const restProps = exposePropsToDOM(rest, $model, context);
		/**
		 * Build trigger content using actions-builder utility
		 * Handles different leading types (string, button, button group) and adds dropdown trigger
		 */
			// eslint-disable-next-line react-hooks/refs
		const content = buildContent({
			actions: leading,
			$model, disabled, color, various,
			openPopup, closePopup,
			buildPopupTrigger: true,
			onTriggerKeyDown: onPopupStickKeyDown
		});

		return <HxFlex {...restProps}
		               wrap={false} alignItems="center" gapX="none"
		               data-hx-actions=""
		               data-hx-model-path={ERO.loosePathOf($model)}
		               data-hx-border-radius="atomic"
		               data-hx-visible={(visible ?? true) ? '' : (void 0)}
		               data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		               ref={actionsRef}>
			{/** Use fragment to avoid unnecessary element cloning */}
			<>{content}</>
		</HxFlex>;
	});
HxActionsLeadingContent.displayName = 'HxActionsLeadingContent';