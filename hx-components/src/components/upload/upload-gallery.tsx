// @ts-expect-error import React
import React, {type ReactNode} from 'react';
import {HxFlex} from '../flex';
import {Plus} from '../icons';
import {HxLabel} from '../label';
import type {HxUploadColor} from './types';

export interface UploadGalleryProps {
	fileInput: ReactNode,
	filesContent: ReactNode,
	onUploadClick: () => void;
	color: HxUploadColor;
	galleryUploadKey: ReactNode,
	disabled: boolean;
}

export const UploadGallery = (props: UploadGalleryProps) => {
	const {
		fileInput, filesContent,
		onUploadClick,
		color,
		galleryUploadKey,
		disabled
	} = props;

	return <>
		{fileInput}
		{filesContent}
		<HxFlex alignItems="center" justifyContent="center"
		        data-hx-upload-color={color}
		        data-hx-upload-trigger="gallery"
		        data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		        onClick={onUploadClick}>
			<HxLabel text={<Plus/>}/>
			<HxLabel text={galleryUploadKey}/>
		</HxFlex>
	</>;
};