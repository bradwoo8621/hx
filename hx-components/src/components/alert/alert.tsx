// @ts-expect-error import React
import React from 'react';
import {HxOverlayTemplateProvider} from '../../contexts';
import {HxAlertPortal} from './alert-portal';
import type {HxAlertProps} from './types';

/**
 * Alert template component
 * Registers a dialog with the overlay system using the provided ID
 * Does not render anything until HxOverlayContext.show() is called with the matching ID
 * @param props - Alert configuration properties
 */
export const HxAlert = (props: HxAlertProps) => {
	const {id, children, ...rest} = props;

	return <HxOverlayTemplateProvider id={id}>
		{/* @ts-expect-error ignore the type check for rest props passing */}
		<HxAlertPortal {...rest}>
			{children}
		</HxAlertPortal>
	</HxOverlayTemplateProvider>;
};
