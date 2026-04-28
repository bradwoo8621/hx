import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef} from '../../hooks';
import {exposePropsToDOM, resolveChildModel, restoreScroll} from '../../utils';
import {HxPanelDefaults} from './defaults';
import {HxPanelBody, type HxPanelBodyProps} from './panel-body';
import {HxPanelHeader, type HxPanelHeaderProps} from './panel-header';
import {HxPanelProvider, useHxPanel} from './panel-provider';
import type {HxPanelProps} from './types';

const HxPanelInner =
	forwardRef(<T extends object>(props: HxPanelProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			// panel
			border = HxPanelDefaults.border, borderRadius = HxPanelDefaults.borderRadius,
			collapsible = HxPanelDefaults.collapsible, defaultCollapsed = HxPanelDefaults.defaultCollapsed,
			// header
			title,
			headerJustifyContent, headerAlignItems, headerAlignContent,
			headerGapX, headerGapY, headerPaddingX, headerPaddingT, headerPaddingB,
			$domHeader,
			// body
			bodyColumns,
			bodyJustifyItems, bodyJustifyContent, bodyAlignItems, bodyAlignContent,
			bodyGapX, bodyGapY, bodyPaddingX, bodyPaddingT, bodyPaddingB,
			$domBody,
			restoreScroll: shouldRestoreScroll = HxPanelDefaults.restoreScroll,
			children,
			...rest
		} = props;

		/** Hx application context for force updates */
		const context = useHxContext();
		/** Component visibility status from data monitor */
		const {visible} = useDataMonitor(props);
		const containerRef = useDualRef(ref);
		/** Ref storing collapsible state and configuration */
		const collapseRef = useRef({collapsible, collapsed: defaultCollapsed});
		const panelContext = useHxPanel();
		useEffect(() => {
			if (containerRef.current == null) {
				return;
			}

			const onCheckCollapsed = (callback: (collapsed: boolean) => void) => {
				callback(collapseRef.current.collapsed);
			};
			const onCollapse = () => {
				if (collapseRef.current.collapsed) {
					return;
				}
				collapseRef.current.collapsed = true;
				containerRef.current?.setAttribute('data-hx-panel-collapsed', '');
				if (shouldRestoreScroll) {
					restoreScroll(containerRef.current?.querySelector(':scope > div[data-hx-panel-body]'));
				}
			};
			const onExpand = () => {
				if (!collapseRef.current.collapsed) {
					return;
				}
				collapseRef.current.collapsed = false;
				containerRef.current?.removeAttribute('data-hx-panel-collapsed');
			};

			panelContext.onCheckCollapsed(onCheckCollapsed);
			panelContext.onCollapse(onCollapse);
			panelContext.onExpand(onExpand);

			return () => {
				panelContext.offCheckCollapsed(onCheckCollapsed);
				panelContext.offCollapse(onCollapse);
				panelContext.offExpand(onExpand);

			};
		}, [shouldRestoreScroll, containerRef, panelContext]);

		/** Resolved child model for automatic propagation to panel children */
		const $modelToChild = resolveChildModel($model, $field);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const headerProps: HxPanelHeaderProps<any> = {
			$model: $modelToChild, collapsible,
			title,
			headerJustifyContent,
			headerAlignItems, headerAlignContent,
			headerGapX, headerGapY, headerPaddingX, headerPaddingT, headerPaddingB,
			$domHeader
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const bodyProps: HxPanelBodyProps<any> = {
			$model: $modelToChild,
			bodyColumns,
			bodyJustifyItems, bodyJustifyContent, bodyAlignItems, bodyAlignContent,
			bodyGapX, bodyGapY, bodyPaddingX, bodyPaddingT, bodyPaddingB,
			$domBody,
			children
		};
		/** Processed props exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            data-hx-panel=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            data-hx-panel-collapsible={collapsible}
		            data-hx-panel-collapsed={defaultCollapsed ? '' : (void 0)}
		            data-hx-border={border ? '' : (void 0)} data-hx-border-radius={borderRadius}
		            data-hx-visible={(visible ?? true) ? '' : 'no'}
		            ref={containerRef}>
			<HxPanelHeader {...headerProps} />
			<HxPanelBody {...bodyProps} />
		</div>;
	});
HxPanelInner.displayName = 'HxPanelInner';

/** Component type definition for HxPanel */
export type HxPanelType = <T extends object>(
	props: HxPanelProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Panel layout component with flexible header and grid body
 * Supports collapsible functionality, automatic model propagation to children,
 * and highly customizable styling and layout options
 * @param props - Component props
 * @param ref - Forwarded ref to root div element
 */
export const HxPanel =
	forwardRef(<T extends object>(props: HxPanelProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		return <HxPanelProvider>
			{/* @ts-expect-error ignore check */}
			<HxPanelInner {...props} ref={ref}/>
		</HxPanelProvider>;
	}) as unknown as HxPanelType;
// @ts-expect-error assign component name
HxPanel.displayName = 'HxPanel';
