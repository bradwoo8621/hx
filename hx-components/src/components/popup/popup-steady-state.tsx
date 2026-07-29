// @ts-expect-error import React
import React, {type ReactNode} from 'react';

/**
 * Props for the HxPopupSteadyState component
 */
export interface HxPopupSteadyStateProps {
	/** Data initializer components that need to exist even when popup is closed */
	data?: ReactNode;
}

/**
 * HxPopupSteadyState renders steady state/data initializers that must remain mounted
 * in the React tree even when the popup is closed/hidden.
 *
 * Use this to wrap form data providers, state initializers, or other
 * components that should persist independently of popup visibility.
 */
export const HxPopupSteadyState = (props: HxPopupSteadyStateProps) => {
	return <>
		{props.data}
	</>;
};
