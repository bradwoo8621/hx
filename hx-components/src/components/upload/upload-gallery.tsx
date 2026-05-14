// @ts-expect-error import React
import React, {type KeyboardEventHandler, type MouseEventHandler, type ReactNode} from 'react';
import {HxFlex} from '../flex';
import {Plus} from '../icons';
import {HxLabel} from '../label';
import type {HxUploadColor} from './types';

export interface UploadGalleryProps {
	fileInput: ReactNode;
	filesContent: ReactNode;
	uploadingError: ReactNode;
	onUploadClick: () => void;
	color: HxUploadColor;
	galleryUploadKey: ReactNode,
	disabled: boolean;
}

export const UploadGallery = (props: UploadGalleryProps) => {
	const {
		fileInput, filesContent, uploadingError,
		onUploadClick,
		color,
		galleryUploadKey,
		disabled
	} = props;

	const onClick: MouseEventHandler<HTMLDivElement> = () => {
		if (disabled) {
			return;
		}

		onUploadClick();
	};
	const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (ev) => {
		if (disabled) {
			return;
		}
		switch (ev.key) {
			case ' ': {
				onUploadClick();
				ev.preventDefault();
				break;
			}
		}
	};

	return <>
		{fileInput}
		{filesContent}
		<HxFlex tabIndex={disabled ? -1 : 0} role="button" alignItems="center" justifyContent="center"
		        data-hx-upload-color={color}
		        data-hx-upload-trigger="gallery"
		        data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		        onClick={onClick} onKeyDown={onKeyDown}>
			<HxLabel text={<Plus/>}/>
			<HxLabel text={galleryUploadKey}/>
		</HxFlex>
		{uploadingError}
	</>;
};