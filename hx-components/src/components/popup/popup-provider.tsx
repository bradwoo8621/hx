// @ts-expect-error import React
import React, {type MutableRefObject, type ReactNode, useContext, useRef, useState} from 'react';
import type {HxRectRange} from '../../types';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';
import {HxWithPopupDefaults} from './defaults';
import {HxPopupInternalProvider} from './popup-internal-context';
import {HxPopupPortal} from './popup-portal';
import {HxPopupSteadyState} from './popup-steady-state';
import type {HxPopupDataAttrName} from './types';

export interface HxPopupRenderOptions extends HxRectRange {
	/**
	 * fix position, otherwise try bottom -> top -> bottom
	 */
	position?: 'top' | 'bottom';
	/**
	 * align to which side of trigger, trigger direction (LTR/RTL) sensitive.
	 */
	alignTo?: 'left' | 'right';
}

/**
 * Popup context API for controlling popup visibility and events
 */
export interface HxPopupContext extends HxReactContext {
	/**
	 * Show the popup
	 * @param triggerEl - Trigger element that opened the popup
	 * @param options - Size constraints for the popup (min/max width/height) and position
	 */
	show<E extends HTMLElement>(triggerEl: E, options: HxPopupRenderOptions): void;

	/**
	 * Register listener for popup show event
	 * @param listener - Callback function that receives trigger element and options
	 */
	onShow<E extends HTMLElement>(listener: (triggerEl: E, options: HxPopupRenderOptions) => void): void;

	/**
	 * Remove listener for popup show event
	 * @param listener - Previously registered listener function
	 */
	offShow<E extends HTMLElement>(listener: (triggerEl: E, options: HxPopupRenderOptions) => void): void;

	/**
	 * Ask popup to check position
	 * @param triggerEl - Trigger element that opened the popup
	 * @param options - Size constraints for the popup (min/max width/height) and position
	 */
	relayout<E extends HTMLElement>(triggerEl: E, options: HxPopupRenderOptions): void;

	/**
	 * Register listener for check position event
	 * @param listener - Callback function that receives trigger element and options
	 */
	onRelayout<E extends HTMLElement>(listener: (triggerEl: E, options: HxPopupRenderOptions) => void): void;

	/**
	 * Remove listener for check position event
	 * @param listener - Previously registered listener function
	 */
	offRelayout<E extends HTMLElement>(listener: (triggerEl: E, options: HxPopupRenderOptions) => void): void;

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
	 * Ask popup whether it is currently visible
	 * @param callback - Callback that receives boolean indicating if the popup is visible, invoked synchronously
	 */
	isVisible(callback: (visible: boolean) => void): void;

	/**
	 * Register listener for popup visibility check requests
	 * @param listener - Callback function that handles visibility check requests
	 */
	onIsVisible(listener: (callback: (visible: boolean) => void) => void): void;

	/**
	 * Remove listener for popup visibility check requests
	 * @param listener - Previously registered callback function
	 */
	offIsVisible(listener: (callback: (visible: boolean) => void) => void): void;

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
	 * Register this popup's container with the nearest ancestor popup context,
	 * so that a click inside this nested popup also counts as inside the ancestor.
	 * @param ref - Ref of this popup's container element
	 */
	registerToAncestor(ref: MutableRefObject<HTMLDivElement | null>): void;

	/**
	 * Register a descendant popup's container in this context and forward it to the
	 * remaining ancestors, so every ancestor recognises clicks inside nested popups.
	 * @param ref - Ref of the descendant popup's container element
	 */
	registerChild(ref: MutableRefObject<HTMLDivElement | null>): void;

	/**
	 * Remove this popup's container from the nearest ancestor popup context
	 * @param ref - Ref previously passed to {@link registerToAncestor}
	 */
	unregisterFromAncestor(ref: MutableRefObject<HTMLDivElement | null>): void;

	/**
	 * Remove a descendant popup's container from this context and the remaining ancestors
	 * @param ref - Ref previously passed to {@link registerChild}
	 */
	unregisterChild(ref: MutableRefObject<HTMLDivElement | null>): void;

	/**
	 * Collect the container refs of all descendant popups registered in this context
	 * @param callback - Callback that receives the registered descendant refs, invoked synchronously
	 */
	askChildPopups(callback: (refs: Array<MutableRefObject<HTMLDivElement | null>>) => void): void;
}

/** Popup context instance */
const Context = createHxReactContext<HxPopupContext>('HxPopupContext');

/**
 * Popup provider component props
 */
export interface HxPopupProviderProps {
	/** Z-index for the popup layer */
	zIndex?: number;
	/** Minimum gap between popup edge and viewport */
	gapToEdge?: number;
	/** Popup with at minimum same width with trigger */
	sameWidthAtMinimum: boolean;

	/** Trigger element that opens the popup */
	trigger: ReactNode;
	/** Content to display inside the popup */
	children: ReactNode;
	/** Optional steady state/data initializer components that run even when popup is hidden */
	steady?: ReactNode;
	/** pass to popup directly, for additional control, mostly for styles */
	[key: HxPopupDataAttrName]: string;
}

/**
 * Popup provider component that manages popup state and context
 * Renders trigger element and portals popup content to document body
 */
export const HxPopupProvider = (props: HxPopupProviderProps) => {
	const {
		zIndex = HxWithPopupDefaults.zIndex, gapToEdge = HxWithPopupDefaults.gapToEdge,
		sameWidthAtMinimum,
		trigger, children, steady,
		...rest
	} = props;

	const parentPopupContext = useHxPopup();
	const childPopupsRef = useRef<Array<MutableRefObject<HTMLDivElement | null>>>([]);

	// Create event-driven popup context instance
	const [popupContext] = useState<HxPopupContext>(() => new class extends AbstractHxReactContext implements HxPopupContext {
		show<E extends HTMLElement>(triggerEl: E, options: HxPopupRenderOptions): void {
			this.emit('popup-show', triggerEl, options);
		}

		onShow<E extends HTMLElement>(listener: (triggerEl: E, options: HxPopupRenderOptions) => void): void {
			this.on('popup-show', listener);
		}

		offShow<E extends HTMLElement>(listener: (triggerEl: E, options: HxPopupRenderOptions) => void): void {
			this.off('popup-show', listener);
		}

		relayout<E extends HTMLElement>(triggerEl: E, options: HxPopupRenderOptions): void {
			this.emit('check-position', triggerEl, options);
		}

		onRelayout<E extends HTMLElement>(listener: (triggerEl: E, options: HxPopupRenderOptions) => void): void {
			this.on('check-position', listener);
		}

		offRelayout<E extends HTMLElement>(listener: (triggerEl: E, options: HxPopupRenderOptions) => void): void {
			this.off('check-position', listener);
		}

		hide(): void {
			this.emit('popup-hide');
		}

		onHide(listener: () => void): void {
			this.on('popup-hide', listener);
		}

		offHide(listener: () => void): void {
			this.off('popup-hide', listener);
		}

		isVisible(callback: (visible: boolean) => void): void {
			this.emit('is-visible', callback);
		}

		onIsVisible(listener: (callback: (visible: boolean) => void) => void): void {
			this.on('is-visible', listener);
		}

		offIsVisible(listener: (callback: (visible: boolean) => void) => void): void {
			this.off('is-visible', listener);
		}

		checkFocusElement(triggerEl: HTMLElement, callback: (inPopup: boolean) => void): void {
			this.emit('check-focus-element', triggerEl, callback);
		}

		onCheckFocusElement(listener: (triggerEl: HTMLElement, callback: (inPopup: boolean) => void) => void): void {
			this.on('check-focus-element', listener);
		}

		offCheckFocusElement(listener: (triggerEl: HTMLElement, callback: (inPopup: boolean) => void) => void): void {
			this.off('check-focus-element', listener);
		}

		registerToAncestor(ref: MutableRefObject<HTMLDivElement | null>): void {
			parentPopupContext?.registerChild(ref);
		}

		registerChild(ref: MutableRefObject<HTMLDivElement | null>): void {
			if (!childPopupsRef.current.includes(ref)) {
				childPopupsRef.current.push(ref);
			}
			parentPopupContext?.registerChild(ref);
		}

		unregisterFromAncestor(ref: MutableRefObject<HTMLDivElement | null>): void {
			parentPopupContext?.unregisterChild(ref);
		}

		unregisterChild(ref: MutableRefObject<HTMLDivElement | null>): void {
			parentPopupContext?.unregisterChild(ref);
			const index = childPopupsRef.current.indexOf(ref);
			if (index !== -1) {
				childPopupsRef.current.splice(index, 1);
			}
		}

		askChildPopups(callback: (refs: Array<MutableRefObject<HTMLDivElement | null>>) => void): void {
			callback([...childPopupsRef.current]);
		}
	}());

	return <Context.Provider value={popupContext}>
		{/* Render trigger element in normal DOM flow */}
		{trigger}
		{/* Portal popup content to body to avoid z-index and overflow issues */}
		<HxPopupInternalProvider>
			<HxPopupPortal zIndex={zIndex}
			               gapToEdge={gapToEdge} sameWidthAtMinimum={sameWidthAtMinimum}
			               {...rest}>
				{children}
			</HxPopupPortal>
		</HxPopupInternalProvider>
		<HxPopupSteadyState data={steady}/>
	</Context.Provider>;
};

/**
 * Hook to access popup context
 * @returns Popup context API instance
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxPopup = () => useContext(Context);
