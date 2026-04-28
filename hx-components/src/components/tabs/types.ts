import type {ModelPath} from '@hx/data';
import type {HTMLAttributes, ReactNode} from 'react';
import type {
	DisabledProps,
	HxBorderRadius,
	HxDataPath,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxPadding,
	HxStdProps,
	HxWidthConstrainedProps,
	VisibleProps
} from '../../types';

/**
 * Configuration interface for a single tab item
 * Extends visibility and disabled property interfaces for reactive control
 */
export interface HxTab<T extends object = object> extends VisibleProps<T>, DisabledProps<T> {
	/** Unique identifier for the tab, used for programmatic navigation */
	mark?: string;
	/** Content to display in the tab header (can be text, icons, or custom React elements) */
	header?: ReactNode;
	/** Content to display in the tab body when this tab is active */
	body?: ReactNode;
	/** Whether this tab should be active by default when the tabs component mounts */
	defaultActive?: boolean;
}

/**
 * Type definition for tabs component content
 * Requires at least one tab item, with optional additional tabs
 */
export type HxTabsChildren = [HxTab, ...Array<HxTab>];

/**
 * Border radius type for tabs container, uses the global HxBorderRadius size system
 */
export type HxTabsBorderRadius = HxBorderRadius;
/** Horizontal (left and right) padding size for tabs content container */
export type HxTabsPaddingX = HxPadding;
/** Top padding size for tabs content container */
export type HxTabsPaddingT = HxPadding;
/** Bottom padding size for tabs content container */
export type HxTabsPaddingB = HxPadding;
/**
 * Layout container type for the tab body content area
 * - 'block': Standard block layout (default)
 * - 'flex': Flexbox layout
 * - 'grid': CSS Grid layout
 */
export type HxTabBodyContainerType = 'grid' | 'flex' | 'block';

/**
 * Extended properties interface for the HxTabs component
 * Inherits standard layout props and width constraint props from the global type system
 */
export interface HxExtTabsProps<T extends object>
	extends HxStdProps<T>, HxWidthConstrainedProps {
	/**
	 * Whether to show a border around the tabs content container
	 * The border is only applied to the body content area, not the tab header strip
	 * @default false (from HxTabsDefaults)
	 */
	border?: boolean;
	/**
	 * Border radius size for the entire tabs container corners
	 * Applied to both the header strip and the content container for consistent styling
	 * Uses the global HxBorderRadius size system (none, xs, sm, md, lg, xl, round)
	 */
	borderRadius?: HxTabsBorderRadius;
	/**
	 * Horizontal (left and right) padding for the tab body content container
	 * Controls the spacing between the container edge and the content inside each tab
	 * Uses the global HxPadding size system
	 */
	paddingX?: HxTabsPaddingX;
	/**
	 * Top padding for the tab body content container
	 * Controls the spacing between the header bottom edge and the content top
	 * Uses the global HxPadding size system
	 */
	paddingT?: HxTabsPaddingT;
	/**
	 * Bottom padding for the tab body content container
	 * Controls the spacing between the content bottom and the container edge
	 * Uses the global HxPadding size system
	 */
	paddingB?: HxTabsPaddingB;
	/**
	 * Layout type for the tab body content container
	 * - 'block': Standard block-level layout (default, best for simple content)
	 * - 'flex': Flexbox layout (best for aligning items in rows/columns)
	 * - 'grid': CSS Grid layout (best for complex multi-column layouts)
	 * @default 'grid' (from HxTabsDefaults)
	 */
	contentContainerType?: HxTabBodyContainerType;
	/**
	 * Reactive model object for data binding
	 * The model is automatically passed as $model prop to all child components inside tab bodies
	 * Can also be used to control tab visibility and disabled states reactively via $visible/$disabled props on individual tabs
	 */
	$model?: HxObject<T>,
	/**
	 * Path to a nested property on the $model object
	 * If specified, the value of this nested property will be used as the $model for all child components inside tab bodies
	 * Useful for binding tabs to a nested section of a larger form or data object without restructuring your model
	 */
	$field?: ModelPath<T> | HxDataPath;
	/**
	 * Array of tab configuration items
	 * Must contain at least one tab, with support for any number of additional tabs
	 * Each tab can define its own header, content, visibility, disabled state, and default active status
	 */
	content: HxTabsChildren;
	restoreScroll?: boolean;
}

export type OmittedTabsHTMLProps = HxOmittedAttributes | 'content' | 'children';

export type HxTabsProps<T extends object> =
	& HxExtTabsProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedTabsHTMLProps, T>;
