import type {ModelPath} from '@hx/data';
import type {HTMLAttributes} from 'react';
import type {
	HxCommonProps,
	HxDataPath,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxOmittedDataAttributes,
	HxStdProps
} from '../../types';

export type ExcludedBoxDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-box';

/**
 * Properties for the HxBox layout component.
 * Provides flexible container layout with configurable borders, and padding.
 */
export interface HxExtBoxProps<T extends object>
	extends HxStdProps<T>, HxCommonProps<ExcludedBoxDataAttrNames, T> {
	/** Optional reactive model */
	$model?: HxObject<T>,
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T> | HxDataPath;
}

export type OmittedBoxHTMLProps = HxOmittedAttributes;

export type HxBoxProps<T extends object> =
	& HxExtBoxProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedBoxHTMLProps, T>;
