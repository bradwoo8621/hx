// @ts-expect-error import React
import React from 'react';
import {createPortal} from 'react-dom';
import {HxOverlayInstanceProvider, useHxContext} from '../../contexts';
import {HxAlertBackdrop} from './alert-backdrop';
import {HxAlertContent} from './alert-content';
import {HxAlertDefaults} from './defaults';
import type {HxAlertPortalProps} from './types';

/**
 * Alert portal component
 * Renders alert content into document.body using React Portal to escape parent stacking contexts
 * Provides overlay instance context to all child alert components
 * Applies current theme and language context attributes to the root portal element
 * @param props - Alert portal configuration properties
 */
export const HxAlertPortal = <T extends object>(props: HxAlertPortalProps<T>) => {
	const {
		$overlayHandle,
		defaultHide = HxAlertDefaults.defaultHide, zIndex = HxAlertDefaults.zIndex,
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
				<HxAlertBackdrop defaultHide={defaultHide}/>
				{/* Alert content container with proper ARIA roles and automatic model propagation */}
				<HxAlertContent {...rest}/>
			</div>,
			document.body)}
	</HxOverlayInstanceProvider>;
};
