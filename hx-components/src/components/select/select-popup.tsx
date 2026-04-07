import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type MouseEventHandler, type PropsWithoutRef, type RefObject, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {scrollIntoViewIfNeed} from '../../utils';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {HxSelectDefaults} from './defaults';
import {
	EvtHoverNextOption,
	EvtHoverPreviousOption,
	EvtOptionsChange,
	EvtOptionSelect,
	EvtOptionsLoad,
	EvtSelectHoverOption,
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
 * Apply hover state to an option element by directly manipulating DOM attributes
 * Direct DOM manipulation is used instead of React state to avoid expensive re-renders
 * for large option lists
 * @param handleRef - Reference to the popup handle element used to query option nodes
 * @param options - Full list of select options
 * @param option - The option to apply hover state to
 * @returns The DOM element of the hovered option, or undefined if not found
 */
const hoverOption = (
	handleRef: RefObject<HTMLDivElement>, options: Array<HxSelectOption>, option: HxSelectOption
): HTMLSpanElement | undefined => {
	const index = options.indexOf(option);
	if (index === -1) {
		return (void 0);
	}

	// manipulate the dom attribute directly, to avoid the rerender
	// since don't know how many options there are, rerender costs too expensive
	handleRef.current?.parentElement?.querySelector(':scope > span[data-hx-label][data-hx-label-hovered]')?.removeAttribute('data-hx-label-hovered');
	const optionDomNodes = handleRef.current?.parentElement?.querySelectorAll(':scope > span[data-hx-label]');
	if (optionDomNodes != null) {
		const node = optionDomNodes.item(index);
		node.setAttribute('data-hx-label-hovered', '');
		return node as HTMLSpanElement;
	} else {
		return (void 0);
	}
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
		const hoveredOptionRef = useRef<HxSelectOption | undefined>();
		const handleRef = useRef<HTMLDivElement | null>(null);

		/**
		 * Listen for options load/change events to update the options list
		 */
		useEffect(() => {
			const onOptionsLoadOrChange = (options: Array<HxSelectOption>) => {
				optionsRef.current = {options, displayOptions: options, loaded: true};
				context.forceUpdate();
			};

			popupContext.on(EvtOptionsLoad, onOptionsLoadOrChange);
			popupContext.on(EvtOptionsChange, onOptionsLoadOrChange);
			return () => {
				popupContext.off(EvtOptionsLoad, onOptionsLoadOrChange);
				popupContext.off(EvtOptionsChange, onOptionsLoadOrChange);
			};
		}, [popupContext, context]);
		/**
		 * Handle keyboard navigation events for option selection
		 */
		useEffect(() => {
			/**
			 * Move hover state to the previous option in the list
			 * Wraps to first option if no option is currently hovered
			 */
			const onHoverPreviousOption = () => {
				const hoveredOption = hoveredOptionRef.current;
				const options = optionsRef.current.displayOptions;
				if (hoveredOption == options[0] || options.length === 0) {
					// is the first one, or no options at all
					// do nothing
					return;
				}
				const index = hoveredOption == null ? -1 : options.indexOf(hoveredOption);
				if (index === -1) {
					hoveredOptionRef.current = options[0];
				} else {
					hoveredOptionRef.current = options[index - 1];
				}
				// operate dom directly for saving cost
				const hovered = hoverOption(handleRef, options, hoveredOptionRef.current);
				scrollIntoViewIfNeed(hovered);
			};
			/**
			 * Move hover state to the next option in the list
			 * Wraps to first option if no option is currently hovered
			 */
			const onHoverNextOption = () => {
				const hoveredOption = hoveredOptionRef.current;
				const options = optionsRef.current.displayOptions;
				if (hoveredOption == options[options.length - 1] || options.length === 0) {
					// is the last one, or no options at all
					// do nothing
					return;
				}
				const index = hoveredOption == null ? -1 : options.indexOf(hoveredOption);
				if (index === -1) {
					hoveredOptionRef.current = options[0];
				} else {
					hoveredOptionRef.current = options[index + 1];
				}
				// operate dom directly for saving cost
				const hovered = hoverOption(handleRef, options, hoveredOptionRef.current);
				scrollIntoViewIfNeed(hovered);
			};
			/**
			 * Select the currently hovered option
			 */
			const onSelectHoverOption = () => {
				if (hoveredOptionRef.current == null) {
					return;
				}
				popupContext.emit(EvtOptionSelect, hoveredOptionRef.current);
			};

			popupContext.on(EvtHoverPreviousOption, onHoverPreviousOption);
			popupContext.on(EvtHoverNextOption, onHoverNextOption);
			popupContext.on(EvtSelectHoverOption, onSelectHoverOption);
			return () => {
				popupContext.on(EvtHoverPreviousOption, onHoverPreviousOption);
				popupContext.on(EvtHoverNextOption, onHoverNextOption);
				popupContext.on(EvtSelectHoverOption, onSelectHoverOption);
			};
		}, [context, popupContext]);
		useEffect(() => {
			// every time after popup rendered
			if (showSelectedOnPopupOpen && visible && optionsRef.current.loaded) {
				const options = optionsRef.current.displayOptions;
				const modelValue = ERO.getValue($model, $field);
				hoveredOptionRef.current = options.find(option => option.value == modelValue);
				if (hoveredOptionRef.current != null) {
					// operate dom directly for saving cost
					const hovered = hoverOption(handleRef, options, hoveredOptionRef.current);
					scrollIntoViewIfNeed(hovered);
				}
			}
			// eslint-disable-next-line react-hooks/refs
		}, [$model, $field, visible, showSelectedOnPopupOpen, optionsRef.current.loaded]);
		useEffect(() => {
			if (!visible || !optionsRef.current.loaded || !sort || handleRef.current == null) {
				return;
			}

			const optionDomNodes = handleRef.current.parentElement?.querySelectorAll(':scope > span[data-hx-label]');
			if (optionDomNodes != null) {
				const nodes: Array<HTMLElement> = [...optionDomNodes.values()] as Array<HTMLElement>;
				nodes.sort((a, b) => {
					return (a.getAttribute('data-hx-label-text') ?? '')
						.localeCompare(b.getAttribute('data-hx-label-text') ?? '', (void 0), {
							sensitivity: 'accent', numeric: true
						});
				}).forEach((node, index) => {
					node.style.order = `${index + 1}`;
				});
			}
			// eslint-disable-next-line react-hooks/refs
		}, [visible, optionsRef.current.loaded, sort]);

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
				popupContext.emit(EvtOptionSelect, option);
			};
		};
		/**
		 * Create mouse enter handler for option items
		 * @param option - The option being hovered
		 * @returns Mouse enter handler that updates hover state
		 */
		const onOptionMouseEnter = (option: HxSelectOption): MouseEventHandler<HTMLSpanElement> => {
			return () => {
				hoveredOptionRef.current = option;
				// operate dom directly for saving cost
				hoverOption(handleRef, optionsRef.current.displayOptions, option);
			};
		};

		// eslint-disable-next-line react-hooks/refs
		if (!optionsRef.current.loaded) {
			return <>
				<div data-hx-select-popup-handle="" ref={handleRef}/>
				<HxLabel text={optionsOnLoadKey}
				         data-hx-select-option="" data-hx-label-text-indent=""/>
			</>;
		}

		// eslint-disable-next-line react-hooks/refs
		if (optionsRef.current.displayOptions.length === 0) {
			return <>
				<div data-hx-select-popup-handle="" ref={handleRef}/>
				<HxLabel text={noOptionsKey}
				         data-hx-select-option="" data-hx-label-text-indent=""/>
			</>;
		}

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
				const optionDomNodes = handleRef.current!.parentElement?.querySelectorAll(':scope > span[data-hx-label]');
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
							node.style.display = 'none';
						}
					});
				}
			});
		}

		return <>
			<div data-hx-select-popup-handle="" ref={handleRef}/>
			{showFilter && $filerModel != null
				? <HxInput $model={$filerModel} $field="text"
					// todo now treated as string, HxInput should be replaced and support react node placeholder
					       placeholder={filterPlaceholderKey as string}/>
				: (void 0)}
			{/* eslint-disable-next-line react-hooks/refs */}
			{optionsRef.current.displayOptions.map(option => {
				const {value: optionValue, label} = option;
				const active = modelValue == optionValue;
				return <HxLabel text={label} clickable={true} active={active}
				                data-hx-select-option="" data-hx-label-text-indent=""
				                onClick={onOptionClick(option)}
				                onMouseEnter={onOptionMouseEnter(option)}
				                key={optionValue}/>;
			})}
		</>;
	};
