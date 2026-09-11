import type {ModelPath} from '@hx/data';
import type {ButtonHTMLAttributes, ReactNode} from 'react';
import type {
	DisabledProps,
	HxColor,
	HxCommonProps,
	HxDataPath,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAtomicAttributes,
	HxOmittedDataAttributes,
	HxStdProps
} from '../../types';

/** Button visual variants: solid fill, outlined border, or ghost/transparent */
export type HxButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';

export type ExcludedButtonDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-button';

/**
 * Properties for the HxButton component.
 * Extends standard HTML button attributes with reactive data binding capabilities.
 */
export interface HxExtButtonProps<T extends object>
	extends HxStdProps<T>, DisabledProps<T>, HxCommonProps<ExcludedButtonDataAttrNames, T> {
	/** Button color theme from design system palette */
	color?: HxColor;
	/** Button visual style variant */
	variant?: HxButtonVariant;
	/** Apply uppercase text transform. Ignored when $field is specified. */
	uppercase?: boolean;
	/** Whether to apply i18n translation to values retrieved from the model */
	valueUseI18N?: boolean;
	/** Static button text content. Ignored when $field is specified. */
	text?: ReactNode;
	/** Optional reactive model */
	$model?: HxObject<T>,
	/** Path to reactive field on $model whose value will be used as button text */
	$field?: ModelPath<T> | HxDataPath;
}

export type OmittedButtonHTMLProps =
	| HxOmittedAtomicAttributes
	| 'disabled' | 'type' | 'value';

export type HxButtonProps<T extends object> =
	& HxExtButtonProps<T>
	& HxHtmlElementProps<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>, OmittedButtonHTMLProps, T>;
