// @ts-expect-error import React
import React from 'react';
import {HxOverlayTemplateProvider} from '../../contexts';
import {HxDialogPortal} from './dialog-portal';
import type {HxDialogProps} from './types';

/**
 * Dialog template component
 * Registers a dialog with the overlay system using the provided ID
 * Does not render anything until HxOverlayContext.show() is called with the matching ID
 * @param props - Dialog configuration properties
 */
export const HxDialog = (props: HxDialogProps) => {
	const {id, children, ...rest} = props;

	return <HxOverlayTemplateProvider id={id}>
		{/* @ts-expect-error ignore the type check for rest props passing */}
		<HxDialogPortal {...rest}>
			{children}
		</HxDialogPortal>
	</HxOverlayTemplateProvider>;
};
