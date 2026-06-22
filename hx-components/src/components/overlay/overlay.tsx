// @ts-expect-error import React
import React from 'react';
import {HxOverlayTemplateProvider} from '../../contexts';
import {HxOverlayPortal} from './overlay-portal';
import type {HxOverlayProps} from './types';

/**
 * Overlay template component.
 * Registers an overlay with the overlay system using the provided ID.
 * Does not render anything until HxOverlayContext.show() is called with the matching ID.
 *
 * @param props - Overlay configuration properties
 */
export const HxOverlay = (props: HxOverlayProps) => {
	const {id, children, ...rest} = props;

	return <HxOverlayTemplateProvider id={id}>
		{/* @ts-expect-error ignore the type check for rest props passing */}
		<HxOverlayPortal {...rest}>
			{children}
		</HxOverlayPortal>
	</HxOverlayTemplateProvider>;
};
