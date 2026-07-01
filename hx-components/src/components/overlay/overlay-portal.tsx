// @ts-expect-error import React
import React from 'react';
import {createPortal} from 'react-dom';
import {HxOverlayInstanceProvider} from '../../contexts';
import {HxOverlayInternalContextProvider} from './overlay-internal-context';
import {HxOverlayPortalRoot} from './overlay-portal-root';
import type {HxOverlayPortalProps} from './types';

/**
 * Overlay portal component.
 * Renders overlay content into `document.body` using React Portal to escape parent stacking contexts.
 * Provides overlay instance context to all child overlay components.
 * Applies current theme and language context attributes to the root portal element.
 *
 * @param props - Overlay portal configuration properties
 */
export const HxOverlayPortal = <T extends object>(props: HxOverlayPortalProps<T>) => {
	const {$overlayHandle, ...rest} = props;

	return <HxOverlayInstanceProvider $overlayHandle={$overlayHandle}>
		{createPortal(<HxOverlayInternalContextProvider>
			<HxOverlayPortalRoot {...rest}/>
		</HxOverlayInternalContextProvider>, document.body)}
	</HxOverlayInstanceProvider>;
};
