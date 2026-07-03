// @ts-expect-error import React
import React, {type RefObject} from 'react';
import {useHxContext} from '../../contexts';
import type {HxFormatFunc} from '../../settings';
import {FileUtils} from '../../utils';
import {HxButton} from '../button';
import {Download, Link2, LinkBreak, Trash, Update, Upload} from '../icons';
import {HxLabel} from '../label';
import type {HxUploadingFile} from './types';
import type {HxUploadedFile} from './upload-item';
import {parseFileName} from './utils';

export interface UploadItemListProps {
	file: HxUploadingFile | HxUploadedFile;
	onUpload: () => void;
	onDownload: () => void;
	onDelete: () => void;
	percentageRef: RefObject<HTMLDivElement>;
	isUploading: boolean;
	hasUploadError: boolean;
	errorMessage?: string;
	disabled: boolean;
}

const FileSizeLabel = (props: Pick<UploadItemListProps, 'file'>) => {
	const {file} = props;

	const context = useHxContext();

	const [fileSize, fileSizeUnit] = FileUtils.sizeToStr(file.details.size);
	if (fileSize !== 0) {
		const format: HxFormatFunc = (value: number) => {
			const format = new Intl.NumberFormat(context.language.current(), {
				useGrouping: true,
				minimumFractionDigits: 0,
				maximumFractionDigits: 2
			}).format;
			return `(${format(value)}${fileSizeUnit})`;
		};
		return <HxLabel text={fileSize} format={format} data-hx-upload-file-size=""/>;
	} else {
		return (void 0);
	}
};

export const UploadItemList = (props: UploadItemListProps) => {
	const {
		file,
		onUpload, onDownload, onDelete,
		percentageRef,
		isUploading, hasUploadError, errorMessage,
		disabled
	} = props;

	const [baseName, extName] = parseFileName(file.details);

	return <div data-hx-upload-file=""
	            data-hx-upload-file-error={hasUploadError ? '' : (void 0)}>
		{hasUploadError
			? <HxLabel text={<LinkBreak/>} data-hx-upload-file-icon=""/>
			: <HxLabel text={<Link2/>} data-hx-upload-file-icon=""/>}
		<HxLabel text={<>
			<HxLabel text={<span>{baseName}</span>} data-hx-upload-file-name=""/>
			<HxLabel text={extName} data-hx-upload-file-ext-name=""/>
			<FileSizeLabel file={file}/>
		</>} data-hx-upload-file-details=""/>
		<HxLabel text={<>
			{isUploading
				? <>
					<HxLabel text={<Update data-hx-svg-icon-animation="spin" data-hx-upload-file-uploading=""/>}/>
					<HxButton variant="ghost" text={<Trash/>} color="danger" onClick={onDelete}/>
				</>
				: (hasUploadError
					? <span/>
					: <>
						<HxButton variant="ghost" text={<Download/>} $disabled={disabled}
						          onClick={onDownload}/>
						<HxButton variant="ghost" text={<Trash/>} color="danger" $disabled={disabled}
						          onClick={onDelete}/>
					</>)}
		</>} data-hx-upload-file-action=""/>
		{hasUploadError
			? <>
				<HxLabel text={errorMessage} data-hx-upload-file-error-msg="" data-hx-label-check-msg=""/>
				{!isUploading
					? <HxLabel text={<>
						<HxButton variant="ghost" text={<Upload/>} onClick={onUpload}/>
						<HxButton variant="ghost" text={<Trash/>} color="danger" onClick={onDelete}/>
					</>} data-hx-upload-file-action=""/>
					: (void 0)}
			</>
			: (void 0)}
		{isUploading && (file as HxUploadingFile).percentageSupport
			? <div data-hx-upload-file-percentage="" ref={percentageRef}/>
			: (void 0)}
	</div>;
};
