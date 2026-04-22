import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type HTMLAttributes, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import type {HxHtmlElementProps} from '../../types';
import {exposePropsToDOM, handleScrollResizeOfAncestors} from '../../utils';
import {HxFlex} from '../flex';
import {useHxPopupContext} from '../popup';
import {buildContent} from './actions-builder';
import {
	EvtHxActions_ClosePopup,
	type HxActionsColor,
	type HxActionsLeading,
	type HxActionVarious,
	type HxExtActionsProps,
	type OmittedActionsHTMLProps
} from './types';

export type HxActionsLeadingProps<T extends object> =
	& Pick<HxExtActionsProps<T>, '$model'>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedActionsHTMLProps, T>
	& {
	color: HxActionsColor;
	various: HxActionVarious;
	leading: HxActionsLeading;
	/** Whether the select is visible */
	visible: boolean;
	/** Whether the select is disabled */
	disabled: boolean;
};

export const HxActionsLeadingContent =
	forwardRef(<T extends object>(props: HxActionsLeadingProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model,
			color, various, visible, disabled,
			leading,
			...rest
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const actionsRef = useDualRef(ref);
		const visibleRef = useRef((() => {
			const state: {
				visible: boolean;
				install: (disabled: boolean) => (() => void);
				uninstall?: (() => void),
				hide: () => void;
			} = {
				visible: false,
				install: (disabled: boolean) => {
					const uninstall = handleScrollResizeOfAncestors(actionsRef.current,
						() => {
							// HxConsole.debug('scroll or resize to relocate');
							if (!disabled && state.visible) {
								popupContext.relayout(actionsRef.current!, {});
							}
						},
						() => {
							// HxConsole.debug('scroll or resize to hide');
							// no need to check event target, they are ancestors of select, always trigger
							state.hide();
							popupContext.hide();
						});

					return () => {
						// HxConsole.debug('Uninstall focus/click/scroll/resize listeners.');
						uninstall();
						delete state.uninstall;
					};
				},
				uninstall: (void 0),
				hide: () => {
					state.visible = false;
					state.uninstall?.();
				}
			};
			return {
				show: (disabled: boolean) => {
					state.visible = true;
					state.uninstall?.();
					state.uninstall = state.install(disabled);
				},
				hide: state.hide,
				isVisible: () => state.visible,
				clean: state.uninstall as (() => void) | undefined
			} as const;
		})());
		useEffect(() => {
			const onClosePopup = () => {
				if (!disabled && visibleRef.current.isVisible()) {
					visibleRef.current.hide();
					popupContext.hide();
				}
			};

			popupContext.on(EvtHxActions_ClosePopup, onClosePopup);
			return () => {
				popupContext.off(EvtHxActions_ClosePopup, onClosePopup);
			};
		}, [$model, popupContext, context, actionsRef, disabled]);

		const isPopupOpenable = (): boolean => {
			return !disabled && !visibleRef.current.isVisible();
		};
		const isPopupOpened = (): boolean => {
			return !disabled && visibleRef.current.isVisible();
		};
		const openPopup = () => {
			if (isPopupOpenable()) {
				visibleRef.current.show(disabled);
				popupContext.show(actionsRef.current!, {});
			}
		};
		const closePopup = () => {
			if (isPopupOpened()) {
				visibleRef.current.hide();
				popupContext.hide();
			}
		};

		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);
		// eslint-disable-next-line react-hooks/refs
		const content = buildContent({
			actions: leading,
			$model, disabled, color, various,
			openPopup, closePopup
		});

		return <HxFlex {...restProps}
		               wrap={false} alignItems="center" gapX="none"
		               style={{
			               // @ts-expect-error ignore the name check
			               '--hx-border-radius': 'var(--hx-border-radius-atomic)'
		               }}
		               data-hx-actions=""
		               data-hx-model-path={ERO.loosePathOf($model)}
		               data-hx-visible={(visible ?? true) ? '' : (void 0)}
		               data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		               ref={actionsRef}>
			{content}
		</HxFlex>;
	});
