// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {HxTabsInner} from './inner';
import {HxTabsProvider} from './tabs-provider';
import type {HxTabsProps} from './types';

/**
 * Type definition for the HxTabs component function signature
 */
export type HxTabsType = <T extends object>(
	props: HxTabsProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * HxTabs Component
 *
 * A flexible tabs component that allows switching between different content sections.
 * Features include:
 * - Customizable styling with borders, padding, and border radius options
 * - Support for reactive data binding with $model and $field
 * - Disabled and visible tab states with reactive control
 * - Default active tab configuration
 * - Programmatic navigation via tab marks or indices
 * - Automatic scrolling for tab headers with many items
 *
 * @example
 * ```tsx
 * // Basic usage
 * <HxTabs
 *   content={[
 *     { mark: 'tab1', header: 'Tab 1', body: <div>Content 1</div> },
 *     { mark: 'tab2', header: 'Tab 2', body: <div>Content 2</div> }
 *   ]}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Tabs with border and custom padding
 * <HxTabs
 *   border={true}
 *   borderRadius="md"
 *   paddingX="lg"
 *   paddingT="lg"
 *   paddingB="lg"
 *   content={tabsContent}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Tabs with default active tab
 * <HxTabs
 *   content={[
 *     { mark: 'tab1', header: 'Tab 1', body: <div>Content 1</div> },
 *     { mark: 'tab2', header: 'Tab 2', body: <div>Content 2</div>, defaultActive: true }
 *   ]}
 * />
 * ```
 */
export const HxTabs =
	forwardRef(<T extends object>(props: HxTabsProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		return <HxTabsProvider>
			{/* @ts-expect-error ignore type check */}
			<HxTabsInner {...props} ref={ref}/>
		</HxTabsProvider>;
	}) as unknown as HxTabsType;
// @ts-expect-error assign component name
HxTabs.displayName = 'HxTabs';
