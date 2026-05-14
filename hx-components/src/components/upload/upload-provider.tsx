import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';

export interface HxUploadContext {
	clearError(): void;
	onClearError(listener: () => void): void;
	offClearError(listener: () => void): void;
	raiseError(error: ReactNode): void;
	onRaiseError(listener: (error: ReactNode) => void): void;
	offRaiseError(listener: (error: ReactNode) => void): void;
}

const Context = createContext<HxUploadContext>({} as HxUploadContext);
Context.displayName = 'HxUploadContext';

export const HxUploadProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [uploadContext] = useState<HxUploadContext>(() => new class implements HxUploadContext {
		private events = new EventEmitter();

		clearError(): void {
			this.events.emit('clear-error');
		}

		onClearError(listener: () => void): void {
			this.events.on('clear-error', listener);
		}

		offClearError(listener: () => void): void {
			this.events.off('clear-error', listener);
		}

		raiseError(error: ReactNode): void {
			this.events.emit('error', error);
		}

		onRaiseError(listener: (error: ReactNode) => void): void {
			this.events.on('error', listener);
		}

		offRaiseError(listener: (error: ReactNode) => void): void {
			this.events.off('error', listener);
		}
	});

	return <Context.Provider value={uploadContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxUpload = () => useContext(Context);
