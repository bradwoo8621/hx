// @ts-expect-error import React
import React, {
	type ChangeEvent,
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type ReactElement,
	type ReactNode,
	type RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {
	HxColor,
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxWidthConstrainedProps
} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {HxButton, type HxButtonVariant} from '../button';
import {HxFlex} from '../flex';
import {Archive, Plus, Upload} from '../icons';
import {HxLabel} from '../label';
import {HxUploadDefaults} from './defaults';

export type HxUploadColor = HxColor;
export type HxUploadTriggerVariant = HxButtonVariant | 'dnd';
export type HxUploadListVariant = 'list' | 'gallery';

export interface HxExtUploadProps<T extends object> extends HxEditSingleFieldProps<T>, HxWidthConstrainedProps {
	color?: HxUploadColor;
	triggerVariant?: HxUploadTriggerVariant;
	/** ignore when trigger variant is dnd, treated as list */
	listVariant?: HxUploadListVariant;
	maxFileCount?: number;
	maxFileSize?: number;
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
			$model, // $field,
			color = HxUploadDefaults.color,
			triggerVariant = HxUploadDefaults.triggerVariant, listVariant = HxUploadDefaults.listVariant,
			maxFileCount: givenMaxFileCount, // maxFileSize,
			buttonUploadKey = HxUploadDefaults.buttonUploadKey,
			galleryUploadKey = HxUploadDefaults.galleryUploadKey,
			dndUploadKey = HxUploadDefaults.dndUploadKey, dndDescKey = HxUploadDefaults.dndDescKey,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);

		const maxFileCount = (givenMaxFileCount == null || givenMaxFileCount <= 0) ? Infinity : givenMaxFileCount;
		console.log(maxFileCount);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onFileChange = (_ev: ChangeEvent<HTMLInputElement>) => {
		};

		const restProps = exposePropsToDOM(rest, $model, context);
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
			</>;
		} else if (listVariant === 'list') {
			// button
			content = <>
				<HxButton text={<>
					<HxLabel text={<Upload/>} data-hx-margin-r="md"/>
					<HxLabel text={buttonUploadKey}/>
				</>} color={color} variant={triggerVariant} $disabled={disabled}
				          data-hx-upload-trigger="button"/>
			</>;
		} else {
			// gallery
			content = <>
				<HxFlex alignItems="center" justifyContent="center"
				        data-hx-upload-color={color}
				        data-hx-upload-trigger="gallery"
				        data-hx-disabled={(disabled ?? false) ? '' : (void 0)}>
					<HxLabel text={<Plus/>}/>
					<HxLabel text={galleryUploadKey}/>
				</HxFlex>
			</>;
		}

		return <div {...restProps}
		            data-hx-upload=""
		            data-hx-upload-color={color}
		            data-hx-upload-trigger-variant={triggerVariant} data-hx-upload-list-variant={listVariant}
		            data-hx-visible={(visible ?? true) ? '' : 'no'}
		            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		            ref={ref}>
			<input type="file" onChange={onFileChange} data-hx-upload=""/>
			{content}
		</div>;
	}) as unknown as HxUploadType;
// @ts-expect-error assign component name
HxUpload.displayName = 'HxUpload';
