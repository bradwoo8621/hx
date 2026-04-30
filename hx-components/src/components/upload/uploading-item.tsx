// @ts-expect-error import React
import React, {type ReactNode, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {type HxFormatFunc} from '../../settings';
import type {HxObject} from '../../types';
import {fileSizeToStr, noop} from '../../utils';
import {HxButton} from '../button';
import {Download, EyeOpen, Link2, Trash, Update} from '../icons';
import {HxLabel} from '../label';
import type {
	HxUploadDownloadFileFunc,
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

export const HxUploadingItem = <T extends object>(props: HxUploadingItemProps<T>) => {
	const {
		$model,
		// maxFileSize,
		file,
		variant, onDownload, onUploaded, onDelete
		// disabled
	} = props;

	const context = useHxContext();
	const isUploadingRef = useRef({
		uploading: (file as HxUploadingFile).func != null,
		percentage: 0 as HxUploadFilePercentage,
		error: (void 0) as string | undefined | void
	});
	const percentageRef = useRef<HTMLDivElement>(null);
	const isDeletedRef = useRef(false);
	useEffect(() => {
		if (isUploadingRef.current.uploading) {
			(async () => {
				const {percentageSupport, func} = file as HxUploadingFile;
				const callback = percentageSupport ? (percentage: HxUploadFilePercentage) => {
					if (isDeletedRef.current) {
						return;
					}
					isUploadingRef.current.percentage = percentage;
					percentageRef.current?.style?.setProperty('--upload-file-percentage-width', `${percentage}`);
				} : noop;
				// TODO handle the error message
				isUploadingRef.current.error = await func(callback);
				if (isDeletedRef.current) {
					return;
				}
				isUploadingRef.current.uploading = false;
				isUploadingRef.current.percentage = 100;
				context.forceUpdate();
				onUploaded();
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
	const onDownloadClick = async () => {
		await onDownload(file, $model, context);
	};
	const onDeleteClick = () => {
		isDeletedRef.current = true;
		context.forceUpdate();
		if (isUploadingRef.current.uploading) {
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

	if (variant !== 'gallery') {
		return <div data-hx-upload-file="">
			<HxLabel text={<>
				<HxLabel text={<Link2/>} data-hx-upload-file-icon=""/>
				<HxLabel text={<span>{fileName}</span>} data-hx-upload-file-name=""/>
				<HxLabel text={extName} data-hx-upload-file-ext-name=""/>
				{fileSizeLabel}
			</>} data-hx-upload-file-details=""/>
			<HxLabel text={<>
				{/* eslint-disable-next-line react-hooks/refs */}
				{isUploadingRef.current.uploading
					? <HxLabel text={<Update data-hx-animation="spin" data-hx-upload-file-uploading=""/>}/>
					: <HxButton variant="ghost" text={<Download/>} onClick={onDownloadClick}/>}
				<HxButton variant="ghost" text={<Trash/>} color="danger" onClick={onDeleteClick}/>
			</>} data-hx-upload-file-action=""/>
			{/* eslint-disable-next-line react-hooks/refs */}
			{isUploadingRef.current.uploading && (file as HxUploadingFile).percentageSupport
				? <div data-hx-upload-file-percentage="" ref={percentageRef}/>
				: (void 0)}
		</div>;
	} else {
		return <div data-hx-upload-file="">
			{/* TODO thumbnail preview, works on images only. or show corresponding icons of the mime type? */}
			<div data-hx-upload-file-action="">
				<HxButton text={<EyeOpen/>} variant="ghost" onClick={onPreviewClick}/>
				<HxButton text={<Trash/>} variant="ghost" color="danger" onClick={onDeleteClick}/>
			</div>
		</div>;
	}
};
