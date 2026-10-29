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
		tabTrap = true,
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

		const onBackdropClick = () => {
			internalContext.hide('backdrop-click');
		};
		const backdrop = rootRef.current?.querySelector<HTMLElement>(':scope > div[data-hx-overlay-backdrop]');
		backdrop?.addEventListener('click', onBackdropClick);

		return () => {
			backdrop?.removeEventListener('click', onBackdropClick);
		};
	}, [hideOnClickBackdrop, internalContext]);
	useEffect(() => {
		if (!hideOnEscape) {
			return;
		}

		const onKeyDown = (ev: KeyboardEvent) => {
			if (ev.key === 'Escape') {
				internalContext.hide('escape');
				ev.preventDefault();
			}
		};
		const content = rootRef.current?.querySelector<HTMLElement>(':scope > div[data-hx-overlay]');
		const backdrop = rootRef.current?.querySelector<HTMLElement>(':scope > div[data-hx-overlay-backdrop]');
		content?.addEventListener('keydown', onKeyDown);
		backdrop?.addEventListener('keydown', onKeyDown);

		return () => {
			content?.removeEventListener('keydown', onKeyDown);
			backdrop?.removeEventListener('keydown', onKeyDown);
		};
	}, [hideOnEscape, internalContext]);
	useEffect(() => {
		if (!tabTrap) {
			// ignore tab trap for toast
			return;
		}

		const onContentKeyDown = (ev: KeyboardEvent) => {
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
		const content = rootRef.current?.querySelector<HTMLElement>(':scope > div[data-hx-overlay]');
		content?.addEventListener('keydown', onContentKeyDown);

		const onBackdropKeyDown = (ev: KeyboardEvent) => {
			if (ev.key !== 'Tab') {
				return;
			}

			const content = rootRef.current?.querySelector<HTMLElement>(':scope > div[data-hx-overlay]');
			let toFocusElement: HTMLElement | null | undefined;
			if (ev.shiftKey) {
				toFocusElement = DOMUtils.findLastFocusableElement(content);
			} else {
				toFocusElement = content?.querySelector<HTMLElement>(':scope [data-hx-first-element]')
					?? DOMUtils.findFirstFocusableElement(content);
			}
			if (toFocusElement != null) {
				toFocusElement.focus();
			} else {
				content?.focus();
			}
			ev.preventDefault();
		};
		const backdrop = rootRef.current?.querySelector(':scope > div[data-hx-overlay-backdrop]') as HTMLElement | null;
		backdrop?.addEventListener('keydown', onBackdropKeyDown);

		return () => {
			content?.removeEventListener('keydown', onContentKeyDown);
			backdrop?.removeEventListener('keydown', onBackdropKeyDown);
		};
	}, [tabTrap, internalContext]);

	return <div data-hx-portal-root=""
	            data-hx-theme={context.theme.currentForDOM()}
	            data-hx-language={context.language.current()}
	            style={{zIndex}}
	            ref={rootRef}>
		{/* Semi-transparent backdrop that blocks interaction with underlying page content */}
		<HxOverlayBackdrop role={role}/>
		{/* Overlay content container with proper ARIA roles and automatic model propagation */}
		<HxOverlayContent {...rest} role={role}/>
	</div>;
};
