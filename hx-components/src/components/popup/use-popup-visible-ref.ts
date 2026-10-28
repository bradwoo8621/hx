import {type RefObject, useRef} from 'react';
import {DOMUtils} from '../../utils';
import {type HxPopupRenderOptions, useHxPopup} from './popup-provider';

export interface UsePopupVisibleRefOptions {
	elementRef: RefObject<HTMLElement>;
	/**
	 * Detect focus-in event triggered, document level.
	 * - Returns true to ignore this event,
	 * - Default check when this function is omitted, is ignoring this event when element ref contains the target element.
	 * - Or do not ignore event when above 2 are not matched.
	 *
	 * Keep this function pure; do not reference any external variables or make sure the referenced external variables are not-changed anyway.
	 * Changes to this function will not cause visibleRef to be rebuilt.
	 */
	ignoreFocusIn?: (targetEl: HTMLElement, elementRef: RefObject<HTMLElement>) => boolean;
	/**
	 * Detect click event triggered, document level.
	 * - Returns true to ignore this event,
	 * - Default check when this function is omitted, is ignoring this event when element ref contains the target element.
	 * - Or do not ignore event when above 2 are not matched.
	 *
	 * Keep this function pure; do not reference any external variables or make sure the referenced external variables are not-changed anyway.
	 * Changes to this function will not cause visibleRef to be rebuilt.
	 */
	ignoreClick?: (targetEl: HTMLElement, elementRef: RefObject<HTMLElement>) => boolean;
	/**
	 * Detect focus-in/click event triggered, document level.
	 * - Already pass the {@link ignoreFocusIn} and {@link ignoreClick} check,
	 * - Target element is outside of popup.
	 * - Popup will be closed after this function executed.
	 *
	 * Keep this function pure; do not reference any external variables or make sure the referenced external variables are not-changed anyway.
	 * Changes to this function will not cause visibleRef to be rebuilt.
	 */
	beforeHideByFocusInOrClickOutPopup?: (targetEl: HTMLElement, elementRef: RefObject<HTMLElement>) => void;
	/**
	 * Detect focus-in/click event triggered, document level.
	 * - Already pass the {@link ignoreFocusIn} and {@link ignoreClick} check,
	 * - Target element is inside of popup.
	 *
	 * Keep this function pure; do not reference any external variables or make sure the referenced external variables are not-changed anyway.
	 * Changes to this function will not cause visibleRef to be rebuilt.
	 */
	onFocusInOrClickInPopup?: (targetEl: HTMLElement, elementRef: RefObject<HTMLElement>) => void;
}

export type HxPopupShowOptions = Pick<HxPopupRenderOptions, 'position' | 'alignTo' | 'minWidth' | 'maxHeight'>;

export interface HxPopupVisibleRef {
	show(disabled: boolean, options?: HxPopupShowOptions): void;
	hide(): void;
	isVisible(): boolean;
	clean(): void;
}

/**
 * Visibility state manager with listener installation/uninstallation
 * Manages external event listeners for outside click, scroll and resize
 * Automatically cleans up listeners when popup is closed or component unmounts
 */
export const usePopupVisibleRef = (options: UsePopupVisibleRefOptions) => {
	const {
		elementRef,
		ignoreFocusIn, ignoreClick,
		beforeHideByFocusInOrClickOutPopup, onFocusInOrClickInPopup
	} = options;

	const popupContext = useHxPopup();

	const visibleRef = useRef((() => {
		const state: {
			visible: boolean;
			install: (disabled: boolean, options?: HxPopupShowOptions) => (() => void);
			uninstall?: (() => void),
			hide: () => void;
		} = {
			visible: false,
			/**
			 * Install event listeners for popup management:
			 * - Outside click/focus: closes popup when clicking outside
			 * - Scroll/resize of ancestor elements: reposition popup or close if scrolled out of view
			 */
			install: (disabled: boolean, options: HxPopupShowOptions = {}) => {
				// Listener for outside click/focus events
				// HxConsole.debug('Install focus/click/scroll/resize listeners for control the picker popup.');
				const uninstall1 = DOMUtils.handleFocusClickOfOthers((ev: Event) => {
					// HxConsole.debug('click or focus');
					if (!disabled && state.visible) {
						const targetEl = ev.target as HTMLElement;
						const eventType = ev.type;
						if (eventType === 'focusin') {
							if (ignoreFocusIn?.(targetEl, elementRef) ?? elementRef.current?.contains(targetEl) ?? false) {
								return;
							}
						} else if (eventType === 'click') {
							if (ignoreClick?.(targetEl, elementRef) ?? elementRef.current?.contains(targetEl) ?? false) {
								return;
							}
						}

						// Check if target element is inside popup, close only if outside
						popupContext.checkFocusElement(targetEl, (inPopup: boolean) => {
							if (!inPopup) {
								beforeHideByFocusInOrClickOutPopup?.(targetEl, elementRef);
								state.hide();
								popupContext.hide();
							} else {
								onFocusInOrClickInPopup?.(targetEl, elementRef);
							}
						});
					}
				});
				// Listener for scroll and resize events on ancestor elements
				const uninstall2 = DOMUtils.handleScrollResizeOfAncestors(elementRef.current,
					() => {
						// Reposition popup when ancestor is scrolled
						// HxConsole.debug('scroll or resize to relocate');
						if (!disabled && state.visible) {
							popupContext.relayout(elementRef.current!, options);
						}
					},
					() => {
						// Close popup when ancestor scroll would move it out of view
						// HxConsole.debug('scroll or resize to hide');
						state.hide();
						popupContext.hide();
					});

				// Return combined function for uninstallation
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
			/** Show popup and install event listeners */
			show: (disabled: boolean, options: HxPopupShowOptions = {}) => {
				state.visible = true;
				state.uninstall?.();
				state.uninstall = state.install(disabled, options);

				popupContext.show(elementRef.current!, options);
			},
			/** Hide popup and uninstall event listeners */
			hide: () => {
				state.hide();
				popupContext.hide();
			},
			/** Check if popup is currently visible */
			isVisible: () => state.visible,
			/** Clean up event listeners manually */
			clean: () => {
				state.uninstall?.();
			}
		} as HxPopupVisibleRef;
	})());

	return {context: popupContext, visibleRef};
};
