import {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {DOMUtils} from '../../utils';
import {HxOverlayDefaults} from './defaults';
import {HxOverlayBackdrop} from './overlay-backdrop';
import {HxOverlayContent} from './overlay-content';
import {useHxOverlayInternalContext} from './overlay-internal-context';
import type {HxOverlayPortalRootProps} from './types';

export const HxOverlayPortalRoot = <T extends object>(props: HxOverlayPortalRootProps<T>) => {
	const {
		role,
		hideOnClickBackdrop = HxOverlayDefaults.hideOnClickBackdrop, hideOnEscape = HxOverlayDefaults.hideOnEscape,
		zIndex = HxOverlayDefaults.zIndex,
		...rest
	} = props;

	const context = useHxContext();
	const internalContext = useHxOverlayInternalContext();
	const rootRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (!hideOnClickBackdrop) {
			return;
		}

		const div = rootRef.current?.querySelector(':scope > div[data-hx-overlay-backdrop]') as HTMLElement | null;
		const onBackdropClick = () => {
			internalContext.hide('backdrop-click');
		};
		div?.addEventListener('click', onBackdropClick);
		return () => {
			div?.removeEventListener('click', onBackdropClick);
		};
	}, [hideOnClickBackdrop, internalContext]);
	useEffect(() => {
		if (!hideOnEscape) {
			return;
		}

		const div = rootRef.current?.querySelector(':scope > div[data-hx-overlay]') as HTMLElement | null;
		const onKeyDown = (ev: KeyboardEvent) => {
			if (ev.key === 'Escape') {
				internalContext.hide('escape');
				ev.preventDefault();
			}
		};
		div?.addEventListener('keydown', onKeyDown);

		return () => {
			div?.removeEventListener('keydown', onKeyDown);
		};
	}, [hideOnEscape, internalContext]);
	useEffect(() => {
		const div = rootRef.current?.querySelector(':scope > div[data-hx-overlay]') as HTMLElement | null;
		const onKeyDown = (ev: KeyboardEvent) => {
			if (ev.key !== 'Tab') {
				return;
			}
			if (ev.shiftKey) {
				const [previous] = DOMUtils.anteroposteriorTabNodes(ev.target as HTMLElement);
				previous?.focus();
			} else {
				const [, next] = DOMUtils.anteroposteriorTabNodes(ev.target as HTMLElement);
				next?.focus();
			}
			ev.preventDefault();
		};
		div?.addEventListener('keydown', onKeyDown);

		return () => {
			div?.removeEventListener('keydown', onKeyDown);
		};
	}, [internalContext]);

	return <div data-hx-portal-root=""
	            data-hx-theme={context.theme.current()}
	            data-hx-language={context.language.current()}
	            style={{zIndex}}
	            ref={rootRef}>
		{/* Semi-transparent backdrop that blocks interaction with underlying page content */}
		<HxOverlayBackdrop role={role}/>
		{/* Overlay content container with proper ARIA roles and automatic model propagation */}
		<HxOverlayContent {...rest} role={role}/>
	</div>;
};
