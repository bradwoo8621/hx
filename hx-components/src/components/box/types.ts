import type {HTMLAttributes} from 'react';
import type {
	HxCommonProps,
	HxComponentMightHaveDataSingleFieldProps,
	HxHtmlElementProps,
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
	extends HxStdProps<T>, HxCommonProps<ExcludedBoxDataAttrNames, T>, HxComponentMightHaveDataSingleFieldProps<T> {
}

export type OmittedBoxHTMLProps = HxOmittedAttributes;

export type HxBoxProps<T extends object> =
	& HxExtBoxProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedBoxHTMLProps, T>;
