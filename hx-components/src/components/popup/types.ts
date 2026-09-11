import type {ReactNode} from 'react';
import type {HxDomDataAttrName} from '../../types';

export type HxPopupDataAttrName = Exclude<HxDomDataAttrName, 'data-hx-popup' | 'data-hx-popup-state'>

/**
 * Popup container component props
 */
export interface HxPopupProps {
	/** Z-index for the popup container */
	zIndex: number;
	/** Minimum gap between popup edge and viewport boundary */
	gapToEdge: number;
	/** Popup with at minimum same width with trigger */
	sameWidthAtMinimum: boolean;

	/** Content to render inside the popup */
	children: ReactNode;
	/** role is fixed internally */
	role?: undefined;
	/** data attributes */
	[key: HxPopupDataAttrName]: string;
}
