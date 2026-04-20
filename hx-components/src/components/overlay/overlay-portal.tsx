// @ts-expect-error import React
import React from 'react';
import {createPortal} from 'react-dom';
import {HxOverlayInstanceProvider, useHxContext} from '../../contexts';
import {HxOverlayDefaults} from './defaults';
import {HxOverlayBackdrop} from './overlay-backdrop';
import {HxOverlayContent} from './overlay-content';
import type {HxOverlayPortalProps} from './types';

/**
 * Overlay portal component
 * Renders overlay content into document.body using React Portal to escape parent stacking contexts
 * Provides overlay instance context to all child overlay components
 * Applies current theme and language context attributes to the root portal element
 * @param props - Overlay portal configuration properties
 */
export const HxOverlayPortal = <T extends object>(props: HxOverlayPortalProps<T>) => {
	const {
		$overlayHandle,
		defaultHide = HxOverlayDefaults.defaultHide, zIndex = HxOverlayDefaults.zIndex,
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
				<HxOverlayBackdrop defaultHide={defaultHide}/>
				{/* Overlay content container with proper ARIA roles and automatic model propagation */}
				<HxOverlayContent {...rest}/>
			</div>,
			document.body)}
	</HxOverlayInstanceProvider>;
};
