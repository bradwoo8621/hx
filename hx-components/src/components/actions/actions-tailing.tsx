// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useHxPopupContext} from '../popup';
import {buildContent} from './actions-builder';
import {
	EvtHxActions_ClosePopup,
	EvtHxActions_HoverNextOption,
	EvtHxActions_HoverPreviousOption,
	type HxActionsColor,
	type HxActionsTailing,
	type HxExtActionsProps
} from './types';

export type HxActionsTailingProps<T extends object> =
	& Pick<HxExtActionsProps<T>, '$model'>
	& {
	color: HxActionsColor;
	tailing: HxActionsTailing;
	/** Whether the popup is visible */
	visible: boolean
};

export const HxActionsTailingContent =
	<T extends object>(props: HxActionsTailingProps<T>) => {
		const {
			$model,
			color,
			tailing,
			visible
		} = props;

		// const context = useHxContext();
		const popupContext = useHxPopupContext();
		/** Reference to the currently hovered option DOM element */
		const hoveredOptionRef = useRef<HTMLButtonElement | null>(null);
		/** Reference to the options container DOM element */
		const optionsContainerRef = useRef<HTMLDivElement | null>(null);

		useEffect(() => {
			const findOption = (startIndex: number, lastOptionIndex: number, direction: 'previous' | 'next') => {
				const options = Array.from(optionsContainerRef.current?.querySelectorAll(':scope button') ?? []) as Array<HTMLButtonElement>;
				// the last one is no option label, ignore it
				let index = startIndex;
				do {
					const el = options[index];
					// Only return elements that are visible (not filtered out)
					if (!el.hasAttribute('disabled')
						&& !el.hasAttribute('data-hx-disabled')) {
						return el;
					}
					// Circular navigation: wrap to end/beginning when reaching edge
					if (direction === 'previous') {
						index = index === 0 ? lastOptionIndex : (index - 1);
					} else {
						index = index === lastOptionIndex ? 0 : (index + 1);
					}
				} while (index !== startIndex); // Stop when we loop back to start
				return (void 0);
			};
			const hoverAnOption = (direction: 'previous' | 'next') => {
				const options = Array.from(optionsContainerRef.current?.querySelectorAll(':scope button') ?? []);
				if (options != null && options.length !== 1) {
					const lastOptionIndex = options.length - 1;

					// noinspection DuplicatedCode
					const originHoveredOption = hoveredOptionRef.current;

					let startIndex: number;
					if (hoveredOptionRef.current == null) {
						// No existing hover: start at first/last option depending on direction
						startIndex = direction === 'previous' ? lastOptionIndex : 0;
					} else {
						// Get current hovered option's natural index
						const index = options.indexOf(hoveredOptionRef.current);
						// Calculate next index with circular wrap
						startIndex = direction === 'previous'
							? (index === 0 ? lastOptionIndex : index - 1)
							: (index === lastOptionIndex ? 0 : index + 1);
					}
					// Find next visible option in natural order
					hoveredOptionRef.current = findOption(startIndex, lastOptionIndex, direction) ?? null;

					// Update DOM hover state and scroll into view
					if (hoveredOptionRef.current == null) {
						// No visible options: clear existing hover
						originHoveredOption?.removeAttribute('data-hx-hover');
					} else if (originHoveredOption !== hoveredOptionRef.current) {
						// Hover changed: remove old hover, add new hover, scroll into view
						originHoveredOption?.removeAttribute('data-hx-hover');
						hoveredOptionRef.current.setAttribute('data-hx-hover', '');
					}
				}
			};
			const onHoverPreviousOption = () => hoverAnOption('previous');
			const onHoverNextOption = () => hoverAnOption('next');
			// const onSelectHoverOption = () => {
			// 	if (hoveredOptionRef.current == null) {
			// 		return;
			// 	}
			//
			// 	const index = Array.from(optionsContainerRef.current?.children ?? []).indexOf(hoveredOptionRef.current);
			// 	const option = optionsRef.current.options[index];
			// 	if (option != null) {
			// 		popupContext.emit(EvtHxSelect_OptionSelect, option);
			// 	}
			// };

			popupContext.on(EvtHxActions_HoverPreviousOption, onHoverPreviousOption);
			popupContext.on(EvtHxActions_HoverNextOption, onHoverNextOption);
			// popupContext.on(EvtHxActions_SelectHoverOption, onSelectHoverOption);
			return () => {
				popupContext.off(EvtHxActions_HoverPreviousOption, onHoverPreviousOption);
				popupContext.off(EvtHxActions_HoverNextOption, onHoverNextOption);
				// popupContext.off(EvtHxActions_SelectHoverOption, onSelectHoverOption);
			};
		}, [popupContext]);

		if (!visible) {
			return null;
		}

		const closePopup = () => {
			popupContext.emit(EvtHxActions_ClosePopup);
		};
		//TODO
		// const onOptionMouseEnter: MouseEventHandler<HTMLButtonElement> = (evt) => {
		// 	hoveredOptionRef.current = evt.currentTarget;
		// 	// operate dom directly for saving cost
		// 	optionsContainerRef.current
		// 		?.querySelector(':scope > button[data-hx-hover]')
		// 		?.removeAttribute('data-hx-hover');
		// 	hoveredOptionRef.current.setAttribute('data-hx-hover', '');
		// };

		const content = buildContent({
			actions: tailing,
			$model, disabled: false, color, various: 'solid',
			openPopup: () => {
			},
			closePopup,
			buildPopupTrigger: false
		});

		return <div data-hx-actions-options="" tabIndex={-1} ref={optionsContainerRef}>
			{content}
		</div>;
	};
