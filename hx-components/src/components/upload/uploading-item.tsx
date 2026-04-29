// @ts-expect-error import React
import React from 'react';
import {HxButton} from '../button';
import {Download, Trash} from '../icons';
import {HxLabel} from '../label';
import type {HxUploadDownloadFileFunc, HxUploadFile, HxUploadListVariant, HxUploadUploading} from './types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HxUploadingFile extends HxUploadUploading {
}

export interface HxUploadingItemProps<T extends object> {
	maxFileSize: number;
	file: HxUploadingFile | HxUploadFile;
	listVariant: HxUploadListVariant;
	download: HxUploadDownloadFileFunc<T>;
	disabled: boolean;
}

export const HxUploadingItem = <T extends object>(props: HxUploadingItemProps<T>) => {
	const {
		// maxFileSize,
		file,
		listVariant // download,
		// disabled
	} = props;

	if (listVariant === 'list') {
		return <div data-hx-upload-file="">
			<HxLabel text={file.name}/>
			<HxLabel text={file.size}/>
			<HxButton text={<Trash/>}/>
			<HxButton text={<Download/>}/>
		</div>;
	} else {
		return <></>;
	}
};
