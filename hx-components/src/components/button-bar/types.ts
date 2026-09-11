import type {ReactNode} from 'react';
import type {HxFlexProps} from '../flex';

/**
 * Props for HxButtonBar component
 * Extends HxFlexProps to inherit all flex layout capabilities
 * Automatically manages button alignment based on provided button groups
 */
export interface HxButtonBarProps<T extends object> extends Omit<HxFlexProps<T>, 'data-hx-button-bar' | 'justifyContent' | 'children'> {
	/** Button group to render on the leading (left in LTR, right in RTL) side of the bar */
	leading?: ReactNode;
	/** Button group to render on the tailing (right in LTR, left in RTL) side of the bar */
	tailing?: ReactNode;
}
