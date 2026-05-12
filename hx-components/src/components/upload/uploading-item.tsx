// @ts-expect-error import React
import React, {
	type DispatchWithoutAction,
	type MutableRefObject,
	type ReactNode,
	type RefObject,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {type HxFormatFunc} from '../../settings';
import type {HxObject} from '../../types';
import {fileSizeToStr, noop} from '../../utils';
import {HxButton} from '../button';
import {Download, EyeOpen, FileText, Link2, LinkBreak, Trash, Update, Upload} from '../icons';
import {HxLabel} from '../label';
import type {
	HxUploadDownloadFileFunc,
	HxUploadErrorMessage,
	HxUploadFile,
	HxUploadFilePercentage,
	HxUploadingFile,
	HxUploadVariant
} from './types';

export interface HxUploadedFile {
	details: HxUploadFile;
}

export type OnFileUploadedFunc = (details: HxUploadFile) => void;
export type OnFileDeleteFunc = (details: HxUploadFile) => void;

export interface HxUploadingItemProps<T extends object> {
	$model: HxObject<T>;
	maxFileSize: number;
	file: HxUploadingFile | HxUploadedFile;
	variant: HxUploadVariant;
	onDownload: HxUploadDownloadFileFunc<T>;
	onUploaded: OnFileUploadedFunc;
	onDelete: OnFileDeleteFunc;
	disabled: boolean;
}

interface UploadingState {
	uploading: boolean;
	percentage: HxUploadFilePercentage;
	error?: { message: HxUploadErrorMessage };
}

const upload = async (
	file: HxUploadingFile,
	isDeletedRef: MutableRefObject<boolean>,
	isUploadingRef: MutableRefObject<UploadingState>,
	percentageRef: RefObject<HTMLDivElement>,
	forceUpdate: DispatchWithoutAction,
	onUploaded: OnFileUploadedFunc
) => {
	// core upload routine: calls the per-file upload function, drives the progress bar,
	// and reports success/error back via isUploadingRef. uses requestAnimationFrame to
	// let React flush the "uploading" state before the async work begins.
	if (!isUploadingRef.current.uploading) {
		isUploadingRef.current.uploading = true;
		isUploadingRef.current.percentage = 0;
		forceUpdate();
	}

	requestAnimationFrame(async () => {
		const {percentageSupport, upload} = file;
		const callback = percentageSupport ? (percentage: HxUploadFilePercentage) => {
			if (isDeletedRef.current) {
				return;
			}
			isUploadingRef.current.percentage = percentage;
			percentageRef.current?.style?.setProperty('--upload-file-percentage-width', `${percentage}`);
		} : noop;
		const fileOrError = await upload(callback);
		if (fileOrError != null) {
			if (typeof fileOrError === 'string') {
				if (fileOrError.trim().length !== 0) {
					isUploadingRef.current.error = {message: fileOrError.trim()};
				} else {
					isUploadingRef.current.error = {message: 'error'};
				}
			} else {
				delete isUploadingRef.current.error;
			}
		} else {
			isUploadingRef.current.error = {message: 'error'};
		}
		isUploadingRef.current.uploading = false;
		if (isDeletedRef.current) {
			return;
		}
		isUploadingRef.current.percentage = 100;
		forceUpdate();
		if (isUploadingRef.current.error == null) {
			// it is important that replace the origin details by uploaded one
			file.details = fileOrError as HxUploadFile;
			// call callback function only when uploaded (no error)
			onUploaded(file.details);
		}
	});
};

// detect image format from magic bytes in the file header.
// returns the format name for use in toImageSrc, or false for non-image files.
const isImage = (bytes?: Uint8Array<ArrayBuffer> | null): 'JPEG' | 'PNG' | 'GIF' | 'WEBP' | 'BMP' | 'APNG' | 'AVIF' | false => {
	if (bytes == null || bytes.length < 12) {
		return false;
	}

	switch (bytes[0]) {
		case 0x00: {
			// [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]
			return (bytes[1] === 0x00 && bytes[2] === 0x00 && bytes[3] === 0x18 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) ? 'AVIF' : false;
		}
		case 0x42: {
			// [0x42, 0x4D]
			return bytes[1] === 0x4D ? 'BMP' : false;
		}
		case 0x52: {
			// [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]
			return (bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[4] === 0x00
				&& bytes[5] === 0x00 && bytes[6] === 0x00 && bytes[7] === 0x00 && bytes[8] === 0x57
				&& bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) ? 'WEBP' : false;
		}
		case 0x47: {
			// [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]}, // GIF87a
			// [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]}, // GIF89a
			return (bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 && bytes[5] === 0x61 && (bytes[4] === 0x37 || bytes[4] === 0x39)) ? 'GIF' : false;
		}
		case 0x89: {
			// [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
			if (bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 && bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
				//  check acTL block (61 63 54 4C)
				let position = 8;
				while (position < bytes.length - 8) {
					const chunkLength = (bytes[position] << 24) |
						(bytes[position + 1] << 16) |
						(bytes[position + 2] << 8) |
						bytes[position + 3];

					const chunkType = String.fromCharCode(
						bytes[position + 4],
						bytes[position + 5],
						bytes[position + 6],
						bytes[position + 7]
					);

					if (chunkType === 'acTL') {
						return 'APNG';
					}

					if (chunkType === 'IDAT') {
						break;
					}

					position += chunkLength + 12;
				}
				return 'PNG';
			} else {
				return false;
			}
		}
		case 0xFF: {
			// [0xFF, 0xD8, 0xFF]
			return (bytes[1] === 0xD8 && bytes[2] === 0xFF) ? 'JPEG' : false;
		}
		default: {
			return false;
		}
	}
};

const toImageSrc = (bytes: Uint8Array<ArrayBuffer>, type: 'jpeg' | 'png' | 'gif' | 'webp' | 'bmp' | 'apng' | 'avif'): string => {
	const blob = new Blob([bytes], {type: `image/${type}`});
	return URL.createObjectURL(blob);
};

export const HxUploadingItem = <T extends object>(props: HxUploadingItemProps<T>) => {
	const {
		$model,
		maxFileSize,
		file,
		variant, onDownload, onUploaded, onDelete,
		disabled
	} = props;

	const context = useHxContext();
	const isUploadingRef = useRef<UploadingState>({
		uploading: (file as HxUploadingFile).upload != null, percentage: 0
	});
	const bytesRef = useRef<Uint8Array<ArrayBuffer> | null>((file as HxUploadingFile).details.bytes ?? null);
	const percentageRef = useRef<HTMLDivElement>(null);
	const isDeletedRef = useRef(false);
	useEffect(() => {
		if (isUploadingRef.current.uploading) {
			(async () => {
				await upload(
					file as HxUploadingFile,
					isDeletedRef, isUploadingRef, percentageRef,
					context.forceUpdate,
					onUploaded);
			})();
		}
	}, [context, file, onUploaded]);

	// eslint-disable-next-line react-hooks/refs
	if (isDeletedRef.current) {
		return (void 0);
	}

	const onPreviewClick = () => {
		// TODO open file preview, works on images only
	};
	const onUploadClick = async () => {
		const f = file as HxUploadingFile;
		if (f.details.size != null && f.details.size > maxFileSize) {
			isUploadingRef.current.uploading = false;
			isUploadingRef.current.error = {message: '~HxCommon.UploadOverMaxSize'};
			context.forceUpdate();
		} else {
			await upload(
				f,
				isDeletedRef, isUploadingRef, percentageRef,
				context.forceUpdate,
				onUploaded);
		}
	};
	const onDownloadClick = async () => {
		await onDownload(file.details, $model, context);
	};
	const onDeleteClick = () => {
		isDeletedRef.current = true;
		context.forceUpdate();
		if (isUploadingRef.current.uploading) {
			// still on uploading, send abort signal
			const {abort} = file as HxUploadingFile;
			abort?.abort('Cancel manually');
		}
		onDelete(file.details);
	};

	const [fileSize, fileSizeUnit] = fileSizeToStr(file.details.size);
	let fileSizeLabel: ReactNode | undefined = (void 0);
	if (fileSize !== 0) {
		const format: HxFormatFunc = (value: number) => {
			const format = new Intl.NumberFormat(context.language.current(), {
				useGrouping: true,
				minimumFractionDigits: 0,
				maximumFractionDigits: 2
			}).format;
			return `(${format(value)}${fileSizeUnit})`;
		};
		fileSizeLabel = <HxLabel text={fileSize} format={format} data-hx-upload-file-size=""/>;
	}
	// split file name into base name and extension for separate styling
	let fileName = file.details.name;
	let extName: string | undefined = (void 0);
	const extNameIndex = file.details.name.lastIndexOf('.');
	if (extNameIndex !== -1) {
		fileName = file.details.name.substring(0, extNameIndex);
		extName = file.details.name.substring(extNameIndex);
	}
	// map known error codes to i18n message keys; pass through custom messages as-is
	let errorMessage: string | undefined = (void 0);
	// eslint-disable-next-line react-hooks/refs
	if (isUploadingRef.current.error != null) {
		// eslint-disable-next-line react-hooks/refs
		switch (isUploadingRef.current.error.message) {
			case 'over-max-size': {
				errorMessage = '~HxCommon.UploadOverMaxSize';
				break;
			}
			case 'not-acceptable': {
				errorMessage = '~HxCommon.UploadNotAcceptable';
				break;
			}
			case 'error': {
				errorMessage = '~HxCommon.UploadError';
				break;
			}
			default: {
				errorMessage = isUploadingRef.current.error.message;
				break;
			}
		}
	}

	// list-style layout (button / dnd): file icon + name + actions in a single row
	if (variant !== 'gallery') {
		return <div data-hx-upload-file=""
			// eslint-disable-next-line react-hooks/refs
			        data-hx-upload-file-error={isUploadingRef.current.error != null ? '' : (void 0)}>
			{/* eslint-disable-next-line react-hooks/refs */}
			{isUploadingRef.current.error != null
				? <HxLabel text={<LinkBreak/>} data-hx-upload-file-icon=""/>
				: <HxLabel text={<Link2/>} data-hx-upload-file-icon=""/>}
			<HxLabel text={<>
				<HxLabel text={<span>{fileName}</span>} data-hx-upload-file-name=""/>
				<HxLabel text={extName} data-hx-upload-file-ext-name=""/>
				{fileSizeLabel}
			</>} data-hx-upload-file-details=""/>
			<HxLabel text={<>
				{/* eslint-disable-next-line react-hooks/refs */}
				{isUploadingRef.current.uploading
					? <>
						<HxLabel text={<Update data-hx-animation="spin" data-hx-upload-file-uploading=""/>}/>
						<HxButton variant="ghost" text={<Trash/>} color="danger" onClick={onDeleteClick}/>
					</>
					// eslint-disable-next-line react-hooks/refs
					: (isUploadingRef.current.error != null
						? <span/>
						: <>
							<HxButton variant="ghost" text={<Download/>} $disabled={disabled}
							          onClick={onDownloadClick}/>
							<HxButton variant="ghost" text={<Trash/>} color="danger" $disabled={disabled}
							          onClick={onDeleteClick}/>
						</>)}
			</>} data-hx-upload-file-action=""/>
			{/* eslint-disable-next-line react-hooks/refs */}
			{errorMessage != null
				? <>
					{/* eslint-disable-next-line react-hooks/refs */}
					<HxLabel text={errorMessage} data-hx-upload-file-error-msg="" data-hx-label-check-msg=""/>
					{/* eslint-disable-next-line react-hooks/refs */}
					{!isUploadingRef.current.uploading
						? <HxLabel text={<>
							<HxButton variant="ghost" text={<Upload/>} onClick={onUploadClick}/>
							<HxButton variant="ghost" text={<Trash/>} color="danger" onClick={onDeleteClick}/>
						</>} data-hx-upload-file-action=""/>
						: (void 0)}
				</>
				: (void 0)}
			{/* eslint-disable-next-line react-hooks/refs */}
			{isUploadingRef.current.uploading && (file as HxUploadingFile).percentageSupport
				? <div data-hx-upload-file-percentage="" ref={percentageRef}/>
				: (void 0)}
		</div>;
	// gallery layout: thumbnail block with hover actions and image preview
	} else {
		// eslint-disable-next-line react-hooks/refs
		if (errorMessage != null && !['~HxCommon.UploadOverMaxSize', '~HxCommon.UploadNotAcceptable', '~HxCommon.UploadError'].includes(errorMessage)) {
			// simplify custom error messages to a generic label in gallery mode (limited space)
			errorMessage = '~HxCommon.UploadError';
		}
		// render image thumbnail from raw bytes, or a generic file icon for non-image files
		const asImageOrIcon = () => {
			const checked = isImage(bytesRef.current);
			if (checked === false) {
				return <HxLabel text={<FileText/>}/>;
			} else {
				// @ts-expect-error ignore check
				return <img src={toImageSrc(bytesRef.current!, checked.toLowerCase())} alt=""/>;
			}
		};

		return <div data-hx-upload-file=""
			// eslint-disable-next-line react-hooks/refs
			        data-hx-upload-file-error={isUploadingRef.current.error != null ? '' : (void 0)}>
			{/* eslint-disable-next-line react-hooks/refs */}
			{isUploadingRef.current.uploading
				? <>
					<HxLabel text={<>
						<HxLabel text={<Update data-hx-animation="spin" data-hx-upload-file-uploading=""/>}/>
						<HxButton text={<Trash/>} variant="ghost" color="danger" onClick={onDeleteClick}/>
					</>} data-hx-upload-file-action="uploading"/>
					{(file as HxUploadingFile).percentageSupport
						? <div data-hx-upload-file-percentage="" ref={percentageRef}/>
						: (void 0)}
				</>
				// eslint-disable-next-line react-hooks/refs
				: (isUploadingRef.current.error != null
					? <>
						{/* eslint-disable-next-line react-hooks/refs */}
						<HxLabel text={errorMessage} data-hx-upload-file-error-msg="" data-hx-label-check-msg=""/>
						<HxLabel text={<>
							<HxButton variant="ghost" text={<Upload/>} onClick={onUploadClick}/>
							<HxButton variant="ghost" text={<Trash/>} color="danger" onClick={onDeleteClick}/>
						</>} data-hx-upload-file-action="upload-failed"/>
					</>
					: <>
						{/* thumbnail preview, works on images only. or show corresponding icons of the mime type? */}
						<div data-hx-upload-file-thumbnail="">
							{/* eslint-disable-next-line react-hooks/refs */}
							{asImageOrIcon()}
						</div>
						<HxLabel text={<>
							<HxButton text={<EyeOpen/>} variant="ghost" $disabled={disabled}
							          onClick={onPreviewClick}/>
							<HxButton text={<Trash/>} variant="ghost" color="danger" $disabled={disabled}
							          onClick={onDeleteClick}/>
						</>} data-hx-upload-file-action="uploaded"/>
					</>)}
		</div>;
	}
};
