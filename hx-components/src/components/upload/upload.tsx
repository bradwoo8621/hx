import {ERO} from '@hx/data';
import {nanoid} from 'nanoid';
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
import {type HxUploadedFile, HxUploadingItem} from './uploading-item';

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
			maxFileCount: givenMaxFileCount, maxFileSize: givenMaxFileSize = Infinity, accept: givenAccept, capture,
			read, write, upload, download,
			buttonUploadKey = HxUploadDefaults.buttonUploadKey,
			galleryUploadKey = HxUploadDefaults.galleryUploadKey,
			dndUploadKey = HxUploadDefaults.dndUploadKey, dndDescKey = HxUploadDefaults.dndDescKey,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);
		const fileInputRef = useRef<HTMLInputElement>(null);
		const uploadingFilesRef = useRef<Array<HxUploadingFile>>([]);
		// tracks every visible file (uploaded + uploading) paired with a stable React key.
		// keys are assigned once via nanoid and reused across renders so React doesn't remount items.
		const allFileKeysRef = useRef<Array<[HxUploadedFile | HxUploadingFile, string]>>([]);
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
					AVIF: {'MIME Type': 'image/avif', Extension: '.avif'},
					'Any Image': {'MIME Type': 'image/*'}
				});
				console.groupEnd();
			}
		}, [variant, givenAccept]);

		const maxFileCount = (givenMaxFileCount == null || givenMaxFileCount <= 0) ? Infinity : givenMaxFileCount;
		const maxFileSize = givenMaxFileSize <= 0 ? Infinity : givenMaxFileSize;
		// resolve the current list of already-uploaded files.
		// uses the custom `read` transform when provided, otherwise reads directly from the model.
		const readValue = (): Array<HxUploadFile> => {
			const value = ERO.getValue($model, $field);
			return (read != null ? read?.($model, $field, value, context) : value) ?? [];
		};

		// file input change handler: validate count, call upload() to build HxUploadingFile entries,
		// push them into the uploading ref so they render immediately, then forceUpdate.
		const onFileChange = async (ev: ChangeEvent<HTMLInputElement>) => {
			const files = ev.target.files;
			if (files == null) {
				return;
			}
			const uploadedFileCount = readValue().length;
			const remainFileCount = maxFileCount - uploadingFilesRef.current.length - uploadedFileCount;
			if (files.length > remainFileCount) {
				// clear the files
				ev.target.value = '';
				// TODO report the over max file count error
				return;
			}
			let uploading: Array<HxUploadingFile>;
			try {
				uploading = await upload(Array.from(files), $model, context);
			} catch {
				// clear the files
				ev.target.value = '';
				// TODO report the uploading files data constructing error
				return;
			}
			// handle the uploading result, which needs to be rendered
			uploadingFilesRef.current.push(...uploading);
			allFileKeysRef.current.push(...uploading.map(file => {
				return [file, nanoid(10)] as [HxUploadingFile, string];
			}));
			context.forceUpdate();
			// clear the files
			ev.target.value = '';
		};

		// normalize the accept prop: join array values, trim, and treat empty string as undefined
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
		                         disabled={disabled}
		                         onChange={onFileChange}
		                         data-hx-upload=""
		                         ref={fileInputRef}/>;

		const uploadedFiles = readValue().map<HxUploadedFile>(file => {
			return {details: file};
		});
		// eslint-disable-next-line react-hooks/refs
		const allFiles: Array<HxUploadedFile | HxUploadingFile> = [...uploadedFiles, ...uploadingFilesRef.current];
		// build the file keys ref based on current files
		// eslint-disable-next-line react-hooks/refs
		const keysMap = allFileKeysRef.current.reduce((map, [file, key]) => {
			map.set(file, key);
			return map;
		}, new Map<HxUploadedFile | HxUploadingFile, string>);
		// eslint-disable-next-line react-hooks/refs
		allFileKeysRef.current = allFiles.map(file => {
			return [file, keysMap.get(file) ?? nanoid(10)];
		});
		const filesContent = <>
			{ // eslint-disable-next-line react-hooks/refs
				allFiles.map((file, index) => {
					// called by HxUploadingItem once upload succeeds.
					// removes the file from the uploading ref, appends it to the persisted file list,
					// and writes back via the custom `write` transform or directly to the model.
					const onUploaded = (details: HxUploadFile) => {
						// @ts-expect-error ignore the type check
						const index = uploadingFilesRef.current.indexOf(file);
						if (index !== -1) {
							// no need to rerender, uploading item component will hide by itself
							uploadingFilesRef.current.splice(index, 1);
							const keyIndex = allFileKeysRef.current.findIndex(f => f[0] === file);
							if (keyIndex !== -1) {
								allFileKeysRef.current.splice(keyIndex, 1);
							}
						}
						// ERO wraps values in proxies; revoke each element so the written array
						// contains plain objects instead of proxied ones.
						const files = [
							...readValue().map(file => ERO.revoke(file) as HxUploadFile),
							details
						];
						if (write != null) {
							write($model, $field, files, context);
						} else {
							ERO.setValue($model, $field, files);
						}
					};
					// called by HxUploadingItem when the user deletes a file.
					// checks both uploading and uploaded lists; removes from the appropriate one
					// and writes the updated list back to the model.
					const onDelete = (details: HxUploadFile) => {
						// @ts-expect-error ignore the type check
						let index = uploadingFilesRef.current.indexOf(file);
						if (index !== -1) {
							// no need to rerender, uploading item component will hide by itself
							uploadingFilesRef.current.splice(index, 1);
							const keyIndex = allFileKeysRef.current.findIndex(f => f[0] === file);
							if (keyIndex !== -1) {
								allFileKeysRef.current.splice(keyIndex, 1);
							}
							return;
						}
						// check the uploaded files
						const uploadedFiles = readValue();
						index = uploadedFiles.indexOf(details);
						if (index !== -1) {
							// delete it
							const revokedUploadedFiles = uploadedFiles.map(file => ERO.revoke(file) as HxUploadFile);
							revokedUploadedFiles.splice(index, 1);
							const keyIndex = allFileKeysRef.current.findIndex(f => ERO.revoke(f[0].details) === ERO.revoke(details));
							if (keyIndex !== -1) {
								allFileKeysRef.current.splice(keyIndex, 1);
							}
							// construct a new array, using the revoked elements
							const files = revokedUploadedFiles;
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
					                        key={allFileKeysRef.current[index][1]}/>;
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
		// drag-and-drop: bordered drop zone with file input overlaid on the trigger area
		if (variant === 'dnd') {
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
		// gallery: grid of thumbnail blocks; supports image preview via magic-byte detection
		} else if (variant === 'gallery') {
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
		// default: button trigger + file list; variant determines button style (solid/outline/ghost)
		} else {
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
