import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import {createPortal} from 'react-dom';
import {useHxContext} from '../../contexts';
import {amendPopupGapToEdge, amendPopupZIndex, HxWithPopupDefaults} from './defaults';
import {HxPopup} from './popup';

export interface HxPopupContext {
	show(): void;
	onShow(listener: () => void): void;
	offShow(listener: () => void): void;
	hide(): void;
	onHide(listener: () => void): void;
	offHide(listener: () => void): void;
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
}

export const HxPopupProvider = (props: HxPopupProviderProps) => {
	const {
		zIndex = HxWithPopupDefaults.zIndex, gapToEdge = HxWithPopupDefaults.gapToEdge,
		trigger, children
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

		show(): void {
			this.events.emit('popup-show');
		}

		onShow(listener: () => void): void {
			this.events.on('popup-show', listener);
		}

		offShow(listener: () => void): void {
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
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxPopupContext = () => useContext(Context);
