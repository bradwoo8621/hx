import type {ModelPath} from '@hx/data';
import type {HTMLAttributes, ReactNode} from 'react';
import type {
	DisabledProps,
	HxBorderRadius,
	HxDataPath,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxPadding,
	HxStdProps,
	HxWidthConstrainedProps,
	VisibleProps
} from '../../types';

export interface HxTab<T extends object = object> extends VisibleProps<T>, DisabledProps<T> {
	mark?: string;
	header?: ReactNode;
	body?: ReactNode;
	defaultActive?: boolean;
}

export type HxTabsChildren = [HxTab, ...Array<HxTab>];

export type HxTabsBorderRadius = HxBorderRadius;
/** Horizontal padding size for tabs container */
export type HxTabsPaddingX = HxPadding;
/** Top padding size for tabs container */
export type HxTabsPaddingT = HxPadding;
/** Bottom padding size for tabs container */
export type HxTabsPaddingB = HxPadding;
export type HxTabBodyContainerType = 'grid' | 'flex' | 'block';

export interface HxExtTabsProps<T extends object>
	extends HxStdProps<T>, HxWidthConstrainedProps {
	/** Whether to show a border around the Tabs container */
	border?: boolean;
	/** Border radius size for the container corners */
	borderRadius?: HxTabsBorderRadius;
	/** Horizontal (left and right) padding for the container */
	paddingX?: HxTabsPaddingX;
	/** Top padding for the container */
	paddingT?: HxTabsPaddingT;
	/** Bottom padding for the container */
	paddingB?: HxTabsPaddingB;
	contentContainerType?: HxTabBodyContainerType;
	/** Optional reactive model */
	$model?: HxObject<T>,
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T> | HxDataPath;
	content: HxTabsChildren;
}

export type OmittedTabsHTMLProps = HxOmittedAttributes | 'content' | 'children';

export type HxTabsProps<T extends object> =
	& HxExtTabsProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedTabsHTMLProps, T>;
