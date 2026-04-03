import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import {createPortal} from 'react-dom';
import {useHxContext} from '../../contexts';
import type {RectRange} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex, HxWithPopupDefaults} from './defaults';
import {HxPopup} from './popup';

/**
 * Popup context API for controlling popup visibility and events
 */
export interface HxPopupContext {
	/**
	 * Show the popup
	 * @param triggerEl - Trigger element that opened the popup
	 * @param popupRectRange - Size constraints for the popup (min/max width/height)
	 */
	show<E extends HTMLElement>(triggerEl: E, popupRectRange: RectRange): void;

	/**
	 * Register listener for popup show event
	 * @param listener - Callback function that receives trigger element and size constraints
	 */
	onShow<E extends HTMLElement>(listener: (triggerEl: E, popupRectRange: RectRange) => void): void;

	/**
	 * Remove listener for popup show event
	 * @param listener - Previously registered listener function
	 */
	offShow<E extends HTMLElement>(listener: (triggerEl: E, popupRectRange: RectRange) => void): void;

	/**
	 * Ask popup to check position
	 * @param triggerEl - Trigger element that opened the popup
	 * @param popupRectRange - Size constraints for the popup (min/max width/height)
	 */
	movePosition<E extends HTMLElement>(triggerEl: E, popupRectRange: RectRange): void;

	/**
	 * Register listener for check position event
	 * @param listener - Callback function that receives trigger element and size constraints
	 */
	onMovePosition<E extends HTMLElement>(listener: (triggerEl: E, popupRectRange: RectRange) => void): void;

	/**
	 * Remove listener for check position event
	 * @param listener - Previously registered listener function
	 */
	offMovePosition<E extends HTMLElement>(listener: (triggerEl: E, popupRectRange: RectRange) => void): void;

	/** Hide the popup */
	hide(): void;

	/**
	 * Register listener for popup hide event
	 * @param listener - Callback function called when popup hides
	 */
	onHide(listener: () => void): void;

	/**
	 * Remove listener for popup hide event
	 * @param listener - Previously registered listener function
	 */
	offHide(listener: () => void): void;

	/**
	 * Check if an element is inside the popup container
	 * @param triggerEl - Element to check
	 * @param callback - Callback that receives boolean indicating if element is in popup
	 */
	checkFocusElement(triggerEl: HTMLElement, callback: (inPopup: boolean) => void): void;

	/**
	 * Register listener for focus element check requests
	 * @param listener - Callback function that handles check requests
	 */
	onCheckFocusElement(listener: (triggerEl: HTMLElement, callback: (inPopup: boolean) => void) => void): void;

	/**
	 * Remove listener for focus element check requests
	 * @param listener - Previously registered listener function
	 */
	offCheckFocusElement(listener: (triggerEl: HTMLElement, callback: (inPopup: boolean) => void) => void): void;

	/**
	 * Register custom event listener
	 * @param type - Event name
	 * @param listener - Event callback function
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(type: string, listener: (...args: any[]) => void): void;

	/**
	 * Remove custom event listener
	 * @param type - Event name
	 * @param listener - Previously registered callback function
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	off(type: string, listener: (...args: any[]) => void): void;

	/**
	 * Emit custom event
	 * @param type - Event name
	 * @param args - Event arguments to pass to listeners
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(type: string, ...args: any[]): void;
}

/** Popup context instance */
const Context = createContext<HxPopupContext>({} as HxPopupContext);
Context.displayName = 'HxPopupProvider';

/**
 * Popup provider component props
 */
export interface HxPopupProviderProps {
	/** Z-index for the popup layer */
	zIndex?: number;
	/** Minimum gap between popup edge and viewport */
	gapToEdge?: number;

	/** Trigger element that opens the popup */
	trigger: ReactNode;
	/** Content to display inside the popup */
	children: ReactNode;
	/** Optional data initializer components that run even when popup is hidden */
	data?: ReactNode;
}

/**
 * Popup provider component that manages popup state and context
 * Renders trigger element and portals popup content to document body
 */
export const HxPopupProvider = (props: HxPopupProviderProps) => {
	const {
		zIndex = HxWithPopupDefaults.zIndex, gapToEdge = HxWithPopupDefaults.gapToEdge,
		trigger, children, data
	} = props;

	const context = useHxContext();
	// Create event-driven popup context instance
	const [popupContext] = useState<HxPopupContext>(() => new class implements HxPopupContext {
		private events = new EventEmitter();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		emit(type: string, ...args: any[]): void {
			this.events.emit(type, ...args);
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		off(type: string, listener: (...args: any[]) => void): void {
			this.events.off(type, listener);
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		on(type: string, listener: (...args: any[]) => void): void {
			this.events.on(type, listener);
		}

		show<E extends HTMLElement>(triggerEl: E, popupRectRange: RectRange): void {
			this.events.emit('popup-show', triggerEl, popupRectRange);
		}

		onShow<E extends HTMLElement>(listener: (triggerEl: E, popupRectRange: RectRange) => void): void {
			this.events.on('popup-show', listener);
		}

		offShow<E extends HTMLElement>(listener: (triggerEl: E, popupRectRange: RectRange) => void): void {
			this.events.off('popup-show', listener);
		}

		movePosition<E extends HTMLElement>(triggerEl: E, popupRectRange: RectRange): void {
			this.events.emit('check-position', triggerEl, popupRectRange);
		}

		onMovePosition<E extends HTMLElement>(listener: (triggerEl: E, popupRectRange: RectRange) => void): void {
			this.events.on('check-position', listener);
		}

		offMovePosition<E extends HTMLElement>(listener: (triggerEl: E, popupRectRange: RectRange) => void): void {
			this.events.off('check-position', listener);
		}

		hide(): void {
			this.events.emit('popup-hide');
		}

		onHide(listener: () => void): void {
			this.events.on('popup-hide', listener);
		}

		offHide(listener: () => void): void {
			this.events.off('popup-hide', listener);
		}

		checkFocusElement(triggerEl: HTMLElement, callback: (inPopup: boolean) => void): void {
			this.events.emit('check-focus-element', triggerEl, callback);
		}

		onCheckFocusElement(listener: (triggerEl: HTMLElement, callback: (inPopup: boolean) => void) => void): void {
			this.events.on('check-focus-element', listener);
		}

		offCheckFocusElement(listener: (triggerEl: HTMLElement, callback: (inPopup: boolean) => void) => void): void {
			this.events.off('check-focus-element', listener);
		}
	}());

	return <Context.Provider value={popupContext}>
		{/* Render trigger element in normal DOM flow */}
		{trigger}
		{/* Portal popup content to body to avoid z-index and overflow issues */}
		{createPortal(
			<div data-hx-portal-root=""
			     data-hx-theme={context.theme.current()}
			     data-hx-language={context.language.current()}
			     style={{zIndex}}>
				<HxPopup zIndex={amendPopupZIndex(zIndex)!} gapToEdge={amendPopupGapToEdge(gapToEdge)!}>
					{children}
				</HxPopup>
			</div>,
			document.body)}
		{/* Render data initializers that need to exist even when popup is closed */}
		{data}
	</Context.Provider>;
};

/**
 * Hook to access popup context
 * @returns Popup context API instance
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxPopupContext = () => useContext(Context);
