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
import {Download, EyeOpen, Link2, LinkBreak, Trash, Update, Upload} from '../icons';
import {HxLabel} from '../label';
import type {
	HxUploadDownloadFileFunc,
	HxUploadErrorMessage,
	HxUploadFile,
	HxUploadFilePercentage,
	HxUploadingFile,
	HxUploadVariant
} from './types';

export interface HxUploadingItemProps<T extends object> {
	$model: HxObject<T>;
	maxFileSize: number;
	file: HxUploadingFile | HxUploadFile;
	variant: HxUploadVariant;
	onDownload: HxUploadDownloadFileFunc<T>;
	onUploaded: () => void;
	onDelete: () => void;
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
	onUploaded: () => void
) => {
	// reset state
	if (!isUploadingRef.current.uploading) {
		isUploadingRef.current.uploading = true;
		isUploadingRef.current.percentage = 0;
		forceUpdate();
	}

	const {percentageSupport, func} = file;
	const callback = percentageSupport ? (percentage: HxUploadFilePercentage) => {
		if (isDeletedRef.current) {
			return;
		}
		isUploadingRef.current.percentage = percentage;
		percentageRef.current?.style?.setProperty('--upload-file-percentage-width', `${percentage}`);
	} : noop;
	const error = await func(callback);
	if (error != null && error.trim().length !== 0) {
		isUploadingRef.current.error = {message: error.trim()};
	} else {
		delete isUploadingRef.current.error;
	}
	if (isDeletedRef.current) {
		return;
	}
	isUploadingRef.current.uploading = false;
	isUploadingRef.current.percentage = 100;
	forceUpdate();
	if (isUploadingRef.current.error == null) {
		// call callback function only when uploaded (no error)
		onUploaded();
	}
};

export const HxUploadingItem = <T extends object>(props: HxUploadingItemProps<T>) => {
	const {
		$model,
		// maxFileSize,
		file,
		variant, onDownload, onUploaded, onDelete
		// disabled
	} = props;

	const context = useHxContext();
	const isUploadingRef = useRef<UploadingState>({
		uploading: (file as HxUploadingFile).func != null, percentage: 0
	});
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
		await upload(
			file as HxUploadingFile,
			isDeletedRef, isUploadingRef, percentageRef,
			context.forceUpdate,
			onUploaded);
	};
	const onDownloadClick = async () => {
		await onDownload(file, $model, context);
	};
	const onDeleteClick = () => {
		isDeletedRef.current = true;
		context.forceUpdate();
		if (isUploadingRef.current.uploading) {
			// still on uploading, send abort signal
			const {abort} = file as HxUploadingFile;
			abort?.abort('Cancel manually');
		}
		onDelete();
	};

	const [fileSize, fileSizeUnit] = fileSizeToStr(file.size);
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
	let fileName = file.name;
	let extName: string | undefined = (void 0);
	const extNameIndex = file.name.lastIndexOf('.');
	if (extNameIndex !== -1) {
		fileName = file.name.substring(0, extNameIndex);
		extName = file.name.substring(extNameIndex);
	}
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

	if (variant !== 'gallery') {
		// button or dnd mode
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
							<HxButton variant="ghost" text={<Download/>} onClick={onDownloadClick}/>
							<HxButton variant="ghost" text={<Trash/>} color="danger" onClick={onDeleteClick}/>
						</>)}
			</>} data-hx-upload-file-action=""/>
			{/* eslint-disable-next-line react-hooks/refs */}
			{errorMessage != null
				? <>
					{/* eslint-disable-next-line react-hooks/refs */}
					<HxLabel text={errorMessage} data-hx-upload-file-error-msg="" data-hx-label-check-msg=""/>
					<HxLabel text={<>
						<HxButton variant="ghost" text={<Upload/>} onClick={onUploadClick}/>
						<HxButton variant="ghost" text={<Trash/>} color="danger" onClick={onDeleteClick}/>
					</>} data-hx-upload-file-action=""/>
				</>
				: (void 0)}
			{/* eslint-disable-next-line react-hooks/refs */}
			{isUploadingRef.current.uploading && (file as HxUploadingFile).percentageSupport
				? <div data-hx-upload-file-percentage="" ref={percentageRef}/>
				: (void 0)}
		</div>;
	} else {
		// gallery mode
		return <div data-hx-upload-file="">
			{/* TODO thumbnail preview, works on images only. or show corresponding icons of the mime type? */}
			<div data-hx-upload-file-action="">
				<HxButton text={<EyeOpen/>} variant="ghost" onClick={onPreviewClick}/>
				<HxButton text={<Trash/>} variant="ghost" color="danger" onClick={onDeleteClick}/>
			</div>
		</div>;
	}
};
