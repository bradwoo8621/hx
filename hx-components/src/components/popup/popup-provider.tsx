import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import {createPortal} from 'react-dom';
import {useHxContext} from '../../contexts';
import {amendPopupGapToEdge, amendPopupZIndex, HxWithPopupDefaults} from './defaults';
import {HxPopup} from './popup';

export interface PopupRect extends DOMRect {
	maxHeight?: number;
	minHeight?: number;
	maxWidth?: number;
	minWidth?: number;
}

export interface HxPopupContext {
	show<E extends HTMLElement>(triggerEl: E, maxPopupHeight: number): void;
	onShow<E extends HTMLElement>(listener: (triggerEl: E, maxPopupHeight: number) => void): void;
	offShow<E extends HTMLElement>(listener: (triggerEl: E, maxPopupHeight: number) => void): void;
	hide(): void;
	onHide(listener: () => void): void;
	offHide(listener: () => void): void;
	checkFocusElement(triggerEl: HTMLElement, callback: (inPopup: boolean) => void): void;
	onCheckFocusElement(listener: (triggerEl: HTMLElement, callback: (inPopup: boolean) => void) => void): void;
	offCheckFocusElement(listener: (triggerEl: HTMLElement, callback: (inPopup: boolean) => void) => void): void;
	// custom event
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(type: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	off(type: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(type: string, ...args: any[]): void;
}

const Context = createContext<HxPopupContext>({} as HxPopupContext);
Context.displayName = 'HxPopupProvider';

export interface HxPopupProviderProps {
	zIndex?: number;
	gapToEdge?: number;

	trigger: ReactNode;
	children: ReactNode;
	/** data initializer for trigger and popup content */
	data?: ReactNode;
}

export const HxPopupProvider = (props: HxPopupProviderProps) => {
	const {
		zIndex = HxWithPopupDefaults.zIndex, gapToEdge = HxWithPopupDefaults.gapToEdge,
		trigger, children, data
	} = props;

	const context = useHxContext();
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

		show<E extends HTMLElement>(triggerEl: E, maxPopupHeight: number): void {
			this.events.emit('popup-show', triggerEl, maxPopupHeight);
		}

		onShow<E extends HTMLElement>(listener: (triggerEl: E, maxPopupHeight: number) => void): void {
			this.events.on('popup-show', listener);
		}

		offShow<E extends HTMLElement>(listener: (triggerEl: E, maxPopupHeight: number) => void): void {
			this.events.off('popup-show', listener);
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
		{trigger}
		{createPortal(
			<div data-hx-portal-root=""
			     data-hx-theme={context.theme.current()}
			     data-hx-language={context.language.current()}
			     style={{zIndex}}>
				{/* Main overlay container element */}
				<HxPopup zIndex={amendPopupZIndex(zIndex)!} gapToEdge={amendPopupGapToEdge(gapToEdge)!}>
					{children}
				</HxPopup>
			</div>,
			document.body)}
		{data}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxPopupContext = () => useContext(Context);
