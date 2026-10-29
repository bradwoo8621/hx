import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {HxUploadedFile, HxUploadFile, HxUploadingFile} from './types';

export interface HxUploadContext {
	fileUploaded(oldDetails: HxUploadFile, newDetails: HxUploadFile): void;
	onFileUploaded(listener: (oldDetails: HxUploadFile, newDetails: HxUploadFile) => void): void;
	offFileUploaded(listener: (oldDetails: HxUploadFile, newDetails: HxUploadFile) => void): void;
	fileDeleted(details: HxUploadingFile | HxUploadedFile): void;
	onFileDeleted(listener: (details: HxUploadingFile | HxUploadedFile) => void): void;
	offFileDeleted(listener: (details: HxUploadingFile | HxUploadedFile) => void): void;
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

		fileUploaded(oldDetails: HxUploadFile, newDetails: HxUploadFile): void {
			this.events.emit('file-uploaded', oldDetails, newDetails);
		}

		onFileUploaded(listener: (oldDetails: HxUploadFile, newDetails: HxUploadFile) => void): void {
			this.events.on('file-uploaded', listener);
		}

		offFileUploaded(listener: (oldDetails: HxUploadFile, newDetails: HxUploadFile) => void): void {
			this.events.off('file-uploaded', listener);
		}

		fileDeleted(file: HxUploadingFile | HxUploadedFile): void {
			this.events.emit('file-deleted', file);
		}

		onFileDeleted(listener: (file: HxUploadingFile | HxUploadedFile) => void): void {
			this.events.on('file-deleted', listener);
		}

		offFileDeleted(listener: (file: HxUploadingFile | HxUploadedFile) => void): void {
			this.events.off('file-deleted', listener);
		}

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
