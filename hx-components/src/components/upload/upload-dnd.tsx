// @ts-expect-error import React
import React, {type ReactNode} from 'react';
import {AnyUtils} from '../../utils';
import {HxFlex} from '../flex';
import {Archive} from '../icons';
import {HxLabel} from '../label';

export interface UploadDndProps {
	fileInput: ReactNode,
	filesContent: ReactNode,
	uploadingError: ReactNode,
	dndUploadKey: ReactNode,
	dndDescKey: ReactNode,
	disabled: boolean;
}

export const UploadDnd = (props: UploadDndProps) => {
	const {
		fileInput, filesContent, uploadingError,
		dndUploadKey, dndDescKey,
		disabled
	} = props;

	return <>
		<HxFlex direction="dir-y"
		        alignItems="center" justifyContent="center"
		        paddingX="xl" paddingT="md" paddingB="md"
		        data-hx-upload-trigger="dnd"
		        data-hx-disabled={(disabled ?? false) ? '' : (void 0)}>
			{fileInput}
			<HxLabel text={<Archive/>}/>
			<HxLabel text={dndUploadKey}/>
			{!AnyUtils.isEmpty(dndDescKey, true)
				? <HxLabel text={dndDescKey} data-hx-upload-dnd-desc=""/>
				: (void 0)}
			{uploadingError}
		</HxFlex>
		<div data-hx-upload-dnd-bottom-border=""/>
		<HxFlex direction="dir-y"
		        alignItems="start" justifyContent="center"
		        paddingX="xl" paddingT="md" paddingB="md"
		        data-hx-upload-files="">
			{filesContent}
		</HxFlex>
	</>;
};