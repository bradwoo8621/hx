import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ChangeEvent,
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type ReactElement,
	type ReactNode,
	type RefAttributes,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxWidthConstrainedProps
} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {HxButton} from '../button';
import {HxFlex} from '../flex';
import {Archive, Plus, Upload} from '../icons';
import {HxLabel} from '../label';
import {HxUploadDefaults} from './defaults';
import type {
	HxUploadColor,
	HxUploadDownloadFileFunc,
	HxUploadFile,
	HxUploadListVariant,
	HxUploadReadDataFunc,
	HxUploadTriggerVariant,
	HxUploadUploadFilesFunc,
	HxUploadWriteDataFunc
} from './types';
import {type HxUploadingFile, HxUploadingItem} from './uploading-item';

export interface HxExtUploadProps<T extends object> extends HxEditSingleFieldProps<T>, HxWidthConstrainedProps {
	color?: HxUploadColor;
	triggerVariant?: HxUploadTriggerVariant;
	/** ignore when trigger variant is dnd, treated as list */
	listVariant?: HxUploadListVariant;
	maxFileCount?: number;
	maxFileSize?: number;
	/** https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file#accept */
	accept?: string | Array<string>;
	/** https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file#capture */
	capture?: boolean;
	read?: HxUploadReadDataFunc<T>;
	write?: HxUploadWriteDataFunc<T>;
	/**
	 * upload selected files (could be one file, depends on max file count and selection).
	 * returns an array immediately, each element contains the file and an asynchronized function,
	 * component do the following based on returned array:
	 * - append the selected files to list
	 * - show the uploading status
	 */
	upload: HxUploadUploadFilesFunc<T>;
	download: HxUploadDownloadFileFunc<T>;
	buttonUploadKey?: ReactNode;
	galleryUploadKey?: ReactNode;
	dndUploadKey?: ReactNode;
	dndDescKey?: ReactNode;
}

export type OmittedUploadHTMLProps = HxOmittedAttributes;

export type HxUploadProps<T extends object> =
	& HxExtUploadProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedUploadHTMLProps, T>;

export type HxUploadType = <T extends object>(
	props: HxUploadProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxUpload =
	forwardRef(<T extends object>(props: HxUploadProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			color = HxUploadDefaults.color,
			triggerVariant = HxUploadDefaults.triggerVariant, listVariant = HxUploadDefaults.listVariant,
			maxFileCount: givenMaxFileCount, maxFileSize = Infinity, accept: givenAccept, capture,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			read, write, upload, download,
			buttonUploadKey = HxUploadDefaults.buttonUploadKey,
			galleryUploadKey = HxUploadDefaults.galleryUploadKey,
			dndUploadKey = HxUploadDefaults.dndUploadKey, dndDescKey = HxUploadDefaults.dndDescKey,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);
		const uploadingRef = useRef<Array<HxUploadingFile>>([]);

		const maxFileCount = (givenMaxFileCount == null || givenMaxFileCount <= 0) ? Infinity : givenMaxFileCount;
		const onFileChange = async (ev: ChangeEvent<HTMLInputElement>) => {
			const files = ev.target.files;
			if (files == null) {
				return;
			}
			const uploading = upload(Array.from(files), $model, context);
			uploadingRef.current.push(...uploading);
			context.forceUpdate();
		};

		let accept: string | undefined = (void 0);
		if (givenAccept != null) {
			if (Array.isArray(givenAccept)) {
				accept = givenAccept.filter(accept => accept != null && accept.trim().length !== 0).join(',');
			} else {
				accept = givenAccept.trim();
			}
			if (accept.length === 0) {
				accept = (void 0);
			}
		}

		const value = ERO.getValue($model, $field);
		const uploadedFiles: Array<HxUploadFile> = (read != null ? read?.($model, $field, value) : value) ?? [];
		// eslint-disable-next-line react-hooks/refs
		const files = [...uploadedFiles, ...uploadingRef.current];
		const filesContent = <>
			{ // eslint-disable-next-line react-hooks/refs
				files.map((file, index) => {
					return <HxUploadingItem maxFileSize={maxFileSize}
					                        file={file}
					                        listVariant={listVariant}
					                        download={download}
					                        disabled={disabled}
					                        key={`${file.name}-${index}`}/>;
				})
			}
		</>;

		let content: ReactNode;
		if (triggerVariant === 'dnd') {
			// dnd
			content = <>
				<HxFlex direction="dir-y"
				        alignItems="center" justifyContent="center"
				        paddingX="xl" paddingT="md" paddingB="md"
				        data-hx-upload-trigger="dnd"
				        data-hx-disabled={(disabled ?? false) ? '' : (void 0)}>
					<HxLabel text={<Archive/>}/>
					<HxLabel text={dndUploadKey}/>
					{((typeof dndDescKey === 'string' && dndDescKey.trim().length !== 0) || dndDescKey != null)
						? <HxLabel text={dndDescKey} data-hx-upload-dnd-desc=""/>
						: (void 0)}
				</HxFlex>
				<HxFlex direction="dir-y"
				        alignItems="start" justifyContent="center"
				        paddingX="xl" paddingT="md" paddingB="md"
				        data-hx-upload-files="">
					{filesContent}
				</HxFlex>
			</>;
		} else if (listVariant === 'list') {
			// button
			content = <>
				<HxButton text={<>
					<HxLabel text={<Upload/>} data-hx-margin-r="md"/>
					<HxLabel text={buttonUploadKey}/>
				</>} color={color} variant={triggerVariant} $disabled={disabled}
				          data-hx-upload-trigger="button"/>
				<HxFlex direction="dir-y"
				        alignItems="start" justifyContent="center"
				        paddingX="xl" paddingT="md" paddingB="md"
				        data-hx-upload-files="">
					{filesContent}
				</HxFlex>
			</>;
		} else {
			// gallery
			content = <>
				{filesContent}
				<HxFlex alignItems="center" justifyContent="center"
				        data-hx-upload-color={color}
				        data-hx-upload-trigger="gallery"
				        data-hx-disabled={(disabled ?? false) ? '' : (void 0)}>
					<HxLabel text={<Plus/>}/>
					<HxLabel text={galleryUploadKey}/>
				</HxFlex>
			</>;
		}
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            data-hx-upload=""
		            data-hx-upload-color={color}
		            data-hx-upload-trigger-variant={triggerVariant} data-hx-upload-list-variant={listVariant}
		            data-hx-visible={(visible ?? true) ? '' : 'no'}
		            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		            ref={ref}>
			<input type="file" multiple={maxFileCount > 1}
			       accept={accept} capture={capture}
			       onChange={onFileChange}
			       data-hx-upload=""/>
			{content}
		</div>;
	}) as unknown as HxUploadType;
// @ts-expect-error assign component name
HxUpload.displayName = 'HxUpload';
