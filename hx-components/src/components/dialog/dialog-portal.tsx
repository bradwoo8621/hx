// @ts-expect-error import React
import React, {useRef} from 'react';
import {createPortal} from 'react-dom';
import {useHxContext} from '../../contexts';
import {interposeToChildren} from '../../utils';
import type {HxDialogPortalProps} from './types';

type RenderState = 'hidden' | 'prepare' | 'prepared' | 'active' | 'hide';

export const HxDialogPortal = <T extends object>(props: HxDialogPortalProps<T>) => {
	const {
		// $overlayHandle,
		$model,
		zIndex,
		children,
		...rest
	} = props;

	const context = useHxContext();
	// const instanceContext = useHxOverlayInstancesContext();
	const renderStateRef = useRef<RenderState>('hidden');
	const ref = useRef<HTMLDivElement | null>(null);

	return createPortal(
		<div data-hx-portal-root=""
		     data-hx-theme={context.theme.current()}
		     data-hx-language={context.language.current()}
		     style={{zIndex}}>
			<div {...rest} data-hx-dialog="" role="dialog"
				// eslint-disable-next-line react-hooks/refs
				 data-hx-dialog-state={renderStateRef.current}
				 style={{zIndex}}
				 ref={ref}>
				{interposeToChildren({$model}, children)}
			</div>
		</div>,
		document.body);
};
