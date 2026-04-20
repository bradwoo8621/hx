// @ts-expect-error import React
import React from 'react';
import {createPortal} from 'react-dom';
import {HxOverlayInstanceProvider, useHxContext} from '../../contexts';
import {HxDialogDefaults} from './defaults';
import {HxDialogBackdrop} from './dialog-backdrop';
import {HxDialogContent} from './dialog-content';
import type {HxDialogPortalProps} from './types';

/**
 * Dialog portal component
 * Renders dialog content into document.body using React Portal to escape parent stacking contexts
 * Provides overlay instance context to all child dialog components
 * Applies current theme and language context attributes to the root portal element
 * @param props - Dialog portal configuration properties
 */
export const HxDialogPortal = <T extends object>(props: HxDialogPortalProps<T>) => {
	const {
		$overlayHandle,
		defaultHide = HxDialogDefaults.defaultHide, zIndex = HxDialogDefaults.zIndex,
		...rest
	} = props;

	const context = useHxContext();

	return <HxOverlayInstanceProvider $overlayHandle={$overlayHandle}>
		{createPortal(
			<div data-hx-portal-root=""
			     data-hx-theme={context.theme.current()}
			     data-hx-language={context.language.current()}
			     style={{zIndex}}>
				{/* Semi-transparent backdrop that blocks interaction with underlying page content */}
				<HxDialogBackdrop defaultHide={defaultHide}/>
				{/* Dialog content container with proper ARIA roles and automatic model propagation */}
				<HxDialogContent {...rest}/>
			</div>,
			document.body)}
	</HxOverlayInstanceProvider>;
};
