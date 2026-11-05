// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';
import type {HxUploadedFile, HxUploadFile, HxUploadingFile} from './types';

export interface HxUploadContext extends HxReactContext {
	/**
	 * Notify listeners that an uploading file has finished, replacing it with the uploaded file
	 * @param oldDetails - Details of the file before upload
	 * @param newDetails - Details returned by the upload function, which may differ from the old ones
	 */
	fileUploaded(oldDetails: HxUploadFile, newDetails: HxUploadFile): void;

	/**
	 * Register a listener for completed uploads
	 * @param listener - Callback function called with the old and new file details
	 */
	onFileUploaded(listener: (oldDetails: HxUploadFile, newDetails: HxUploadFile) => void): void;

	/**
	 * Remove a listener for completed uploads
	 * @param listener - Previously registered listener function
	 */
	offFileUploaded(listener: (oldDetails: HxUploadFile, newDetails: HxUploadFile) => void): void;

	/**
	 * Notify listeners that a file was deleted
	 * @param details - Details of the deleted file, either still uploading or already uploaded
	 */
	fileDeleted(details: HxUploadingFile | HxUploadedFile): void;

	/**
	 * Register a listener for file deletions
	 * @param listener - Callback function called with the deleted file details
	 */
	onFileDeleted(listener: (details: HxUploadingFile | HxUploadedFile) => void): void;

	/**
	 * Remove a listener for file deletions
	 * @param listener - Previously registered listener function
	 */
	offFileDeleted(listener: (details: HxUploadingFile | HxUploadedFile) => void): void;

	/**
	 * Notify listeners that the displayed error should be cleared
	 */
	clearError(): void;

	/**
	 * Register a listener for error clear requests
	 * @param listener - Callback function called when the error should be cleared
	 */
	onClearError(listener: () => void): void;

	/**
	 * Remove a listener for error clear requests
	 * @param listener - Previously registered listener function
	 */
	offClearError(listener: () => void): void;

	/**
	 * Notify listeners that an error should be displayed
	 * @param error - Error content to display
	 */
	raiseError(error: ReactNode): void;

	/**
	 * Register a listener for error display requests
	 * @param listener - Callback function called with the error content
	 */
	onRaiseError(listener: (error: ReactNode) => void): void;

	/**
	 * Remove a listener for error display requests
	 * @param listener - Previously registered listener function
	 */
	offRaiseError(listener: (error: ReactNode) => void): void;
}

const Context = createHxReactContext<HxUploadContext>('HxUploadContext');

export const HxUploadProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [uploadContext] = useState<HxUploadContext>(() => new class extends AbstractHxReactContext implements HxUploadContext {
		/** @inheritdoc */
		fileUploaded(oldDetails: HxUploadFile, newDetails: HxUploadFile): void {
			this.emit('file-uploaded', oldDetails, newDetails);
		}

		/** @inheritdoc */
		onFileUploaded(listener: (oldDetails: HxUploadFile, newDetails: HxUploadFile) => void): void {
			this.on('file-uploaded', listener);
		}

		/** @inheritdoc */
		offFileUploaded(listener: (oldDetails: HxUploadFile, newDetails: HxUploadFile) => void): void {
			this.off('file-uploaded', listener);
		}

		/** @inheritdoc */
		fileDeleted(file: HxUploadingFile | HxUploadedFile): void {
			this.emit('file-deleted', file);
		}

		/** @inheritdoc */
		onFileDeleted(listener: (file: HxUploadingFile | HxUploadedFile) => void): void {
			this.on('file-deleted', listener);
		}

		/** @inheritdoc */
		offFileDeleted(listener: (file: HxUploadingFile | HxUploadedFile) => void): void {
			this.off('file-deleted', listener);
		}

		/** @inheritdoc */
		clearError(): void {
			this.emit('clear-error');
		}

		/** @inheritdoc */
		onClearError(listener: () => void): void {
			this.on('clear-error', listener);
		}

		/** @inheritdoc */
		offClearError(listener: () => void): void {
			this.off('clear-error', listener);
		}

		/** @inheritdoc */
		raiseError(error: ReactNode): void {
			this.emit('error', error);
		}

		/** @inheritdoc */
		onRaiseError(listener: (error: ReactNode) => void): void {
			this.on('error', listener);
		}

		/** @inheritdoc */
		offRaiseError(listener: (error: ReactNode) => void): void {
			this.off('error', listener);
		}
	});

	return <Context.Provider value={uploadContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxUpload = () => useContext(Context);
