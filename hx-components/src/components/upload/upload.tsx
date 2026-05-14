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
import {HxUploadDefaults} from './defaults';
import type {
	HxUploadColor,
	HxUploadDownloadFileFunc,
	HxUploadFile,
	HxUploadingFile,
	HxUploadPreviewFileFunc,
	HxUploadReadDataFunc,
	HxUploadThumbnailFileFunc,
	HxUploadUploadFilesFunc,
	HxUploadVariant,
	HxUploadWriteDataFunc
} from './types';
import {UploadButton} from './upload-button';
import {UploadDnd} from './upload-dnd';
import {UploadError} from './upload-error';
import {UploadGallery} from './upload-gallery';
import {type HxUploadedFile, HxUploadItem} from './upload-item';
import {HxUploadProvider, useHxUpload} from './upload-provider';
import {computeAccept, useAcceptCheck} from './use-accept-check';

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
	/**
	 * get bytes of image file for preview purpose, only works when variant is "gallery"
	 */
	preview?: HxUploadPreviewFileFunc<T>;
	/**
	 * get thumbnail bytes of image file, only works when variant is "gallery".
	 * if this function is not provided, use the "preview" function to get full bytes.
	 */
	thumbnail?: HxUploadThumbnailFileFunc<T>;
	buttonUploadKey?: ReactNode;
	galleryUploadKey?: ReactNode;
	dndUploadKey?: ReactNode;
	dndDescKey?: ReactNode;
}

export type OmittedUploadHTMLProps = HxOmittedAttributes;

export type HxUploadProps<T extends object> =
	& HxExtUploadProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedUploadHTMLProps, T>;

const HxUploadInner =
	forwardRef(<T extends object>(props: HxUploadProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			color = HxUploadDefaults.color, variant = HxUploadDefaults.variant,
			maxFileCount: givenMaxFileCount, maxFileSize: givenMaxFileSize = Infinity, accept: givenAccept, capture,
			read, write, upload, download, preview, thumbnail,
			buttonUploadKey = HxUploadDefaults.buttonUploadKey,
			galleryUploadKey = HxUploadDefaults.galleryUploadKey,
			dndUploadKey = HxUploadDefaults.dndUploadKey, dndDescKey = HxUploadDefaults.dndDescKey,
			...rest
		} = props;

		const context = useHxContext();
		const uploadContext = useHxUpload();
		const {visible, disabled} = useDataMonitor(props);
		const fileInputRef = useRef<HTMLInputElement>(null);
		const uploadingFilesRef = useRef<Array<HxUploadingFile>>([]);
		// tracks every visible file (uploaded + uploading) paired with a stable React key.
		// keys are assigned once via nanoid and reused across renders so React doesn't remount items.
		const allFileKeysRef = useRef<Array<[HxUploadFile, string]>>([]);
		useAcceptCheck(variant, givenAccept);

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
			if (maxFileCount > 1) {
				// multiple files mode
				const remainFileCount = maxFileCount - uploadingFilesRef.current.length - uploadedFileCount;
				if (files.length > remainFileCount) {
					// clear the files
					ev.target.value = '';
					// report the over max file count error
					uploadContext.raiseError('~HxCommon.UploadOverMaxCount');
					return;
				}
			}
			// start uploading
			let uploading: Array<HxUploadingFile>;
			try {
				uploading = await upload(Array.from(files), $model, context);
			} catch {
				// clear the files
				ev.target.value = '';
				// report the uploading files data constructing error
				uploadContext.raiseError('~HxCommon.UploadReadFileError');
				return;
			}
			if (maxFileCount === 1) {
				// single file mode
				// clear the uploading files
				if (uploadingFilesRef.current.length > 0) {
					uploadingFilesRef.current[0].abort?.abort('Cancel, uploading file replaced manually.');
				}
				uploadingFilesRef.current = [];
				// clear the uploaded files, will trigger model change here
				if (write != null) {
					write($model, $field, [], context);
				} else {
					ERO.setValue($model, $field, []);
				}
				// clear the keys
				allFileKeysRef.current = [];
			}
			// handle the uploading result, which needs to be rendered
			uploadingFilesRef.current.push(...uploading);
			allFileKeysRef.current.push(...uploading.map(file => {
				return [ERO.revoke(file.details), nanoid(10)] as [HxUploadFile, string];
			}));
			uploadContext.clearError();
			context.forceUpdate();
			// clear the files
			ev.target.value = '';
		};

		// normalize the accept prop: join array values, trim, and treat empty string as undefined
		const accept = computeAccept(givenAccept);
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
		const keysMap = allFileKeysRef.current.reduce((map, [details, key]) => {
			map.set(ERO.revoke(details), key);
			return map;
		}, new Map<HxUploadFile, string>);
		// eslint-disable-next-line react-hooks/refs
		allFileKeysRef.current = allFiles.map(file => {
			return [
				ERO.revoke(file.details),
				keysMap.get(ERO.revoke(file.details)) ?? nanoid(10)
			];
		});
		const filesContent = <>
			{ // eslint-disable-next-line react-hooks/refs
				allFiles.map((file, index) => {
					// called by HxUploadItem once upload succeeds.
					// removes the file from the uploading ref, appends it to the persisted file list,
					// and writes back via the custom `write` transform or directly to the model.
					const onUploaded = (details: HxUploadFile) => {
						// remove the React key first
						const keyIndex = allFileKeysRef.current.findIndex(([details]) => details === ERO.revoke(file.details));
						if (keyIndex !== -1) {
							// replace the keys ref with given file details
							allFileKeysRef.current[keyIndex][0] = details;
						}
						// @ts-expect-error ignore the type check
						const index = uploadingFilesRef.current.indexOf(file);
						if (index !== -1) {
							// no need to rerender, uploading item component will hide by itself
							uploadingFilesRef.current.splice(index, 1);
							// it is important that replace the origin details by given one
							// the given one is returned by upload function, and typically it is not same as the old one,
							file.details = details;
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
						}
					};
					// called by HxUploadItem when the user deletes a file.
					// checks both uploading and uploaded lists; removes from the appropriate one
					// and writes the updated list back to the model.
					const onDelete = (details: HxUploadFile) => {
						// @ts-expect-error ignore the type check
						let index = uploadingFilesRef.current.indexOf(file);
						if (index !== -1) {
							// no need to rerender, uploading item component will hide by itself
							uploadingFilesRef.current.splice(index, 1);
							const keyIndex = allFileKeysRef.current.findIndex(([details]) => details === ERO.revoke(file.details));
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
							const keyIndex = allFileKeysRef.current.findIndex(f => ERO.revoke(f[0]) === ERO.revoke(details));
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
					return <HxUploadItem $model={$model} file={file} maxFileSize={maxFileSize}
					                     onDownload={download} onPreview={preview} onThumbnail={thumbnail}
					                     onUploaded={onUploaded} onDelete={onDelete}
					                     variant={variant} disabled={disabled}
					                     key={allFileKeysRef.current[index][1]}/>;
				})
			}
		</>;
		const uploadingError = <UploadError $model={$model} $field={$field} uploadingFilesRef={uploadingFilesRef}/>;

		const onUploadClick = () => {
			if (!visible || disabled || fileInputRef.current == null) {
				return;
			}
			fileInputRef.current.click();
		};
		let content: ReactNode;
		if (variant === 'dnd') {
			// drag-and-drop: bordered drop zone with file input overlaid on the trigger area
			content = <UploadDnd fileInput={fileInput} filesContent={filesContent}
			                     uploadingError={uploadingError} dndUploadKey={dndUploadKey}
			                     dndDescKey={dndDescKey}
			                     disabled={disabled}/>;
		} else if (variant === 'gallery') {
			// gallery: grid of thumbnail blocks; supports image preview via magic-byte detection
			content = <UploadGallery fileInput={fileInput} filesContent={filesContent}
			                         onUploadClick={onUploadClick}
			                         color={color}
			                         uploadingError={uploadingError} galleryUploadKey={galleryUploadKey}
			                         disabled={disabled}/>;
		} else {
			// default: button trigger + file list; variant determines button style (solid/outline/ghost)
			content = <UploadButton fileInput={fileInput} filesContent={filesContent}
			                        onUploadClick={onUploadClick}
			                        color={color} variant={variant}
			                        uploadingError={uploadingError} buttonUploadKey={buttonUploadKey}
			                        disabled={disabled}/>;
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
	});
HxUploadInner.displayName = 'HxUploadInner';

export type HxUploadType = <T extends object>(
	props: HxUploadProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxUpload =
	forwardRef(<T extends object>(props: HxUploadProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		return <HxUploadProvider>
			{/* @ts-expect-error ignore check */}
			<HxUploadInner {...props} ref={ref}/>
		</HxUploadProvider>;
	}) as unknown as HxUploadType;
// @ts-expect-error assign component name
HxUpload.displayName = 'HxUpload';
