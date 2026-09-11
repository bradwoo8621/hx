import type {ModelPath} from '@hx/data';
import type {HTMLAttributes, ReactNode} from 'react';
import type {
	DisabledProps,
	HxColor,
	HxCommonProps,
	HxDataPath,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAtomicAttributes, HxOmittedDataAttributes,
	HxPadding,
	HxStdProps
} from '../../types';
import type {HxFormats} from '../../utils';

/** Horizontal padding size around the label */
export type HxLabelPaddingX = HxPadding | 'text-indent';

export type ExcludedLabelDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-label'
	| 'data-hx-label-text';

/**
 * Properties for the HxLabel component.
 * Supports static text, dynamic reactive text, i18n translation, and value formatting.
 */
export interface HxExtLabelProps<T extends object>
	extends HxStdProps<T>, DisabledProps<T>, Omit<HxCommonProps<ExcludedLabelDataAttrNames, T>, 'paddingX'> {
	/** Text color theme */
	color?: HxColor;
	/** Whether to use opaque (solid) background for the label */
	opaque?: boolean;
	/** Whether the element is clickable */
	clickable?: boolean;
	/** Whether the element is hoverable */
	hoverable?: boolean;
	/** Whether to force the hover state, independent of the pointer */
	hovered?: boolean;
	/** Whether the element is active */
	active?: boolean;
	/** Whether to apply i18n translation to values retrieved from the reactive model */
	valueUseI18N?: boolean;
	/**
	 * Static label text content. Ignored when both $model and $field are specified.
	 * - Values starting with "~" are treated as i18n translation keys
	 * - Leading "~" can be escaped with "\~" to display literal "~" as first character
	 */
	text?: ReactNode;
	/** Reactive model object to get dynamic label text from */
	$model?: HxObject<T>,
	/** Path to field on $model whose value will be used as label text */
	$field?: ModelPath<T> | HxDataPath;
	/** Format type to apply to the value. Overrides i18n translation when specified. */
	format?: HxFormats;
	/** Horizontal padding size; 'text-indent' aligns the padding with the text indent scale */
	paddingX?: HxLabelPaddingX;
	/** Whether to indent the content inline on both sides */
	indent?: boolean;
}

export type OmittedLabelHTMLProps = HxOmittedAtomicAttributes;

export type HxLabelProps<T extends object> =
	& HxExtLabelProps<T>
	& HxHtmlElementProps<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>, OmittedLabelHTMLProps, T>;
