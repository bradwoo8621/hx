import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';

export interface HxTabsContext {
	/** get active tab */
	getActive(callback: (index: number, mark: string | null | undefined) => void): void;
	onGetActive(listener: (callback: (index: number, mark: (string | null | undefined)) => void) => void): void;
	offGetActive(listener: (callback: (index: number, mark: (string | null | undefined)) => void) => void): void;

	/** given tab of given mark or index is active or not */
	checkActive(markOrIndex: string | number, callback: (active: boolean) => void): void;
	onCheckActive(listener: (markOrIndex: string | number, callback: (active: boolean) => void) => void): void;
	offCheckActive(listener: (markOrIndex: string | number, callback: (active: boolean) => void) => void): void;
	/** given tab of given mark or index is activeable or not */
	checkActiveable(index: number, mark: string | null | undefined, callback: (activeable: boolean) => void): void;
	onCheckActiveable(listener: (index: number, mark: string | null | undefined, callback: (activeable: boolean) => void) => void): void;
	offCheckActiveable(listener: (index: number, mark: string | null | undefined, callback: (activeable: boolean) => void) => void): void;
	/** try to active tab */
	active(markOrIndex: string | number): void;
	onActive(listener: (markOrIndex: string | number) => void): void;
	offActive(listener: (markOrIndex: string | number) => void): void;
	/** active tab */
	doActive(index: number, mark: string | null | undefined): void;
	onDoActive(listener: (index: number, mark: string | null | undefined) => void): void;
	offDoActive(listener: (index: number, mark: string | null | undefined) => void): void;
	/** active tab changed, note the active and deactive tab both fire this event */
	activeChanged(active: boolean, index: number, mark: string | null | undefined): void;
	onActiveChanged(listener: (active: boolean, index: number, mark: string | null | undefined) => void): void;
	offActiveChanged(listener: (active: boolean, index: number, mark: string | null | undefined) => void): void;
}

const Context = createContext<HxTabsContext>({} as HxTabsContext);
Context.displayName = 'HxTabsContext';

export const HxTabsProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [tabsContext] = useState<HxTabsContext>(() => new class implements HxTabsContext {
		private events = new EventEmitter();

		getActive(callback: (index: number, mark: (string | null | undefined)) => void): void {
			this.events.emit('get-active', callback);
		}

		onGetActive(listener: (callback: (index: number, mark: (string | null | undefined)) => void) => void): void {
			this.events.on('get-active', listener);
		}

		offGetActive(listener: (callback: (index: number, mark: (string | null | undefined)) => void) => void): void {
			this.events.off('get-active', listener);
		}

		checkActive(markOrIndex: string | number, callback: (active: boolean) => void): void {
			this.events.emit('check-active', markOrIndex, callback);
		}

		onCheckActive(listener: (markOrIndex: string | number, callback: (active: boolean) => void) => void): void {
			this.events.on('check-active', listener);
		}

		offCheckActive(listener: (markOrIndex: string | number, callback: (active: boolean) => void) => void): void {
			this.events.off('check-active', listener);
		}

		checkActiveable(index: number, mark: string | null | undefined, callback: (activeable: boolean) => void): void {
			this.events.emit('check-activeable', index, mark, callback);
		}

		onCheckActiveable(listener: (index: number, mark: (string | null | undefined), callback: (activeable: boolean) => void) => void): void {
			this.events.on('check-activeable', listener);
		}

		offCheckActiveable(listener: (index: number, mark: (string | null | undefined), callback: (activeable: boolean) => void) => void): void {
			this.events.off('check-activeable', listener);
		}

		active(markOrIndex: string | number): void {
			this.events.emit('active', markOrIndex);
		}

		onActive(listener: (markOrIndex: (string | number)) => void): void {
			this.events.on('active', listener);
		}

		offActive(listener: (markOrIndex: (string | number)) => void): void {
			this.events.off('active', listener);
		}

		doActive(index: number, mark: string | null | undefined): void {
			this.events.emit('do-active', index, mark);
		}

		onDoActive(listener: (index: number, mark: (string | null | undefined)) => void): void {
			this.events.on('do-active', listener);
		}

		offDoActive(listener: (index: number, mark: (string | null | undefined)) => void): void {
			this.events.off('do-active', listener);
		}

		activeChanged(active: boolean, index: number, mark: string | null | undefined): void {
			this.events.emit('active-changed', active, index, mark);
		}

		onActiveChanged(listener: (active: boolean, index: number, mark: string | null | undefined) => void): void {
			this.events.on('active-changed', listener);
		}

		offActiveChanged(listener: (active: boolean, index: number, mark: string | null | undefined) => void): void {
			this.events.off('active-changed', listener);
		}
	});

	return <Context.Provider value={tabsContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxTabs = () => useContext(Context);
