// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type KeyboardEventHandler, useEffect} from 'react';
import {useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import type {HxColor} from '../../types';
import {HxFlex, type HxFlexProps} from '../flex';
import {type HxPopupRenderOptions, usePopupVisibleRef} from '../popup';
import {buildContent} from './actions-builder';
import {
	EvtHxActions_ClosePopup,
	EvtHxActions_HoverNextOption,
	EvtHxActions_HoverPreviousOption,
	EvtHxActions_SelectHoverOption,
	type HxActionsLeading,
	type HxActionsVariant
} from './types';

/**
 * Props for HxActionsLeadingContent component
 * Defines all properties needed to render the trigger part of the actions component
 */
export type HxActionsLeadingProps<T extends object> =
	& Omit<
		HxFlexProps<T>,
		| '$field'
		| 'direction' | 'data-hx-flex-direction' | 'wrap' | 'data-hx-flex-wrap'
		| 'color' | 'data-hx-color'
	>
	& {
	/** Color scheme for the trigger button(s) */
	color: HxColor;
	/** Style variant for the trigger button(s) */
	variant: HxActionsVariant;
	/** Leading trigger content, can be string, label, button or button group */
	leading?: HxActionsLeading;
	/** Popup position */
	popupPosition?: HxPopupRenderOptions['position'];
	/** Popup align to */
	popupAlignTo?: HxPopupRenderOptions['alignTo'];
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
			color, variant, visible, disabled,
			leading,
			popupPosition, popupAlignTo,
			...rest
		} = props;

		const context = useHxContext();
		// Dual ref combines forwarded ref and internal ref for trigger container
		const actionsRef = useDualRef(ref);
		const {context: popupContext, visibleRef: popupVisibleRef} = usePopupVisibleRef({
			elementRef: actionsRef,
			ignoreClick: (targetEl, elementRef) => {
				// Ignore clicks on the trigger dropdown button
				return elementRef.current?.querySelector(':scope button:last-child')?.contains(targetEl) ?? false;
			}
		});

		useEffect(() => {
			return () => {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				popupVisibleRef.current.clean();
			};
		}, [popupVisibleRef]);
		/**
		 * Listen for custom close popup event from popup content
		 * Handles close requests from keyboard navigation or action selection
		 */
		useEffect(() => {
			const onClosePopup = () => {
				if (!disabled && popupVisibleRef.current.isVisible()) {
					popupVisibleRef.current.hide();
				}
			};

			popupContext.on(EvtHxActions_ClosePopup, onClosePopup);
			return () => {
				popupContext.off(EvtHxActions_ClosePopup, onClosePopup);
			};
		}, [$model, popupVisibleRef, popupContext, context, actionsRef, disabled]);

		// noinspection DuplicatedCode
		/** Check if popup can be opened (not disabled and not already open) */
		const isPopupOpenable = (): boolean => {
			return !disabled && !popupVisibleRef.current.isVisible();
		};
		/** Check if popup is currently opened */
		const isPopupOpened = (): boolean => {
			return !disabled && popupVisibleRef.current.isVisible();
		};
		/** Open popup and install event listeners */
		const openPopup = () => {
			if (isPopupOpenable()) {
				popupVisibleRef.current.show(disabled, {
					position: popupPosition, alignTo: popupAlignTo
				});
			}
		};
		/** Close popup and uninstall event listeners */
		const closePopup = () => {
			if (isPopupOpened()) {
				popupVisibleRef.current.hide();
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

		/**
		 * Build trigger content using actions-builder utility
		 * Handles different leading types (string, button, button group) and adds dropdown trigger
		 */
		const content = buildContent({
			actions: leading,
			$model, disabled, color, variant,
			openPopup, closePopup,
			buildPopupTrigger: true,
			onTriggerKeyDown: onPopupStickKeyDown
		});

		// default value of gapX, alignItems and borderRadius
		return <HxFlex data-hx-cell-gap-x="none" data-hx-align-items="center" data-hx-border-radius="atomic"
		               {...rest}
		               $model={$model}
		               wrap={false} // wrap always be false
		               data-hx-actions=""
		               $visible={visible}
			// additional disabled
			           data-hx-disabled={disabled}
			           ref={actionsRef}>
			{/** Use fragment to avoid unnecessary element cloning */}
			<>{content}</>
		</HxFlex>;
	});
HxActionsLeadingContent.displayName = 'HxActionsLeadingContent';
