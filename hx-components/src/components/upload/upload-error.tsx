import type {ModelPath} from '@hx/data';
// @ts-expect-error import React
import React, {type MutableRefObject, type ReactNode, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {HxDataPath, HxObject} from '../../types';
import {HxLabel} from '../label';
import type {HxUploadingFile} from './types';
import {useHxUpload} from './upload-provider';

export interface UploadErrorProps<T> {
	$model: HxObject<T>;
	$field: ModelPath<T> | HxDataPath;
	uploadingFilesRef: MutableRefObject<Array<HxUploadingFile>>;
}

export const UploadError = <T extends object>(props: UploadErrorProps<T>) => {
	const {
		// $model, $field,
		// uploadingFilesRef
	} = props;

	const context = useHxContext();
	const uploadContext = useHxUpload();
	const errorRef = useRef<ReactNode | undefined>();
	useEffect(() => {
		const onRaiseError = (error: ReactNode) => {
			errorRef.current = error;
			context.forceUpdate();
		};
		const onClearError = () => {
			delete errorRef.current;
			context.forceUpdate();
		};

		uploadContext.onRaiseError(onRaiseError);
		uploadContext.onClearError(onClearError);
		return () => {
			uploadContext.offRaiseError(onRaiseError);
			uploadContext.offClearError(onClearError);
		};
	}, [context, uploadContext]);

	if (errorRef.current == null) {
		return (void 0);
	}

	// eslint-disable-next-line react-hooks/refs
	return <HxLabel text={errorRef.current}
	                data-hx-upload-error-msg="" data-hx-label-check-msg=""/>;
};