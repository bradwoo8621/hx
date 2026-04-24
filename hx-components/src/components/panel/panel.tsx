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
	HxDataPath,
	HxGap,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxPadding,
	HxStdProps,
	HxWidthConstrainedProps,
	HxWrappedReactEvents
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

/** Panel border radius size type */
export type HxPanelBorderRadius = HxBorderRadius;
/** Panel header flex layout justify-content type */
export type HxPanelHeaderJustifyContent = HxFlexJustifyContent;
/** Panel header flex layout align-items type */
export type HxPanelHeaderAlignItems = HxFlexAlignItems;
/** Panel header flex layout align-content type */
export type HxPanelHeaderAlignContent = HxFlexAlignContent;
/** Panel header horizontal gap size type */
export type HxPanelHeaderGapX = HxFlexGapX;
/** Panel header vertical gap size type */
export type HxPanelHeaderGapY = HxFlexGapY;
/** Panel header horizontal padding size type */
export type HxPanelHeaderPaddingX = HxFlexPaddingX;
/** Panel header top padding size type */
export type HxPanelHeaderPaddingT = HxFlexPaddingT;
/** Panel header bottom padding size type */
export type HxPanelHeaderPaddingB = HxFlexPaddingB;
/** Panel body grid columns count type */
export type HxPanelBodyColumns = HxGridColumns;
/** Panel body grid layout justify-items type */
export type HxPanelBodyJustifyItems = HxGridJustifyItems;
/** Panel body grid layout justify-content type */
export type HxPanelBodyJustifyContent = HxGridJustifyContent;
/** Panel body grid layout align-items type */
export type HxPanelBodyAlignItems = HxGridAlignItems;
/** Panel body grid layout align-content type */
export type HxPanelBodyAlignContent = HxGridAlignContent;
/** Panel body horizontal gap size type */
export type HxPanelBodyGapX = HxGap;
/** Panel body vertical gap size type */
export type HxPanelBodyGapY = HxGap;
/** Panel body horizontal padding size type */
export type HxPanelBodyPaddingX = HxPadding;
/** Panel body top padding size type */
export type HxPanelBodyPaddingT = HxPadding;
/** Panel body bottom padding size type */
export type HxPanelBodyPaddingB = HxPadding;

/**
 * Properties for the HxPanel layout component.
 * Provides responsive grid layout with configurable column count, spacing, and styling.
 */
export interface HxExtPanelProps<T extends object>
	extends HxStdProps<T>, HxWidthConstrainedProps {
	// panel
	/** Whether to show panel border */
	border?: boolean;
	/** Panel border radius size */
	borderRadius?: HxPanelBorderRadius;
	/** Whether the panel can be collapsed/expanded */
	collapsible?: boolean;
	/** Whether the panel is collapsed by default when collapsible */
	defaultCollapsed?: boolean;
	/** Panel title text displayed in header */
	title?: ReactNode;
	// header
	/** justify-content value for panel header flex layout */
	headerJustifyContent?: HxPanelHeaderJustifyContent;
	/** align-items value for panel header flex layout */
	headerAlignItems?: HxPanelHeaderAlignItems;
	/** align-content value for panel header flex layout */
	headerAlignContent?: HxPanelHeaderAlignContent;
	/** Horizontal gap size between header items */
	headerGapX?: HxPanelHeaderGapX;
	/** Vertical gap size between header items */
	headerGapY?: HxPanelHeaderGapY;
	/** Horizontal padding for panel header */
	headerPaddingX?: HxPanelHeaderPaddingX;
	/** Top padding for panel header */
	headerPaddingT?: HxPanelHeaderPaddingT;
	/** Bottom padding for panel header */
	headerPaddingB?: HxPanelHeaderPaddingB;
	/** Additional HTML attributes to apply to the header div element */
	$domHeader?: HxWrappedReactEvents<HtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>>, T>;
	// body
	/** Number of grid columns for panel body */
	bodyColumns?: HxPanelBodyColumns;
	/** justify-items value for panel body grid layout */
	bodyJustifyItems?: HxPanelBodyJustifyItems;
	/** justify-content value for panel body grid layout */
	bodyJustifyContent?: HxPanelBodyJustifyContent;
	/** align-items value for panel body grid layout */
	bodyAlignItems?: HxPanelBodyAlignItems;
	/** align-content value for panel body grid layout */
	bodyAlignContent?: HxPanelBodyAlignContent;
	/** Horizontal gap size between body grid items */
	bodyGapX?: HxPanelBodyGapX;
	/** Vertical gap size between body grid items */
	bodyGapY?: HxPanelBodyGapY;
	/** Horizontal padding for panel body */
	bodyPaddingX?: HxPanelBodyPaddingX;
	/** Top padding for panel body */
	bodyPaddingT?: HxPanelBodyPaddingT;
	/** Bottom padding for panel body */
	bodyPaddingB?: HxPanelBodyPaddingB;
	/** Additional HTML attributes to apply to the body div element */
	$domBody?: HxWrappedReactEvents<HtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>>, T>;
	/** Optional reactive model for automatic propagation to child components */
	$model?: HxObject<T>,
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T> | HxDataPath;
}

/** HTML attributes that are omitted from panel root element */
export type OmittedPanelHTMLProps = HxOmittedAttributes | 'title';

/** Complete props interface for HxPanel component */
export type HxPanelProps<T extends object> =
	& HxExtPanelProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedPanelHTMLProps, T>;

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

		/** Hx application context for force updates */
		const context = useHxContext();
		/** Component visibility status from data monitor */
		const {visible} = useDataMonitor(props);
		/** Dual ref combining forwarded ref and internal ref for panel container */
		const containerRef = useDualRef(ref);
		/** Ref storing collapsible state and configuration */
		const collapseRef = useRef({collapsible, collapsed: defaultCollapsed});

		/**
		 * Handle collapse/expand button click event
		 * Toggles panel collapsed state and updates DOM attribute
		 */
		const onCollapseClick: MouseEventHandler<HTMLButtonElement> = () => {
			collapseRef.current.collapsed = !collapseRef.current.collapsed;
			if (collapseRef.current.collapsed) {
				containerRef.current?.setAttribute('data-hx-panel-collapsed', '');
			} else {
				containerRef.current?.removeAttribute('data-hx-panel-collapsed');
			}
		};

		/** Resolved child model for automatic propagation to panel children */
		const $modelToChild = resolveChildModel($model, $field);
		/** Processed props exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            data-hx-panel=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            data-hx-border={border ? '' : (void 0)} data-hx-border-radius={borderRadius}
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
				<HxLabel text={title} data-hx-panel-title=""/>
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
