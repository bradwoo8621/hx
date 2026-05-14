// @ts-expect-error import React
import React, {type ReactNode} from 'react';
import {HxButton, type HxButtonVariant} from '../button';
import {HxFlex} from '../flex';
import {Upload} from '../icons';
import {HxLabel} from '../label';
import type {HxUploadColor} from './types';

export interface UploadButtonProps {
	fileInput: ReactNode,
	filesContent: ReactNode,
	uploadingError: ReactNode;
	onUploadClick: () => void;
	variant: HxButtonVariant;
	color: HxUploadColor;
	buttonUploadKey: ReactNode,
	disabled: boolean;
}

export const UploadButton = (props: UploadButtonProps) => {
	const {
		fileInput, filesContent, uploadingError,
		onUploadClick,
		color, variant,
		buttonUploadKey,
		disabled
	} = props;

	return <>
		{fileInput}
		<HxButton text={<>
			<HxLabel text={<Upload/>} data-hx-margin-r="md"/>
			<HxLabel text={buttonUploadKey}/>
		</>} color={color} variant={variant} $disabled={disabled}
		          onClick={onUploadClick}
		          data-hx-upload-trigger="button"/>
		{uploadingError}
		<HxFlex direction="dir-y"
		        alignItems="start" justifyContent="center"
		        paddingT="xs" paddingB="xs"
		        data-hx-upload-files="">
			{filesContent}
		</HxFlex>
	</>;
};