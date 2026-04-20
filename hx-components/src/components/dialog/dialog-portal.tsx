// @ts-expect-error import React
import React from 'react';
import {createPortal} from 'react-dom';
import {HxOverlayInstanceProvider, useHxContext} from '../../contexts';
import {HxDialogDefaults} from './defaults';
import {HxDialogBackdrop} from './dialog-backdrop';
import {HxDialogContent} from './dialog-content';
import type {HxDialogPortalProps} from './types';

export const HxDialogPortal = <T extends object>(props: HxDialogPortalProps<T>) => {
	const {$overlayHandle, zIndex = HxDialogDefaults.zIndex, ...rest} = props;

	const context = useHxContext();

	return <HxOverlayInstanceProvider $overlayHandle={$overlayHandle}>
		{createPortal(
			<div data-hx-portal-root=""
			     data-hx-theme={context.theme.current()}
			     data-hx-language={context.language.current()}
			     style={{zIndex}}>
				<HxDialogBackdrop/>
				<HxDialogContent {...rest}/>
			</div>,
			document.body)}
	</HxOverlayInstanceProvider>;
};
