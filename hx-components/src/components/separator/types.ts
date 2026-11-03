import type {HTMLAttributes} from 'react';
import type {
	HxColor,
	HxCommonProps,
	HxComponentMightHaveDataProps,
	HxDirection,
	HxHtmlElementProps,
	HxOmittedAtomicAttributes,
	HxOmittedDataAttributes,
	HxSize,
	HxStdProps
} from '../../types';

export type ExcludedSeparatorDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-separator';

/**
 * Properties for the HxSeparator component.
 * Provides a visual divider between content sections with configurable direction, color, and spacing.
 */
export interface HxExtSeparatorProps<T extends object>
	extends HxStdProps<T>, HxCommonProps<ExcludedSeparatorDataAttrNames, T>, HxComponentMightHaveDataProps<T> {
	/** Separator orientation: horizontal (dir-x) or vertical (dir-y) */
	direction?: HxDirection;
	/** Color of the separator line */
	color?: HxColor;
	/** Size of the separator: line length (horizontal) or height (vertical); thickness is fixed at 1px */
	size?: HxSize;
}

export type OmittedSeparatorHTMLProps = HxOmittedAtomicAttributes;

export type HxSeparatorProps<T extends object> =
	& HxExtSeparatorProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedSeparatorHTMLProps, T>;
