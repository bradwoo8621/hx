import type {HTMLAttributes} from 'react';
import type {CheckPropSuppliedOn} from '../../hooks';
import type {CheckProps, HxComponentDataProps, HxHtmlElementProps, HxOmittedAttributes} from '../../types';
import type {OmittedLabelHTMLProps} from '../label';

/**
 * Options for creating a with-check wrapped component.
 * Provides configuration for how validation should be applied to the base component.
 */
export interface HxWithCheckCreateOptions<T extends object, P extends HxComponentDataProps<T>> {
	/**
	 * Function that returns the field path(s) to monitor for changes.
	 * Validation will be triggered when any of these fields change.
	 */
	$supplyOn?: (props: P) => CheckPropSuppliedOn;
}

// @ts-expect-error Generic P type extends component props with $model field
export interface HxExtWithCheckProps<T extends object, P extends HxComponentDataProps<T>> extends P, CheckProps<T> {
	/**
	 * When true, always renders the message DOM element even when there is no error.
	 * When false, only renders the message element when there is an error to display.
	 */
	alwaysKeepMessageDOM?: boolean;
	/** Additional HTML attributes to apply to the wrapper div element */
	$domCheckBox?: HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, HxOmittedAttributes, T>;
	/** Additional HTML attributes to apply to the message element */
	$domCheckMsg?: HxHtmlElementProps<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>, OmittedLabelHTMLProps, T>;
}

/** Props for a component wrapped with HxWithCheck HOC */
export type HxWithCheckProps<T extends object, P extends HxComponentDataProps<T>> = HxExtWithCheckProps<T, P> & {
	/**
	 * Pinned to `undefined` instead of omitted: `Omit` over the generic intersection has to resolve its
	 * whole key union, which makes every site referring to this type fail to resolve, the same reason
	 * HxInputBoxProps spells its marker out. The wrapper writes this attribute itself, so it has no
	 * usable prop value.
	 */
	'data-hx-with-check'?: undefined
};
