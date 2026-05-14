// @ts-expect-error import React
import React, {type MutableRefObject, type ReactNode, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {HxLabel} from '../label';
import {HxCheckMessage} from '../with-check';
import type {HxUploadingFile, HxUploadInnerProps} from './types';
import {useHxUpload} from './upload-provider';

export interface UploadErrorProps<T extends object> {
	allProps: HxUploadInnerProps<T>;
	uploadingFilesRef: MutableRefObject<Array<HxUploadingFile>>;
}

export const UploadError = <T extends object>(props: UploadErrorProps<T>) => {
	// TODO
	//  1. not sure that the uploading files should be counted in or not
	//     when enable the $check, because of uploading files is still on the way, so no reason count them into file count check
	//     because of this, the passed-in uploadingFilesRef is ignored now.
	//  2. there is one more issue, which is when single file mode, after pick a new file,
	//     value will be changed to empty array before the new file uploaded,
	//     which leads the require check, so is it reasonable and not leads user confusing?
	const {allProps/*, uploadingFilesRef*/} = props;
	const {$model, $withCheck, $check, $supplyOn, alwaysKeepMessageDOM, $domCheckMsg} = allProps;

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

	/* eslint-disable react-hooks/refs */
	return <>
		{errorRef.current != null
			? <HxLabel text={errorRef.current}
			           data-hx-upload-error-msg="" data-hx-label-check-msg=""/>
			: (void 0)}
		{$withCheck
			? <HxCheckMessage {...$domCheckMsg} $model={$model}
				// @ts-expect-error ignore the generic type check
				              $check={$check}
				              $checkProps={allProps}
				// @ts-expect-error ignore the generic type check
				              $supplyOn={$supplyOn}
				              alwaysKeepMessageDOM={alwaysKeepMessageDOM}/>
			: (void 0)}
	</>;
};
