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
	useEffect,
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
import {exposePropsToDOM, HxConsole} from '../../utils';
import {HxButton} from '../button';
import {HxFlex} from '../flex';
import {Archive, Plus, Upload} from '../icons';
import {HxLabel} from '../label';
import {HxUploadDefaults} from './defaults';
import type {
	HxUploadColor,
	HxUploadDownloadFileFunc,
	HxUploadFile,
	HxUploadingFile,
	HxUploadReadDataFunc,
	HxUploadUploadFilesFunc,
	HxUploadVariant,
	HxUploadWriteDataFunc
} from './types';
import {HxUploadingItem} from './uploading-item';

export interface HxExtUploadProps<T extends object> extends HxEditSingleFieldProps<T>, HxWidthConstrainedProps {
	color?: HxUploadColor;
	variant?: HxUploadVariant;
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
	/**
	 * download file, implement it all by yourself.
	 * e.g. open a new tab to show the file if the file can be open directly in browser,
	 * or just start to download directly.
	 */
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
			color = HxUploadDefaults.color, variant = HxUploadDefaults.variant,
			maxFileCount: givenMaxFileCount, maxFileSize = Infinity, accept: givenAccept, capture,
			read, write, upload, download,
			buttonUploadKey = HxUploadDefaults.buttonUploadKey,
			galleryUploadKey = HxUploadDefaults.galleryUploadKey,
			dndUploadKey = HxUploadDefaults.dndUploadKey, dndDescKey = HxUploadDefaults.dndDescKey,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);
		const fileInputRef = useRef<HTMLInputElement>(null);
		const uploadingRef = useRef<Array<HxUploadingFile>>([]);
		useEffect(() => {
			if (variant !== 'gallery') {
				return;
			}
			let warn = false;
			if (givenAccept == null) {
				warn = true;
			}
			if (warn) {
				console.group('%c㊙️ HxUpload in gallery mode requires specifying the accept type, and the accept types must all be image formats.', HxConsole.warnMessageStyle);
				console.table({
					JPEG: {'MIME Type': 'image/jpeg, image/jpg', Extension: '.jpeg, .jpg'},
					PNG: {'MIME Type': 'image/png', Extension: '.png'},
					GIF: {'MIME Type': 'image/gif', Extension: '.gif'},
					WEBP: {'MIME Type': 'image/webp', Extension: '.webp'},
					BMP: {'MIME Type': 'image/bmp', Extension: '.bmp'},
					APNG: {'MIME Type': 'image/apng', Extension: '.apng'},
					AVIF: {'MIME Type': 'image/avif', Extension: '.avif'}
				});
				console.groupEnd();
			}
		}, [variant, givenAccept]);

		const maxFileCount = (givenMaxFileCount == null || givenMaxFileCount <= 0) ? Infinity : givenMaxFileCount;
		const onFileChange = async (ev: ChangeEvent<HTMLInputElement>) => {
			const files = ev.target.files;
			if (files == null) {
				return;
			}
			const uploading = upload(Array.from(files), $model, context);
			uploadingRef.current.push(...uploading);
			context.forceUpdate();
			// clear the files
			ev.target.value = '';
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
		const fileInput = <input type="file"
		                         multiple={maxFileCount > 1} accept={accept} capture={capture} title=""
		                         onChange={onFileChange}
		                         data-hx-upload=""
		                         ref={fileInputRef}/>;

		const readValue = (): Array<HxUploadFile> => {
			const value = ERO.getValue($model, $field);
			return (read != null ? read?.($model, $field, value, context) : value) ?? [];
		};

		const uploadedFiles = readValue();
		// eslint-disable-next-line react-hooks/refs
		const files = [...uploadedFiles, ...uploadingRef.current];
		const filesContent = <>
			{ // eslint-disable-next-line react-hooks/refs
				files.map((file, index) => {
					const onUploaded = () => {
						// @ts-expect-error ignore the type check
						const index = uploadingRef.current.indexOf(file);
						if (index !== -1) {
							// no need to rerender, uploading item component will hide by itself
							uploadingRef.current.splice(index, 1);
						}
						const {
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							percentageSupport, func, abort,
							...rest
						} = file as HxUploadingFile;
						// no need to rerender, uploading item component will refresh by itself
						const files = [...readValue(), rest];
						if (write != null) {
							write($model, $field, files, context);
						} else {
							ERO.setValue($model, $field, files);
						}
					};
					const onDelete = () => {
						// Because the data has already been removed from the uploading reference,
						// it naturally won't be displayed the next time it's refreshed.
						// @ts-expect-error ignore the type check
						let index = uploadingRef.current.indexOf(file);
						if (index !== -1) {
							// no need to rerender, uploading item component will hide by itself
							uploadingRef.current.splice(index, 1);
							return;
						}
						// check the uploaded files
						const uploadedFiles = readValue();
						index = uploadedFiles.indexOf(file);
						if (index !== -1) {
							const files = [...uploadedFiles.slice(index)];
							if (write != null) {
								write($model, $field, files, context);
							} else {
								ERO.setValue($model, $field, files);
							}
						}
					};
					return <HxUploadingItem $model={$model} file={file} maxFileSize={maxFileSize}
					                        onDownload={download} onUploaded={onUploaded} onDelete={onDelete}
					                        variant={variant} disabled={disabled}
					                        key={`${file.name}-${index}`}/>;
				})
			}
		</>;

		const onUploadClick = () => {
			if (!visible || disabled || fileInputRef.current == null) {
				return;
			}
			fileInputRef.current.click();
		};
		let content: ReactNode;
		if (variant === 'dnd') {
			// dnd
			content = <>
				<HxFlex direction="dir-y"
				        alignItems="center" justifyContent="center"
				        paddingX="xl" paddingT="md" paddingB="md"
				        data-hx-upload-trigger="dnd"
				        data-hx-disabled={(disabled ?? false) ? '' : (void 0)}>
					{fileInput}
					<HxLabel text={<Archive/>}/>
					<HxLabel text={dndUploadKey}/>
					{((typeof dndDescKey === 'string' && dndDescKey.trim().length !== 0) || dndDescKey != null)
						? <HxLabel text={dndDescKey} data-hx-upload-dnd-desc=""/>
						: (void 0)}
				</HxFlex>
				<div data-hx-upload-dnd-bottom-border=""/>
				<HxFlex direction="dir-y"
				        alignItems="start" justifyContent="center"
				        paddingX="xl" paddingT="md" paddingB="md"
				        data-hx-upload-files="">
					{filesContent}
				</HxFlex>
			</>;
		} else if (variant === 'gallery') {
			// gallery
			content = <>
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
		} else {
			// button
			content = <>
				{fileInput}
				<HxButton text={<>
					<HxLabel text={<Upload/>} data-hx-margin-r="md"/>
					<HxLabel text={buttonUploadKey}/>
				</>} color={color} variant={variant} $disabled={disabled}
				          onClick={onUploadClick}
				          data-hx-upload-trigger="button"/>
				<HxFlex direction="dir-y"
				        alignItems="start" justifyContent="center"
				        paddingT="xs" paddingB="xs"
				        data-hx-upload-files="">
					{filesContent}
				</HxFlex>
			</>;
		}
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            data-hx-upload=""
		            data-hx-upload-color={color}
		            data-hx-upload-variant={['dnd', 'gallery'].includes(variant) ? variant : 'button'}
		            data-hx-visible={(visible ?? true) ? '' : 'no'}
		            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		            ref={ref}>
			{content}
		</div>;
	}) as unknown as HxUploadType;
// @ts-expect-error assign component name
HxUpload.displayName = 'HxUpload';
