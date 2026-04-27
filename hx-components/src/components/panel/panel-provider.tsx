import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';

export interface HxPanelContext {
	checkCollapsed(callback: (collapsed: boolean) => void): void;
	onCheckCollapsed(listener: (callback: (collapsed: boolean) => void) => void): void;
	offCheckCollapsed(listener: (callback: (collapsed: boolean) => void) => void): void;
	collapse(): void;
	onCollapse(listener: () => void): void;
	offCollapse(listener: () => void): void;
	expand(): void;
	onExpand(listener: () => void): void;
	offExpand(listener: () => void): void;
}

const Context = createContext<HxPanelContext>({} as HxPanelContext);
Context.displayName = 'HxPanelContext';

export const HxPanelProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [panelContext] = useState<HxPanelContext>(() => new class implements HxPanelContext {
		private events = new EventEmitter();

		checkCollapsed(callback: (collapsed: boolean) => void): void {
			this.events.emit('check-collapsed', callback);
		}

		onCheckCollapsed(listener: (callback: (collapsed: boolean) => void) => void): void {
			this.events.on('check-collapsed', listener);
		}

		offCheckCollapsed(listener: (callback: (collapsed: boolean) => void) => void): void {
			this.events.off('check-collapsed', listener);
		}

		collapse(): void {
			this.events.emit('collapse');
		}

		onCollapse(listener: () => void): void {
			this.events.on('collapse', listener);
		}

		offCollapse(listener: () => void): void {
			this.events.off('collapse', listener);
		}

		expand(): void {
			this.events.emit('expand');
		}

		onExpand(listener: () => void): void {
			this.events.on('expand', listener);
		}

		offExpand(listener: () => void): void {
			this.events.off('expand', listener);
		}
	});

	return <Context.Provider value={panelContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxPanel = () => useContext(Context);
