import type {ModelPath} from '@hx/data';
import type {HTMLAttributes, ReactElement, RefAttributes} from 'react';
import type {
	HxBorderRadius,
	HxDataPath,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxPadding,
	HxStdProps,
	HxWidthConstrainedProps
} from '../../types';
import type {HxFlexPaddingB, HxFlexPaddingT, HxFlexPaddingX} from '../flex';

export type HxTabsBorderRadius = HxBorderRadius;
/** Horizontal padding size for tabs container */
export type HxTabsPaddingX = HxPadding;
/** Top padding size for tabs container */
export type HxTabsPaddingT = HxPadding;
/** Bottom padding size for tabs container */
export type HxTabsPaddingB = HxPadding;

export interface HxExtTabsProps<T extends object>
	extends HxStdProps<T>, HxWidthConstrainedProps {
	/** Whether to show a border around the Tabs container */
	border?: boolean;
	/** Border radius size for the container corners */
	borderRadius?: HxTabsBorderRadius;
	/** Horizontal (left and right) padding for the container */
	paddingX?: HxFlexPaddingX;
	/** Top padding for the container */
	paddingT?: HxFlexPaddingT;
	/** Bottom padding for the container */
	paddingB?: HxFlexPaddingB;
	/** Optional reactive model */
	$model?: HxObject<T>,
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T> | HxDataPath;
}

export type OmittedTabsHTMLProps = HxOmittedAttributes | 'children';

export type HxTabsProps<T extends object> =
	& HxExtTabsProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedTabsHTMLProps, T>;

export type HxTabsType = <T extends object>(
	props: HxTabsProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;
