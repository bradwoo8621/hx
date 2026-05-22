// @ts-expect-error import React
import React, {type MouseEventHandler, useEffect, useRef} from 'react';
import {AnyUtils} from '../../utils';
import {HxFlex} from '../flex';
import {useHxPopupContext} from '../popup';
import {buildContent} from './actions-builder';
import {
	EvtHxActions_ClosePopup,
	EvtHxActions_HoverNextOption,
	EvtHxActions_HoverPreviousOption,
	EvtHxActions_SelectHoverOption,
	type HxActionsColor,
	type HxActionsTailing,
	type HxExtActionsProps
} from './types';

/**
 * Props for HxActionsTailingContent component
 * Defines all properties needed to render the popup content part of the actions component
 */
export type HxActionsTailingProps<T extends object> =
	& Pick<HxExtActionsProps<T>, '$model'>
	& {
	/** Color scheme for the popup border and hover states */
	color: HxActionsColor;
	/** Tailing popup content, can be single action, action group or multiple action groups */
	tailing: HxActionsTailing;
	/** Whether the popup is currently visible */
	visible: boolean
};

/**
 * HxActionsTailingContent Component
 * Renders the popup content part of the actions component, handles all popup interactions
 * Manages option hover state, keyboard navigation, and action selection
 *
 * @param props - Component configuration properties
 */
export const HxActionsTailingContent =
	<T extends object>(props: HxActionsTailingProps<T>) => {
		const {
			$model,
			color,
			tailing,
			visible
		} = props;

		const popupContext = useHxPopupContext();
		/** Reference to the currently hovered option DOM element for keyboard navigation */
		const hoveredOptionRef = useRef<HTMLButtonElement | null>(null);
		/** Reference to the options container DOM element for querying child buttons */
		const optionsContainerRef = useRef<HTMLDivElement | null>(null);

		/**
		 * Set up keyboard navigation event listeners when component mounts
		 * Handles navigation events sent from the trigger component via popup context
		 */
		useEffect(() => {
			/**
			 * Find next/previous visible (non-disabled) option for keyboard navigation
			 * Supports circular navigation (wraps from first to last and vice versa)
			 * @param startIndex - Index to start searching from
			 * @param lastOptionIndex - Index of the last option in the list
			 * @param direction - Direction to search ('previous' or 'next')
			 * @returns The next visible option element or undefined if none found
			 */
			const findOption = (startIndex: number, lastOptionIndex: number, direction: 'previous' | 'next') => {
				const options = Array.from(optionsContainerRef.current?.querySelectorAll(':scope button') ?? []) as Array<HTMLButtonElement>;
				let index = startIndex;
				do {
					const el = options[index];
					// Skip disabled options
					if (!el.hasAttribute('disabled')
						&& !el.hasAttribute('data-hx-disabled')) {
						return el;
					}
					// Circular navigation logic
					if (direction === 'previous') {
						index = index === 0 ? lastOptionIndex : (index - 1);
					} else {
						index = index === lastOptionIndex ? 0 : (index + 1);
					}
				} while (index !== startIndex); // Stop when we loop back to the start (no visible options)
				return (void 0);
			};

			/**
			 * Hover the next/previous option in the list
			 * Updates DOM hover state and manages circular navigation
			 * @param direction - Direction to move ('previous' or 'next')
			 */
			const hoverAnOption = (direction: 'previous' | 'next') => {
				const options = Array.from(optionsContainerRef.current?.querySelectorAll(':scope button') ?? []);
				if (options != null) {
					const lastOptionIndex = options.length - 1;

					// noinspection DuplicatedCode
					const originHoveredOption = hoveredOptionRef.current;

					let startIndex: number;
					if (hoveredOptionRef.current == null) {
						// No existing hover: start at first/last option depending on direction
						startIndex = direction === 'previous' ? lastOptionIndex : 0;
					} else {
						// Get current hovered option's index
						const index = options.indexOf(hoveredOptionRef.current);
						// Calculate next index with circular wrap
						startIndex = direction === 'previous'
							? (index === 0 ? lastOptionIndex : index - 1)
							: (index === lastOptionIndex ? 0 : index + 1);
					}
					// Find next visible option
					hoveredOptionRef.current = findOption(startIndex, lastOptionIndex, direction) ?? null;

					// Update DOM hover state
					if (hoveredOptionRef.current == null) {
						// No visible options: clear existing hover
						originHoveredOption?.removeAttribute('data-hx-hover');
					} else if (originHoveredOption !== hoveredOptionRef.current) {
						// Hover changed: update state and scroll new hover into view
						originHoveredOption?.removeAttribute('data-hx-hover');
						hoveredOptionRef.current.setAttribute('data-hx-hover', '');
					}
				}
			};

			/** Navigate to previous option (triggered by ArrowUp key) */
			const onHoverPreviousOption = () => hoverAnOption('previous');
			/** Navigate to next option (triggered by ArrowDown key) */
			const onHoverNextOption = () => hoverAnOption('next');
			/** Select currently hovered option (triggered by Enter/Space key) */
			const onSelectHoverOption = () => {
				if (hoveredOptionRef.current == null) {
					return;
				}
				// Simulate click on the hovered option
				(hoveredOptionRef.current as HTMLButtonElement).click();
			};

			// Register event listeners with popup context
			popupContext.on(EvtHxActions_HoverPreviousOption, onHoverPreviousOption);
			popupContext.on(EvtHxActions_HoverNextOption, onHoverNextOption);
			popupContext.on(EvtHxActions_SelectHoverOption, onSelectHoverOption);

			// Clean up event listeners on unmount
			return () => {
				popupContext.off(EvtHxActions_HoverPreviousOption, onHoverPreviousOption);
				popupContext.off(EvtHxActions_HoverNextOption, onHoverNextOption);
				popupContext.off(EvtHxActions_SelectHoverOption, onSelectHoverOption);
			};
		}, [popupContext]);

		/**
		 * Reset hover state when popup closes
		 * Clears the hovered option reference when popup is hidden
		 */
		useEffect(() => {
			if (!visible) {
				hoveredOptionRef.current = null;
			}
		}, [$model, visible]);

		// Render nothing when popup is not visible
		if (!visible) {
			return null;
		}

		/** Emit close popup event to trigger component to close */
		const closePopup = () => {
			popupContext.emit(EvtHxActions_ClosePopup);
		};

		/**
		 * Mouse enter handler for options
		 * Updates hover state when user hovers over an option with mouse
		 * Direct DOM manipulation used for performance efficiency
		 */
		const onOptionMouseEnter: MouseEventHandler<HTMLButtonElement> = (evt) => {
			hoveredOptionRef.current = evt.currentTarget;
			// Remove existing hover state from other options
			optionsContainerRef.current
				?.querySelector(':scope > button[data-hx-hover]')
				?.removeAttribute('data-hx-hover');
			// Add hover state to current option
			hoveredOptionRef.current.setAttribute('data-hx-hover', '');
		};

		/**
		 * Build popup content using actions-builder utility
		 * Renders action groups with appropriate dividers and styling
		 * Adds mouse enter handlers and tabIndex for keyboard navigation
		 */
			// eslint-disable-next-line react-hooks/refs
		const content = buildContent({
				actions: tailing,
				$model, disabled: false, variant: 'ghost',
				openPopup: AnyUtils.noop, // No need to open popup from within popup
				closePopup,
				buildPopupTrigger: false, // Not building trigger in popup content
				buttonAdditionalProps: {
					tabIndex: -1, // Remove from tab order since navigation is handled via arrow keys
					onMouseEnter: onOptionMouseEnter
				}
			});

		return <HxFlex tabIndex={-1}
		               $model={$model}
		               direction="dir-y" gapX="none" gapY="none"
		               border={true} borderRadius="sm" paddingX="xs" paddingT="xs" paddingB="xs"
		               data-hx-actions-options=""
		               data-hx-border-color={color}
		               ref={optionsContainerRef}>
			{/** Use fragment to avoid unnecessary element cloning */}
			<>{content}</>
		</HxFlex>;
	};
