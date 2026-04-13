import {ERO, type ModelPath} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type MouseEventHandler,
	type ReactElement,
	type ReactNode,
	type RefAttributes,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef} from '../../hooks';
import type {
	HtmlElementProps,
	HxBorderRadius,
	HxGap,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxPadding,
	HxWrappedReactEvents,
	StdProps,
	WidthConstrainedProps
} from '../../types';
import {exposePropsToDOM, resolveChildModel} from '../../utils';
import {HxButton} from '../button';
import {
	HxFlex,
	type HxFlexAlignContent,
	type HxFlexAlignItems,
	type HxFlexGapX,
	type HxFlexGapY,
	type HxFlexJustifyContent,
	type HxFlexPaddingB,
	type HxFlexPaddingT,
	type HxFlexPaddingX
} from '../flex';
import {
	HxGrid,
	type HxGridAlignContent,
	type HxGridAlignItems,
	type HxGridColumns,
	type HxGridJustifyContent,
	type HxGridJustifyItems
} from '../grid';
import {Collapse, Expand} from '../icons';
import {HxLabel} from '../label';
import {HxPanelDefaults} from './defaults';

export type HxPanelBorderRadius = HxBorderRadius;
export type HxPanelHeaderJustifyContent = HxFlexJustifyContent;
export type HxPanelHeaderAlignItems = HxFlexAlignItems;
export type HxPanelHeaderAlignContent = HxFlexAlignContent;
export type HxPanelHeaderGapX = HxFlexGapX;
export type HxPanelHeaderGapY = HxFlexGapY;
export type HxPanelHeaderPaddingX = HxFlexPaddingX;
export type HxPanelHeaderPaddingT = HxFlexPaddingT;
export type HxPanelHeaderPaddingB = HxFlexPaddingB;
export type HxPanelBodyColumns = HxGridColumns;
export type HxPanelBodyJustifyItems = HxGridJustifyItems;
export type HxPanelBodyJustifyContent = HxGridJustifyContent;
export type HxPanelBodyAlignItems = HxGridAlignItems;
export type HxPanelBodyAlignContent = HxGridAlignContent;
export type HxPanelBodyGapX = HxGap;
export type HxPanelBodyGapY = HxGap;
export type HxPanelBodyPaddingX = HxPadding;
export type HxPanelBodyPaddingT = HxPadding;
export type HxPanelBodyPaddingB = HxPadding;

/**
 * Properties for the HxPanel layout component.
 * Provides responsive grid layout with configurable column count, spacing, and styling.
 */
export interface HxExtPanelProps<T extends object>
	extends StdProps<T>, WidthConstrainedProps {
	// panel
	border?: boolean;
	borderRadius?: HxPanelBorderRadius;
	collapsible?: boolean;
	defaultCollapsed?: boolean;
	title?: ReactNode;
	// header
	headerJustifyContent?: HxPanelHeaderJustifyContent;
	headerAlignItems?: HxPanelHeaderAlignItems;
	headerAlignContent?: HxPanelHeaderAlignContent;
	headerGapX?: HxPanelHeaderGapX;
	headerGapY?: HxPanelHeaderGapY;
	headerPaddingX?: HxPanelHeaderPaddingX;
	headerPaddingT?: HxPanelHeaderPaddingT;
	headerPaddingB?: HxPanelHeaderPaddingB;
	/** Additional HTML attributes to apply to the body div element */
	$domHeader?: HxWrappedReactEvents<HtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>>, T>;
	// body
	bodyColumns?: HxPanelBodyColumns;
	bodyJustifyItems?: HxPanelBodyJustifyItems;
	bodyJustifyContent?: HxPanelBodyJustifyContent;
	bodyAlignItems?: HxPanelBodyAlignItems;
	bodyAlignContent?: HxPanelBodyAlignContent;
	bodyGapX?: HxPanelBodyGapX;
	bodyGapY?: HxPanelBodyGapY;
	bodyPaddingX?: HxPanelBodyPaddingX;
	bodyPaddingT?: HxPanelBodyPaddingT;
	bodyPaddingB?: HxPanelBodyPaddingB;
	/** Additional HTML attributes to apply to the body div element */
	$domBody?: HxWrappedReactEvents<HtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>>, T>;
	/** Optional reactive model */
	$model?: HxObject<T>,
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T>;
}

export type OmittedPanelHTMLProps = HxOmittedAttributes | 'title';

export type HxPanelProps<T extends object> =
	& HxExtPanelProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedPanelHTMLProps, T>;

export type HxPanelType = <T extends object>(
	props: HxPanelProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxPanel =
	forwardRef(<T extends object>(props: HxPanelProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			// panel
			border = HxPanelDefaults.border, borderRadius = HxPanelDefaults.borderRadius,
			collapsible = HxPanelDefaults.collapsible, defaultCollapsed = HxPanelDefaults.defaultCollapsed,
			title,
			// header
			headerJustifyContent = HxPanelDefaults.headerJustifyContent,
			headerAlignItems = HxPanelDefaults.headerAlignItems,
			headerAlignContent = HxPanelDefaults.headerAlignContent,
			headerGapX = HxPanelDefaults.headerGapX, headerGapY = HxPanelDefaults.headerGapY,
			headerPaddingX = HxPanelDefaults.headerPaddingX,
			headerPaddingT = HxPanelDefaults.headerPaddingT, headerPaddingB = HxPanelDefaults.headerPaddingB,
			$domHeader,
			// body
			bodyColumns = HxPanelDefaults.bodyColumns,
			bodyJustifyItems = HxPanelDefaults.bodyJustifyItems,
			bodyJustifyContent = HxPanelDefaults.bodyJustifyContent,
			bodyAlignItems = HxPanelDefaults.bodyAlignItems, bodyAlignContent = HxPanelDefaults.bodyAlignContent,
			bodyGapX = HxPanelDefaults.bodyGapX, bodyGapY = HxPanelDefaults.bodyGapY,
			bodyPaddingX = HxPanelDefaults.bodyPaddingX,
			bodyPaddingT = HxPanelDefaults.bodyPaddingT, bodyPaddingB = HxPanelDefaults.bodyPaddingB,
			$domBody,
			children,
			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);
		const containerRef = useDualRef(ref);
		const collapseRef = useRef({collapsible, collapsed: defaultCollapsed});

		const onCollapseClick: MouseEventHandler<HTMLButtonElement> = () => {
			collapseRef.current.collapsed = !collapseRef.current.collapsed;
			if (collapseRef.current.collapsed) {
				containerRef.current?.setAttribute('data-hx-panel-collapsed', '');
			} else {
				containerRef.current?.removeAttribute('data-hx-panel-collapsed');
			}
		};

		const $modelToChild = resolveChildModel($model, $field);
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            data-hx-panel=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            data-hx-panel-border={border ? '' : (void 0)} data-hx-panel-border-radius={borderRadius}
			// eslint-disable-next-line react-hooks/refs
			        data-hx-panel-collapsible={collapseRef.current.collapsible}
			// eslint-disable-next-line react-hooks/refs
			        data-hx-panel-collapsed={collapseRef.current.collapsed ? '' : (void 0)}
			        data-hx-visible={(visible ?? true) ? '' : (void 0)}
			        ref={containerRef}>
			<HxFlex {...$domHeader} $model={$modelToChild}
			        border={false}
			        justifyContent={headerJustifyContent}
			        alignItems={headerAlignItems} alignContent={headerAlignContent}
			        gapX={headerGapX} gapY={headerGapY}
			        paddingX={headerPaddingX} paddingT={headerPaddingT} paddingB={headerPaddingB}
			        data-hx-panel-header="">
				<HxLabel $model={$modelToChild} text={title} data-hx-panel-title=""/>
				{/* eslint-disable-next-line react-hooks/refs */}
				{collapseRef.current.collapsible
					? (<HxButton various="ghost"
					             text={<><Expand/><Collapse/></>}
					             onClick={onCollapseClick}
					             data-hx-panel-collapse-button=""/>)
					: (void 0)}
			</HxFlex>
			<HxGrid {...$domBody} $model={$modelToChild}
			        border={false}
			        columns={bodyColumns}
			        justifyItems={bodyJustifyItems} justifyContent={bodyJustifyContent}
			        alignItems={bodyAlignItems} alignContent={bodyAlignContent}
			        gapX={bodyGapX} gapY={bodyGapY}
			        paddingX={bodyPaddingX} paddingT={bodyPaddingT} paddingB={bodyPaddingB}
			        data-hx-panel-body="">
				{children}
			</HxGrid>
		</div>;
	}) as unknown as HxPanelType;
// @ts-expect-error assign component name
HxPanel.displayName = 'HxPanel';
