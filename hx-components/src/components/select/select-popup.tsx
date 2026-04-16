import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	isValidElement,
	type KeyboardEventHandler,
	type MouseEventHandler,
	type ReactNode,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {anteroposteriorTabNodes, isI18NKey, scrollIntoViewIfNeed} from '../../utils';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {type HxSelectOption, useSelectOptions} from '../select-options';
import {HxSelectDefaults} from './defaults';
import {
	EvtHxSelect_ClosePopup,
	EvtHxSelect_GetFilterInput,
	EvtHxSelect_GetSelect,
	EvtHxSelect_HoverNextOption,
	EvtHxSelect_HoverPreviousOption,
	EvtHxSelect_OptionSelect,
	EvtHxSelect_SelectHoverOption,
	type HxExtSelectProps
} from './types';

/**
 * Select popup content component props
 * @template T - Type of the form model object
 */
export type HxSelectPopupProps<T extends object> =
	& Pick<HxExtSelectProps<T>,
		| '$model' | '$field'
		| 'showSelectedOnPopupOpen'
		| 'filterPlaceholderKey'
		| 'optionsOnLoadKey'
		| 'noOptionsKey'
		| 'filter' | 'filterWhenOptionExceed' | 'sort'>
	& {
	/** Whether the popup is visible */
	visible: boolean
};

/**
 * Select popup content component - renders the list of options inside the popup
 * @template T - Type of the form model object
 * @param props - Component props
 */
export const HxSelectPopup =
	<T extends object>(props: HxSelectPopupProps<T>) => {
		const {
			$model, $field,
			visible,
			showSelectedOnPopupOpen = HxSelectDefaults.showSelectedOnPopupOpen,
			optionsOnLoadKey = HxSelectDefaults.optionsOnLoadKey, noOptionsKey = HxSelectDefaults.noOptionsKey,
			filter, filterWhenOptionExceed = HxSelectDefaults.filterWhenOptionExceed,
			filterPlaceholderKey = HxSelectDefaults.filterPlaceholderKey,
			sort
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const optionsRef = useSelectOptions({$model, $field, captureValueChangeOnOptionsChange: false});
		/** Reference to the currently hovered option DOM element */
		const hoveredOptionRef = useRef<HTMLSpanElement | null>(null);
		/** Reference to the options container DOM element */
		const optionsContainerRef = useRef<HTMLDivElement | null>(null);

		/**
		 * Handle keyboard navigation events for option selection
		 * Performance optimization: All operations directly manipulate DOM attributes
		 * instead of using React state, which avoids expensive re-renders for large option lists
		 *
		 * Features:
		 * - Up/Down arrow navigation between options
		 * - Circular navigation (wraps from last to first and vice versa)
		 * - Skips hidden/filtered out options
		 * - Supports both natural and sorted order navigation
		 * - Automatically scrolls options into view when navigating
		 */
		useEffect(() => {
			/**
			 * Find the next visible option when options are in natural (unsorted) order
			 * Traverses DOM children in their natural order
			 *
			 * @param startIndex - Starting index to search from (0-based)
			 * @param lastOptionIndex - Index of last select option
			 * @param direction - Search direction: 'previous' (up) or 'next' (down)
			 * @returns First visible option element found, undefined if no visible options
			 */
			const findOption = (startIndex: number, lastOptionIndex: number, direction: 'previous' | 'next') => {
				const options = Array.from(optionsContainerRef.current?.children ?? []) as Array<HTMLSpanElement>;
				// the last one is no option label, ignore it
				let index = startIndex;
				do {
					const el = options[index];
					// Only return elements that are visible (not filtered out)
					if (el.style.display != 'none' && !el.hasAttribute('data-hx-disabled')) {
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

			/**
			 * Main navigation handler: Move hover state to next/previous visible option
			 * Automatically handles both sorted and natural order cases
			 * Updates hover state and scrolls new option into view
			 *
			 * @param direction - Navigation direction: 'previous' (up arrow) or 'next' (down arrow)
			 */
			const hoverAnOption = (direction: 'previous' | 'next') => {
				const options = optionsContainerRef.current?.children;
				if (options != null && options.length !== 1) {
					const firstEl = options.item(0)!;
					if (!firstEl.hasAttribute('data-hx-select-option')) {
						// No valid options available
						return;
					}

					const lastOptionIndex = (options.item(options.length - 1)?.hasAttribute('data-hx-select-option') ?? false)
						? (options.length - 1)
						: (options.length - 2);

					const originHoveredOption = hoveredOptionRef.current;

					let startIndex: number;
					if (hoveredOptionRef.current == null) {
						// No existing hover: start at first/last option depending on direction
						startIndex = direction === 'previous' ? lastOptionIndex : 0;
					} else {
						// Get current hovered option's natural index
						const index = Array.from(optionsContainerRef.current?.children ?? []).indexOf(hoveredOptionRef.current);
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
						scrollIntoViewIfNeed(hoveredOptionRef.current);
					} else {
						// Same option still hovered: ensure it's in view (e.g. after filter change)
						scrollIntoViewIfNeed(hoveredOptionRef.current);
					}
				}
			};

			/**
			 * Event handler: Move hover to previous option (Up arrow key)
			 */
			const onHoverPreviousOption = () => hoverAnOption('previous');

			/**
			 * Event handler: Move hover to next option (Down arrow key)
			 */
			const onHoverNextOption = () => hoverAnOption('next');

			/**
			 * Event handler: Select currently hovered option (Enter/Space key)
			 * Emits option select event to parent component
			 */
			const onSelectHoverOption = () => {
				if (hoveredOptionRef.current == null) {
					return;
				}

				const index = Array.from(optionsContainerRef.current?.children ?? []).indexOf(hoveredOptionRef.current);
				const option = optionsRef.current.options[index];
				if (option != null) {
					popupContext.emit(EvtHxSelect_OptionSelect, option);
				}
			};
			const onGetFilterInput = (callback: (input?: HTMLElement) => void) => {
				const inputEl = optionsContainerRef.current?.previousElementSibling as HTMLElement | undefined;
				if (inputEl == null) {
					callback();
				} else if (inputEl.tagName === 'INPUT') {
					callback(inputEl);
				} else {
					callback(inputEl.querySelector(':scope input') as HTMLElement | undefined);
				}
			};

			popupContext.on(EvtHxSelect_HoverPreviousOption, onHoverPreviousOption);
			popupContext.on(EvtHxSelect_HoverNextOption, onHoverNextOption);
			popupContext.on(EvtHxSelect_SelectHoverOption, onSelectHoverOption);
			popupContext.on(EvtHxSelect_GetFilterInput, onGetFilterInput);
			return () => {
				popupContext.off(EvtHxSelect_HoverPreviousOption, onHoverPreviousOption);
				popupContext.off(EvtHxSelect_HoverNextOption, onHoverNextOption);
				popupContext.off(EvtHxSelect_SelectHoverOption, onSelectHoverOption);
				popupContext.off(EvtHxSelect_GetFilterInput, onGetFilterInput);
			};
		}, [optionsRef, popupContext]);
		useEffect(() => {
			// every time after popup rendered
			if (showSelectedOnPopupOpen && visible && optionsRef.current.loaded) {
				hoveredOptionRef.current = optionsContainerRef.current?.querySelector(':scope > span[data-hx-select-option][data-hx-label-active]') ?? null;
				if (hoveredOptionRef.current != null) {
					// operate dom directly for saving cost
					hoveredOptionRef.current.setAttribute('data-hx-hover', '');
					scrollIntoViewIfNeed(hoveredOptionRef.current);
				}
			} else {
				hoveredOptionRef.current = null;
			}
			// eslint-disable-next-line react-hooks/refs,react-hooks/exhaustive-deps
		}, [$model, $field, visible, showSelectedOnPopupOpen, optionsRef.current.loaded]);

		// Don't render if popup is hidden
		if (!visible) {
			return null;
		}

		/**
		 * Create click handler for option items
		 * @param option - The option that was clicked
		 * @returns Click handler function that emits selection event
		 */
		const onOptionClick = (option: HxSelectOption): MouseEventHandler<HTMLSpanElement> => {
			return (ev) => {
				if ((ev.target as HTMLSpanElement).hasAttribute('data-hx-disabled')) {
					return;
				}
				popupContext.emit(EvtHxSelect_OptionSelect, option);
			};
		};
		/**
		 * Create mouse enter handler for option items
		 */
		const onOptionMouseEnter: MouseEventHandler<HTMLSpanElement> = (evt) => {
			hoveredOptionRef.current = evt.currentTarget;
			// operate dom directly for saving cost
			optionsContainerRef.current
				?.querySelector(':scope > span[data-hx-select-option][data-hx-hover]')
				?.removeAttribute('data-hx-hover');
			hoveredOptionRef.current.setAttribute('data-hx-hover', '');
		};

		// eslint-disable-next-line react-hooks/refs
		if (!optionsRef.current.loaded) {
			return <>
				<div data-hx-select-options="" tabIndex={-1}>
					<HxLabel text={optionsOnLoadKey} data-hx-label-text-indent=""/>
				</div>
			</>;
		}

		// eslint-disable-next-line react-hooks/refs
		if (optionsRef.current.options.length === 0) {
			return <>
				<div data-hx-select-options="" tabIndex={-1}>
					<HxLabel text={noOptionsKey} data-hx-label-text-indent=""/>
				</div>
			</>;
		}

		const onFilterKeyDown: KeyboardEventHandler<HTMLDivElement> = (ev) => {
			let shouldPreventDefault = false;
			switch (ev.key) {
				case 'Escape': {
					popupContext.emit(EvtHxSelect_ClosePopup);
					break;
				}
				case 'Enter': {
					popupContext.emit(EvtHxSelect_SelectHoverOption);
					break;
				}
				case 'ArrowUp': {
					shouldPreventDefault = true;
					popupContext.emit(EvtHxSelect_HoverPreviousOption);
					break;
				}
				case 'ArrowDown': {
					shouldPreventDefault = true;
					popupContext.emit(EvtHxSelect_HoverNextOption);
					break;
				}
				case 'Tab': {
					if (ev.shiftKey) {
						shouldPreventDefault = true;
						// shift+tab, focus back to select
						popupContext.emit(EvtHxSelect_GetSelect, (el: HTMLElement) => {
							el.focus();
						});
					} else {
						popupContext.emit(EvtHxSelect_GetSelect, (el: HTMLElement) => {
							const [, next] = anteroposteriorTabNodes(el);
							next?.focus();
						});
					}
					break;
				}
				default: {
					// do nothing
					break;
				}
			}
			if (shouldPreventDefault) {
				ev.preventDefault();
			}
		};

		const modelValue = ERO.getValue($model, $field);
		// The reason for not using React state remains performance concerns,
		// bypassing it by performing filtering directly through DOM manipulation.
		const showFilter = filter === true
			// eslint-disable-next-line react-hooks/refs
			|| (filter !== false && filterWhenOptionExceed != null && optionsRef.current.options.length >= filterWhenOptionExceed);
		const $filterModel = showFilter ? ERO.reactive({$$text: ''}) : (void 0);
		if ($filterModel != null) {
			// eslint-disable-next-line react-hooks/refs
			ERO.on($filterModel, '$$text', () => {
				const optionDomNodes = optionsContainerRef.current?.querySelectorAll(':scope > span[data-hx-select-option]');
				if (optionDomNodes != null) {
					const filterText = ($filterModel.$$text ?? '').toLowerCase();
					const nodes: Array<HTMLElement> = [...optionDomNodes.values()] as Array<HTMLElement>;
					const remainCount = nodes.reduce((count, node) => {
						const text = node.getAttribute('data-hx-label-text') ?? '';
						if (text.trim().length === 0) {
							// do nothing
							return count + 1;
						} else if (text.toLowerCase().includes(filterText)) {
							node.style.display = node.getAttribute('data-hx-temporary-display') ?? '';
							return count + 1;
						} else {
							if (!node.hasAttribute('data-hx-temporary-display')) {
								node.setAttribute('data-hx-temporary-display', node.style.display);
							}
							if (node.getAttribute('data-hx-hover') != null) {
								// clear the hovered option
								hoveredOptionRef.current = null;
								node.removeAttribute('data-hx-hover');
							}
							node.style.display = 'none';
							return count;
						}
					}, 0);
					const noOptionEl = optionsContainerRef.current?.querySelector(':scope > span:not([data-hx-select-option])');
					if (noOptionEl != null) {
						if (remainCount === 0) {
							(noOptionEl as HTMLElement).style.display = 'block';
						} else {
							(noOptionEl as HTMLElement).style.display = '';
						}
					}
				}
			});
		}

		// eslint-disable-next-line react-hooks/refs
		const options = [...optionsRef.current.options];
		if (sort) {
			const asText = (label: ReactNode): string => {
				if (isValidElement(label)) {
					return (label.props?.['data-hx-label-text'] || '') as string;
				} else if (typeof label === 'string') {
					const [is, key] = isI18NKey(label);
					if (is) {
						const i18nLabel = context.language.get(key) || label;
						if (isValidElement(i18nLabel)) {
							// @ts-expect-error ignore check
							return (i18nLabel.props?.['data-hx-label-text'] || '') as string;
						}
					}
				}

				if (typeof label === 'string') {
					return label;
				} else {
					return `${label}`;
				}
			};
			// eslint-disable-next-line react-hooks/refs
			options.sort((o1, o2) => {
				return asText(o1.label).localeCompare(asText(o2.label), (void 0), {
					sensitivity: 'accent', // Ignore case and accents for sorting
					numeric: true // Treat numbers in strings as numeric values for natural sorting
				});
			});
		}

		return <>
			{showFilter && $filterModel != null
				? <HxInput $model={$filterModel} $field="$$text"
				           placeholder={filterPlaceholderKey as string}
				           onKeyDown={onFilterKeyDown}
				           autoComplete="off"/>
				: (void 0)}
			<div data-hx-select-options="" tabIndex={-1} ref={optionsContainerRef}>
				{/* eslint-disable-next-line react-hooks/refs */}
				{options.map(option => {
					const {value: optionValue, label, $disabled} = option;
					const active = modelValue == optionValue;
					return <HxLabel $model={$model}
					                text={label} clickable={true} active={active}
					                $disabled={$disabled}
					                data-hx-select-option="" data-hx-label-text-indent=""
					                onClick={onOptionClick(option)}
					                onMouseEnter={onOptionMouseEnter}
					                key={optionValue}/>;
				})}
				{showFilter && $filterModel != null
					? <HxLabel text={noOptionsKey} data-hx-label-text-indent=""/>
					: (void 0)}
			</div>
		</>;
	};
