import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type MouseEventHandler, type RefObject, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {scrollIntoViewIfNeed} from '../../utils';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {HxSelectDefaults} from './defaults.ts';
import {
	EvtHoverNextOption,
	EvtHoverPreviousOption,
	EvtOptionsChange,
	EvtOptionSelect,
	EvtOptionsLoad,
	EvtSelectHoverOption,
	type HxSelectOption,
	type HxSelectProps
} from './types';

/**
 * Select popup content component props
 * @template T - Type of the form model object
 */
export type HxSelectPopupProps<T extends object> = Omit<
	HxSelectProps<T>,
	| 'maxPopupHeight' | 'zIndex' | 'gapToEdge' | 'options'
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
		node.setAttribute('data-hx-label-hovered', 'true');
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
			showSelectedOnPopupOpen = HxSelectDefaults.showSelectedOnPopupOpen
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

		// TODO: Implement filter and sort functionality

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

		const modelValue = ERO.getValue($model, $field);

		return <>
			<div data-hx-select-popup-handle="" ref={handleRef}/>
			{/* eslint-disable-next-line react-hooks/refs */}
			{optionsRef.current.displayOptions.map(option => {
				const {value: optionValue, label} = option;
				const active = modelValue == optionValue;
				return <HxLabel text={label}
				                clickable={true}
				                active={active}
				                paddingX="text-indent"
				                onClick={onOptionClick(option)}
				                onMouseEnter={onOptionMouseEnter(option)}
				                key={optionValue}/>;
			})}
		</>;
	};
