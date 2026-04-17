// @ts-expect-error import React
import React from 'react';
import {HxOverlayTemplateProvider} from '../../contexts';
import {HxDialogPortal} from './dialog-portal';
import type {HxDialogInstanceProps} from './types';

/**
 * this is a dialog template, children is content.
 * will render nothing till call HxOverlayContext.show().
 */
export const HxDialog = <T extends object>(props: HxDialogInstanceProps<T>) => {
	const {id, children, ...rest} = props;

	return <HxOverlayTemplateProvider id={id}>
		<HxDialogPortal {...rest}>
			{children}
		</HxDialogPortal>
	</HxOverlayTemplateProvider>;
};
