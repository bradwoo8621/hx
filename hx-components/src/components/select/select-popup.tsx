import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type KeyboardEventHandler, type MouseEventHandler, type PropsWithoutRef, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {scrollIntoViewIfNeed} from '../../utils';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {HxSelectDefaults} from './defaults';
import {
	EvtHxSelect_ClosePopup,
	EvtHxSelect_HoverNextOption,
	EvtHxSelect_HoverPreviousOption,
	EvtHxSelect_OptionsChange,
	EvtHxSelect_OptionSelect,
	EvtHxSelect_OptionsLoad,
	EvtHxSelect_SelectHoverOption,
	type HxExtSelectProps,
	type HxSelectOption
} from './types';

/**
 * Select popup content component props
 * @template T - Type of the form model object
 */
export type HxSelectPopupProps<T extends object> = PropsWithoutRef<
	& Pick<HxExtSelectProps<T>,
	| '$model' | '$field'
	| 'showSelectedOnPopupOpen'
	| 'filterPlaceholderKey'
	| 'optionsOnLoadKey'
	| 'noOptionsKey'
	| 'filter' | 'filterWhenOptionExceed' | 'sort'>
> & {
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
		const optionsRef = useRef({
			options: [] as Array<HxSelectOption>,
			displayOptions: [] as Array<HxSelectOption>,
			loaded: false
		});
		const hoveredOptionRef = useRef<HTMLSpanElement | null>(null);
		const optionsContainerRef = useRef<HTMLDivElement | null>(null);

		/**
		 * Listen for options load/change events to update the options list
		 */
		useEffect(() => {
			const onOptionsLoadOrChange = (options: Array<HxSelectOption>) => {
				optionsRef.current = {options, displayOptions: options, loaded: true};
				context.forceUpdate();
			};

			popupContext.on(EvtHxSelect_OptionsLoad, onOptionsLoadOrChange);
			popupContext.on(EvtHxSelect_OptionsChange, onOptionsLoadOrChange);
			return () => {
				popupContext.off(EvtHxSelect_OptionsLoad, onOptionsLoadOrChange);
				popupContext.off(EvtHxSelect_OptionsChange, onOptionsLoadOrChange);
			};
		}, [popupContext, context]);
		/**
		 * Handle sort
		 */
		useEffect(() => {
			if (!visible || !optionsRef.current.loaded || !sort || optionsContainerRef.current == null) {
				return;
			}

			const optionDomNodes = optionsContainerRef.current.querySelectorAll(':scope > span[data-hx-label]');
			if (optionDomNodes != null) {
				const nodes: Array<HTMLElement> = [...optionDomNodes.values()] as Array<HTMLElement>;
				nodes.sort((a, b) => {
					return (a.getAttribute('data-hx-label-text') ?? '')
						.localeCompare(b.getAttribute('data-hx-label-text') ?? '', (void 0), {
							sensitivity: 'accent', numeric: true
						});
				}).forEach((node, index) => {
					const order = `${index + 1}`;
					node.setAttribute('data-hx-select-option-order', order);
					node.style.order = order;
				});
			}
			// eslint-disable-next-line react-hooks/refs
		}, [visible, optionsRef.current.loaded, sort]);
		/**
		 * Handle keyboard navigation events for option selection.
		 * operate dom directly for saving cost
		 */
		useEffect(() => {
			const findOptionInSortedOrder = (startIndex: number, direction: 'previous' | 'next', optionsCount: number) => {
				let index = startIndex;
				do {
					const el: HTMLSpanElement | null | undefined = optionsContainerRef.current?.querySelector(`:scope > span[data-hx-label][data-hx-select-option-order="${index}"]`);
					if (el != null && el.style.display != 'none') {
						return el;
					}
					if (direction === 'previous') {
						index = index === 1 ? optionsCount : (index - 1);
					} else {
						index = index === optionsCount ? 1 : (index + 1);
					}
				} while (index !== startIndex);
				return (void 0);
			};
			const findOptionInNaturalOrder = (startIndex: number, direction: 'previous' | 'next') => {
				const options = Array.from(optionsContainerRef.current?.children ?? []) as Array<HTMLSpanElement>;
				const optionsCount = options.length;
				let index = startIndex;
				do {
					const el = options[index];
					if (el.style.display != 'none') {
						return el;
					}
					if (direction === 'previous') {
						index = index === 0 ? (optionsCount - 1) : (index - 1);
					} else {
						index = index === (optionsCount - 1) ? 0 : (index + 1);
					}
				} while (index !== startIndex);
				return (void 0);
			};
			const hoverAnOption = (direction: 'previous' | 'next') => {
				const options = optionsContainerRef.current?.children;
				if (options != null && options.length !== 0) {
					const firstEl = options.item(0)!;
					if (firstEl.getAttribute('data-hx-select-option') == null) {
						// option not exists
						return;
					}

					const originHoveredOption = hoveredOptionRef.current;
					const sorted = firstEl.getAttribute('data-hx-select-option-order') != null;
					if (sorted) {
						let startIndex: number;
						if (hoveredOptionRef.current == null) {
							startIndex = direction === 'previous' ? options.length : 1;
						} else {
							const index = Number(hoveredOptionRef.current.getAttribute('data-hx-select-option-order')!);
							if (direction === 'previous') {
								startIndex = index === 1 ? options.length : (index - 1);
							} else {
								startIndex = index === options.length ? 1 : (index + 1);
							}
						}
						hoveredOptionRef.current = findOptionInSortedOrder(startIndex, direction, options.length) ?? null;
					} else {
						let startIndex: number;
						if (hoveredOptionRef.current == null) {
							startIndex = direction === 'previous' ? (options.length - 1) : 0;
						} else {
							const index = Array.from(optionsContainerRef.current?.children ?? []).indexOf(hoveredOptionRef.current);
							if (direction === 'previous') {
								startIndex = index === 0 ? (options.length - 1) : (index - 1);
							} else {
								startIndex = index === (options.length - 1) ? 0 : (index + 1);
							}
						}
						hoveredOptionRef.current = findOptionInNaturalOrder(startIndex, direction) ?? null;
					}

					if (hoveredOptionRef.current == null) {
						originHoveredOption?.removeAttribute('data-hx-label-hovered');
					} else if (originHoveredOption !== hoveredOptionRef.current) {
						originHoveredOption?.removeAttribute('data-hx-label-hovered');
						hoveredOptionRef.current.setAttribute('data-hx-label-hovered', '');
						scrollIntoViewIfNeed(hoveredOptionRef.current);
					} else {
						scrollIntoViewIfNeed(hoveredOptionRef.current);
					}
				}
			};
			/**
			 * Move hover state to the previous option in the list
			 * Wraps to first option if no option is currently hovered
			 */
			const onHoverPreviousOption = () => hoverAnOption('previous');
			/**
			 * Move hover state to the next option in the list
			 * Wraps to first option if no option is currently hovered
			 */
			const onHoverNextOption = () => hoverAnOption('next');
			/**
			 * Select the currently hovered option
			 */
			const onSelectHoverOption = () => {
				if (hoveredOptionRef.current == null) {
					return;
				}
				popupContext.emit(EvtHxSelect_OptionSelect, hoveredOptionRef.current);
			};

			popupContext.on(EvtHxSelect_HoverPreviousOption, onHoverPreviousOption);
			popupContext.on(EvtHxSelect_HoverNextOption, onHoverNextOption);
			popupContext.on(EvtHxSelect_SelectHoverOption, onSelectHoverOption);
			return () => {
				popupContext.on(EvtHxSelect_HoverPreviousOption, onHoverPreviousOption);
				popupContext.on(EvtHxSelect_HoverNextOption, onHoverNextOption);
				popupContext.on(EvtHxSelect_SelectHoverOption, onSelectHoverOption);
			};
		}, [context, popupContext]);
		useEffect(() => {
			// every time after popup rendered
			if (showSelectedOnPopupOpen && visible && optionsRef.current.loaded) {
				hoveredOptionRef.current = optionsContainerRef.current?.querySelector(':scope > span[data-hx-label][data-hx-label-active]') ?? null;
				if (hoveredOptionRef.current != null) {
					// operate dom directly for saving cost
					hoveredOptionRef.current.setAttribute('data-hx-label-hovered', '');
					scrollIntoViewIfNeed(hoveredOptionRef.current);
				}
			} else {
				hoveredOptionRef.current = null;
			}
			// eslint-disable-next-line react-hooks/refs
		}, [$model, $field, visible, showSelectedOnPopupOpen, optionsRef.current.loaded]);

		// Don't render if popup is hidden or options are still loading
		// eslint-disable-next-line react-hooks/refs
		if (!visible || !optionsRef.current.loaded) {
			return null;
		}

		/**
		 * Create click handler for option items
		 * @param option - The option that was clicked
		 * @returns Click handler function that emits selection event
		 */
		const onOptionClick = (option: HxSelectOption): MouseEventHandler<HTMLSpanElement> => {
			return () => {
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
				?.querySelector(':scope > span[data-hx-label][data-hx-label-hovered]')
				?.removeAttribute('data-hx-label-hovered');
			hoveredOptionRef.current.setAttribute('data-hx-label-hovered', '');
		};

		// eslint-disable-next-line react-hooks/refs
		if (!optionsRef.current.loaded) {
			return <>
				<div data-hx-select-options="">
					<HxLabel text={optionsOnLoadKey} data-hx-label-text-indent=""/>
				</div>
			</>;
		}

		// eslint-disable-next-line react-hooks/refs
		if (optionsRef.current.displayOptions.length === 0) {
			return <>
				<div data-hx-select-options="">
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
			|| (filter !== false && filterWhenOptionExceed != null && optionsRef.current.displayOptions.length >= filterWhenOptionExceed);
		const $filerModel = showFilter ? ERO.reactive({text: ''}) : (void 0);
		if ($filerModel != null) {
			// eslint-disable-next-line react-hooks/refs
			ERO.on($filerModel, 'text', () => {
				const optionDomNodes = optionsContainerRef.current?.querySelectorAll(':scope > span[data-hx-label]');
				if (optionDomNodes != null) {
					const filterText = ($filerModel.text ?? '').toLowerCase();
					const nodes: Array<HTMLElement> = [...optionDomNodes.values()] as Array<HTMLElement>;
					nodes.forEach(node => {
						const text = node.getAttribute('data-hx-label-text') ?? '';
						if (text.trim().length === 0) {
							// do nothing
						} else if (text.toLowerCase().includes(filterText)) {
							node.style.display = node.getAttribute('data-hx-temporary-display') ?? '';
						} else {
							if (!node.hasAttribute('data-hx-temporary-display')) {
								node.setAttribute('data-hx-temporary-display', node.style.display);
							}
							if (node.getAttribute('data-hx-label-hovered') != null) {
								// clear the hovered option
								hoveredOptionRef.current = null;
								node.removeAttribute('data-hx-label-hovered');
							}
							node.style.display = 'none';
						}
					});
				}
			});
		}

		return <>
			{showFilter && $filerModel != null
				? <HxInput $model={$filerModel} $field="text"
					// TODO now treated as string, HxInput should be replaced and support react node placeholder
					       placeholder={filterPlaceholderKey as string}
					       onKeyDown={onFilterKeyDown}
					       autoComplete="off"/>
				: (void 0)}
			<div data-hx-select-options="" ref={optionsContainerRef}>
				{/* eslint-disable-next-line react-hooks/refs */}
				{optionsRef.current.displayOptions.map(option => {
					const {value: optionValue, label} = option;
					const active = modelValue == optionValue;
					return <HxLabel text={label} clickable={true} active={active}
					                data-hx-select-option="" data-hx-label-text-indent=""
					                onClick={onOptionClick(option)}
					                onMouseEnter={onOptionMouseEnter}
					                key={optionValue}/>;
				})}
			</div>
		</>;
	};
