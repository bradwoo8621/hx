import {type KeyboardEvent, type KeyboardEventHandler, type RefObject, useEffect, useRef, useState} from 'react';
import {DOMUtils} from '../../utils';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {
	EvtHxDateTimePicker_ArrowKey,
	EvtHxDateTimePicker_ClosePopup,
	EvtHxDateTimePicker_GetPicker,
	EvtHxDateTimePicker_HoverChange,
	EvtHxDateTimePicker_MonthSelected,
	EvtHxDateTimePicker_SelectHovered,
	EvtHxDateTimePicker_YearSelected,
	type HxDateTimePicker_DatePanel
} from './types';

type HeaderButtonElementType = 'prev-year' | 'prev-month' | 'next-month' | 'next-year';
type HeaderButtonElement = [HTMLButtonElement, HeaderButtonElementType];
type HeaderButtonLikeElementType = 'months' | 'years';
type HeaderButtonLikeElement = [HTMLSpanElement, HeaderButtonLikeElementType];
type PanelCellElementType = 'year' | 'month' | 'day';
type PanelCellElement = [HTMLSpanElement, PanelCellElementType];
type TimeInputElementType = 'hour' | 'minute' | 'second';
type TimeInputElement = [HTMLInputElement, TimeInputElementType];
type TimeButtonElementType = 'start-of-day' | 'noon-of-day' | 'end-of-day';
type TimeButtonElement = [HTMLButtonElement, TimeButtonElementType];
type FooterButtonElementType = 'today' | 'clear' | 'confirm'
type FooterButtonElement = [HTMLButtonElement, FooterButtonElementType];
type NonPanelCellElementType =
	| HeaderButtonElementType | HeaderButtonLikeElementType
	| TimeInputElementType | TimeButtonElementType
	| FooterButtonElementType;
type FocusElementType = PanelCellElementType | NonPanelCellElementType;
type FocusElement =
	| HeaderButtonElement | HeaderButtonLikeElement
	| PanelCellElement
	| TimeInputElement | TimeButtonElement
	| FooterButtonElement;

export const useHxDateTimePickerPopupFocusRef = (containerRef: RefObject<HTMLDivElement>, stateRef: HxDateTimePickerStateRef): KeyboardEventHandler => {
	const popupContext = useHxPopupContext();
	const focusRef = useRef<FocusElement>((void 0));
	const [handlers] = useState(() => {
		const PanelSelectors = {
			MonthsShown: ':scope > div[data-hx-dtp-panel-months][data-hx-dtp-panel-months-visible=show]',
			MonthsNotShown: ':scope > div[data-hx-dtp-panel-months]:not([data-hx-dtp-panel-months-visible=show])'
		};
		const PanelCellSelectors = {
			DayOfState: ':scope > div[data-hx-dtp-panel-days] > span[data-hx-dtp-panel-state-day]',
			DayOfIndex: (index: number) => `:scope > div[data-hx-dtp-panel-days] > span[data-hx-dtp-panel-day-gregory]:not([data-hx-dtp-panel-day-bc]):not([data-hx-dtp-panel-day-y10k]):nth-child(${index + 1})`,

			MonthOfState: ':scope > div[data-hx-dtp-panel-months] > span[data-hx-dtp-panel-state-month]',
			MonthOfIndex: (index: number) => `:scope > div[data-hx-dtp-panel-months] > span[data-hx-dtp-panel-month-gregory]:not([data-hx-dtp-panel-month-bc]):not([data-hx-dtp-panel-month-y10k]):nth-child(${index + 1})`,

			YearOfState: ':scope > div[data-hx-dtp-panel-years] > span[data-hx-dtp-panel-state-year]',
			YearOfIndex: (index: number) => `:scope > div[data-hx-dtp-panel-years] > span[data-hx-dtp-panel-year-gregory]:nth-child(${index + 1})`
		};
		const Selectors = {
			'prev-year': ':scope > div[data-hx-dtp-panel-header] > button[data-hx-dtp-panel-btn=prev-year][data-hx-dtp-panel-btn-visible]:not([data-hx-dtp-panel-btn-disabled])',
			'prev-month': ':scope > div[data-hx-dtp-panel-header] > button[data-hx-dtp-panel-btn=prev-month][data-hx-dtp-panel-btn-visible]:not([data-hx-dtp-panel-btn-disabled])',
			'months': ':scope > div[data-hx-dtp-panel-header] > span[data-hx-dtp-panel-btn=month]',
			'years': ':scope > div[data-hx-dtp-panel-header] > span[data-hx-dtp-panel-btn=year]',
			'next-month': ':scope > div[data-hx-dtp-panel-header] > button[data-hx-dtp-panel-btn=next-month][data-hx-dtp-panel-btn-visible]:not([data-hx-dtp-panel-btn-disabled])',
			'next-year': ':scope > div[data-hx-dtp-panel-header] > button[data-hx-dtp-panel-btn=next-year][data-hx-dtp-panel-btn-visible]:not([data-hx-dtp-panel-btn-disabled])',
			'hour': ':scope > div[data-hx-dtp-panel-time] > div[data-hx-input-box] > input[data-hx-dtp-panel-time-input=hour]',
			'minute': ':scope > div[data-hx-dtp-panel-time] > div[data-hx-input-box] > input[data-hx-dtp-panel-time-input=minute]',
			'second': ':scope > div[data-hx-dtp-panel-time] > div[data-hx-input-box] > input[data-hx-dtp-panel-time-input=second]',
			'start-of-day': ':scope > div[data-hx-dtp-panel-time] > button[data-hx-dtp-panel-btn=start-of-day]',
			'noon-of-day': ':scope > div[data-hx-dtp-panel-time] > button[data-hx-dtp-panel-btn=noon-of-day]',
			'end-of-day': ':scope > div[data-hx-dtp-panel-time] > button[data-hx-dtp-panel-btn=end-of-day]',
			'today': ':scope > div[data-hx-dtp-panel-footer] > button[data-hx-dtp-panel-btn=today]',
			'clear': ':scope > div[data-hx-dtp-panel-footer] > button[data-hx-dtp-panel-btn=clear]',
			'confirm': ':scope > div[data-hx-dtp-panel-footer] > button[data-hx-dtp-panel-btn=confirm]'
		};
		type SelectorKey = keyof typeof Selectors;
		type FixTargets = SelectorKey | (() => boolean) | Array<SelectorKey | (() => boolean)> | 'none';

		// only for input/button, or sub dom in button
		const asFocusElement = (ev?: KeyboardEvent): FocusElement | undefined => {
			if (ev == null) {
				return focusRef.current;
			}

			// only input and button can grab focus, which means only input and button can fire event
			const target = ev.target as HTMLElement;
			if (target.tagName === 'INPUT') {
				return [target as HTMLInputElement, target.getAttribute('data-hx-dtp-panel-time-input') as TimeInputElementType];
			}
			if (target.tagName === 'BUTTON') {
				return [
					target as HTMLButtonElement,
					target.getAttribute('data-hx-dtp-panel-btn') as HeaderButtonElementType | TimeButtonElementType | FooterButtonElementType
				];
			}
			const button = target.closest('button[data-hx-dtp-panel-btn]');
			if (button != null) {
				return [
					button as HTMLButtonElement,
					button.getAttribute('data-hx-dtp-panel-btn') as HeaderButtonElementType | TimeButtonElementType | FooterButtonElementType
				];
			}

			return focusRef.current;
		};
		const ensureElement = (ev: KeyboardEvent | undefined, then: (found: FocusElement) => void, or?: () => void): void => {
			const found = asFocusElement(ev);
			if (found != null) {
				then(found);
			} else {
				or?.();
			}
		};
		const focusFirstElement = () => {
			const container = containerRef.current;
			if (container == null) {
				return;
			}
			const prevYearButton = container.querySelector(Selectors['prev-year']);
			if (prevYearButton != null) {
				const button = prevYearButton as HTMLButtonElement;
				button.focus();
				focusRef.current = [button, 'prev-year'];
				return;
			}
			const prevMonthButton = container.querySelector(Selectors['prev-month']);
			if (prevMonthButton != null) {
				const button = prevMonthButton as HTMLButtonElement;
				button.focus();
				focusRef.current = [button, 'prev-month'];
				return;
			}
			// months button always there, so there is no need to detect other
			const monthsButton = container.querySelector(Selectors.months);
			if (monthsButton != null) {
				monthsButton.setAttribute('data-hx-hover', '');
				focusRef.current = [monthsButton as HTMLSpanElement, 'months'];
			}
		};
		const focusTo = (element?: FocusElement) => {
			if (element == null) {
				return;
			}
			const current = focusRef.current;
			if (current != null) {
				current[0].removeAttribute('data-hx-hover');
			}
			focusRef.current = element;
			element[0].setAttribute('data-hx-hover', '');
			const tag = element[0].tagName;
			if (tag === 'INPUT') {
				const input = element[0] as HTMLInputElement;
				if (!input.matches(':focus')) {
					input.focus();
					// selection range might be reset during focusing,
					// since React is doing something, leading the select() invoked synchronized not working
					// so using setTimeout make it asynchronized to fix this issue
					setTimeout(() => input.select(), 0);
				}
			} else if (tag === 'BUTTON') {
				element[0].focus();
			} else if (current != null) {
				// remove focus
				containerRef.current?.focus();
			}
		};
		const findFocusElement = (selector: string, type: string): FocusElement | undefined => {
			const el = containerRef.current?.querySelector(selector);
			return el == null ? (void 0) : ([el, type] as FocusElement);
		};
		const changeFocusTo = (el: HTMLElement): void => {
			let type = el.getAttribute('data-hx-dtp-panel-time-input');
			if (type == null) {
				if (el.hasAttribute('data-hx-dtp-panel-day-gregory')) {
					type = 'day';
				} else if (el.hasAttribute('data-hx-dtp-panel-day-era')) {
					type = 'day';
					el = el.parentElement as HTMLElement;
				} else if (el.hasAttribute('data-hx-dtp-panel-month-gregory')) {
					type = 'month';
				} else if (el.hasAttribute('data-hx-dtp-panel-month-era') || el.hasAttribute('data-hx-dtp-panel-month-eras')) {
					type = 'month';
					el = el.parentElement as HTMLElement;
				} else if (el.hasAttribute('data-hx-dtp-panel-year-gregory')) {
					type = 'year';
				} else if (el.hasAttribute('data-hx-dtp-panel-year-era') || el.hasAttribute('data-hx-dtp-panel-year-eras')) {
					type = 'year';
					el = el.parentElement as HTMLElement;
				}
			}
			if (type == null) {
				type = el.getAttribute('data-hx-dtp-panel-btn');
				if (type === 'year') {
					type = 'years';
				} else if (type === 'month') {
					type = 'months';
				}
			}
			if (type == null) {
				const button = el.closest('button[data-hx-dtp-panel-btn]');
				if (button != null) {
					type = button.getAttribute('data-hx-dtp-panel-btn');
					el = button as HTMLElement;
				}
			}
			if (type != null) {
				focusTo([el, type] as FocusElement);
			}
		};

		const moveToFixTarget = (targets: FixTargets, when?: () => boolean): boolean => {
			if (targets === 'none') {
				return false;
			}
			if (when != null && !when()) {
				return false;
			}

			if (Array.isArray(targets)) {
				for (const target of targets) {
					if (typeof target === 'function') {
						if (target()) {
							return true;
						}
					} else {
						const focusElement = findFocusElement(Selectors[target], target);
						if (focusElement != null) {
							focusTo(focusElement);
							return true;
						}
					}
				}
				return false;
			} else if (typeof targets === 'function') {
				return targets();
			} else {
				focusTo(findFocusElement(Selectors[targets], targets));
				return true;
			}
		};
		const moveToPanelCell = (panel: HxDateTimePicker_DatePanel, selector: string): boolean => {
			const stateDayCellEl = containerRef.current?.querySelector(selector);
			if (stateDayCellEl != null) {
				const type = panel === 'years' ? 'year' : (panel === 'months' ? 'month' : 'day');
				focusTo([stateDayCellEl as HTMLSpanElement, type]);
				return true;
			}
			return false;
		};
		const moveToStatePanelCell = (): boolean => {
			const panel = stateRef.currentDatePanel();
			const selector = panel === 'years' ? PanelCellSelectors.YearOfState : (panel === 'months' ? PanelCellSelectors.MonthOfState : PanelCellSelectors.DayOfState);
			return moveToPanelCell(panel, selector);
		};
		const moveToPreviousRowCell = (): boolean => {
			const el = focusRef.current?.[0];
			const type = focusRef.current?.[1];
			if (el == null || type == null) {
				return false;
			}
			switch (type) {
				case 'day': {
					const index = Array.from(el.parentElement!.children).indexOf(el);
					if (index >= 14) {
						// 7 weekday cell + 1 separator cell
						// the first day row's index is 8 - 14
						const selector = PanelCellSelectors.DayOfIndex(index - 7);
						return moveToPanelCell('days', selector);
					}
					break;
				}
				case 'month': {
					const index = Array.from(el.parentElement!.children).indexOf(el);
					if (index >= 2) {
						// the first month row's index is 0 - 2
						const selector = PanelCellSelectors.MonthOfIndex(index - 3);
						return moveToPanelCell('months', selector);
					}
					break;
				}
				case 'year': {
					const index = Array.from(el.parentElement!.children).indexOf(el);
					if (index >= 4) {
						// the first year row's index is 0 - 4
						const selector = PanelCellSelectors.YearOfIndex(index - 5);
						return moveToPanelCell('years', selector);
					}
					break;
				}
			}
			return false;
		};
		const moveToNextRowCell = (): boolean => {
			const el = focusRef.current?.[0];
			const type = focusRef.current?.[1];
			if (el == null || type == null) {
				return false;
			}
			switch (type) {
				case 'day': {
					const index = Array.from(el.parentElement!.children).indexOf(el);
					if (index < 43) {
						// the last day row's index is 43 - 49
						const selector = PanelCellSelectors.DayOfIndex(index + 7);
						return moveToPanelCell('days', selector);
					}
					break;
				}
				case 'month': {
					const monthElements = Array.from(el.parentElement!.children);
					const index = monthElements.indexOf(el);
					if (index < 9) {
						// index 0 - 8 is definitely not last month row
						const selector = PanelCellSelectors.MonthOfIndex(index + 3);
						return moveToPanelCell('months', selector);
					} else if (index < 12 && monthElements.length === 13) {
						// index 9 - 11, move to 13 month when existing
						return moveToPanelCell('months', PanelCellSelectors.MonthOfIndex(12));
					}
					break;
				}
				case 'year': {
					const index = Array.from(el.parentElement!.children).indexOf(el);
					if (index < 20) {
						// the last year row's index is 20 - 24
						const selector = PanelCellSelectors.YearOfIndex(index + 5);
						return moveToPanelCell('years', selector);
					}
					break;
				}
			}
			return false;
		};
		const moveToNextOrPreviousPanelCell = (element: HTMLSpanElement, type: PanelCellElementType, direction: 'left' | 'right') => {
			const dir = getComputedStyle(element.parentElement!).direction;
			const toPrevious = dir === 'rtl' ? (direction === 'right') : (direction === 'left');
			if (toPrevious) {
				const previous = element.previousElementSibling;
				if (previous != null
					&& !previous.hasAttribute('data-hx-dtp-panel-days-header-separator')
					&& !previous.hasAttribute('data-hx-dtp-panel-day-bc')
					&& !previous.hasAttribute('data-hx-dtp-panel-month-bc')) {
					focusTo([previous as HTMLSpanElement, type]);
				}
			} else {
				const next = element.nextElementSibling;
				if (next != null
					&& !next.hasAttribute('data-hx-dtp-panel-day-y10k')
					&& !next.hasAttribute('data-hx-dtp-panel-month-y10k')) {
					focusTo([next as HTMLSpanElement, type]);
				}
			}
		};
		const moveToPickerInput = (): boolean => {
			let ret = false;
			// it is a synchronized event
			popupContext.emit(EvtHxDateTimePicker_GetPicker, (el?: HTMLElement) => {
				if (el != null) {
					el.focus();
					ret = true;
				}
			});
			return ret;
		};
		const moveToNextOfPicker = (): boolean => {
			let ret = false;
			// it is a synchronized event
			popupContext.emit(EvtHxDateTimePicker_GetPicker, (el?: HTMLElement) => {
				if (el != null) {
					const [, next] = DOMUtils.anteroposteriorTabNodes(el);
					if (next != null) {
						next.focus();
						ret = true;
					}
				}
			});
			return ret;
		};

		const UpTo: Record<FocusElementType, FixTargets> = {
			'prev-year': 'none',
			'prev-month': 'none',
			'months': 'none',
			'years': 'none',
			'next-month': 'none',
			'next-year': 'none',
			'day': [moveToPreviousRowCell, 'months'],
			'month': [moveToPreviousRowCell, 'months'],
			'year': [moveToPreviousRowCell, 'months'],
			'hour': moveToStatePanelCell,
			'minute': moveToStatePanelCell,
			'second': moveToStatePanelCell,
			'start-of-day': moveToStatePanelCell,
			'noon-of-day': moveToStatePanelCell,
			'end-of-day': moveToStatePanelCell,
			'today': ['hour', moveToStatePanelCell],
			'clear': ['hour', moveToStatePanelCell],
			'confirm': ['hour', moveToStatePanelCell]
		};
		const DownTo: Record<FocusElementType, FixTargets> = {
			'prev-year': moveToStatePanelCell,
			'prev-month': moveToStatePanelCell,
			'months': moveToStatePanelCell,
			'years': moveToStatePanelCell,
			'next-month': moveToStatePanelCell,
			'next-year': moveToStatePanelCell,
			'day': [moveToNextRowCell, 'hour', 'today'],
			'month': [moveToNextRowCell, 'today'],
			'year': [moveToNextRowCell, 'today'],
			'hour': 'today',
			'minute': 'today',
			'second': 'today',
			'start-of-day': 'today',
			'noon-of-day': 'today',
			'end-of-day': 'today',
			'today': 'none',
			'clear': 'none',
			'confirm': 'none'
		};
		const LeftTo: Partial<Record<FocusElementType, FixTargets>> = {
			'prev-year': 'none',
			'prev-month': 'prev-year',
			'months': ['prev-month', 'prev-year'],
			'years': 'months',
			'next-month': 'years',
			'next-year': ['next-month', 'years'],
			'hour': 'none',
			'minute': 'hour',
			'second': 'minute',
			'start-of-day': ['second', 'minute', 'hour'],
			'noon-of-day': 'start-of-day',
			'end-of-day': 'noon-of-day',
			'today': 'none',
			'clear': 'today',
			'confirm': ['clear', 'today']
		};
		const ShiftTabTo: Partial<Record<FocusElementType, FixTargets>> = {
			...LeftTo,
			'prev-year': moveToPickerInput,
			'prev-month': ['prev-year', moveToPickerInput],
			'months': ['prev-month', 'prev-year', moveToPickerInput],
			'hour': moveToStatePanelCell,
			'today': moveToStatePanelCell
		};
		const RightTo: Partial<Record<FocusElementType, FixTargets>> = {
			'prev-year': ['prev-month', 'months'],
			'prev-month': 'months',
			'months': 'years',
			'years': ['next-month', 'next-year'],
			'next-month': 'next-year',
			'next-year': 'none',
			'hour': ['minute', 'start-of-day'],
			'minute': ['second', 'start-of-day'],
			'second': 'start-of-day',
			'start-of-day': 'noon-of-day',
			'noon-of-day': 'end-of-day',
			'end-of-day': 'none',
			'today': ['clear', 'confirm'],
			'clear': 'confirm',
			'confirm': 'none'
		};
		const TabTo: Partial<Record<FocusElementType, FixTargets>> = {
			...RightTo,
			'years': ['next-month', 'next-year', moveToStatePanelCell],
			'next-month': ['next-year', moveToStatePanelCell],
			'next-year': moveToStatePanelCell,
			'end-of-day': 'today',
			'today': ['clear', 'confirm', moveToNextOfPicker],
			'clear': ['confirm', moveToNextOfPicker],
			'confirm': moveToNextOfPicker
		};

		const onEscape = () => {
			popupContext.emit(EvtHxDateTimePicker_ClosePopup);
		};
		const onTab = (ev?: KeyboardEvent) => {
			ev?.preventDefault();
			ensureElement(ev, ([, type]) => {
				const targets = TabTo[type];
				if (targets == null) {
					// move to time part when current panel is days and time part existing,
					// or move to footer
					if (stateRef.currentDatePanel() === 'days') {
						moveToFixTarget(['hour', 'today']);
					} else {
						moveToFixTarget('today');
					}
				} else {
					moveToFixTarget(targets);
				}
			}, focusFirstElement);
		};
		const onShiftTab = (ev?: KeyboardEvent) => {
			ev?.preventDefault();
			ensureElement(ev, ([, type]) => {
				const targets = ShiftTabTo[type];
				if (targets == null) {
					moveToFixTarget(['prev-year', 'prev-month', 'months']);
				} else if (type === 'today') {
					if (stateRef.currentDatePanel() === 'days') {
						moveToFixTarget(targets);
					} else {
						moveToStatePanelCell();
					}
				} else {
					moveToFixTarget(targets);
				}
			}, focusFirstElement);
		};
		const onArrowUp = (ev?: KeyboardEvent) => {
			ensureElement(ev, ([, type]) => {
				if (['today', 'clear', 'confirm'].includes(type)) {
					if (stateRef.currentDatePanel() === 'days') {
						moveToFixTarget(UpTo[type]);
					} else {
						moveToStatePanelCell();
					}
				} else {
					moveToFixTarget(UpTo[type]);
				}
			}, focusFirstElement);
		};
		const onArrowDown = (ev?: KeyboardEvent) => {
			ensureElement(ev, ([, type]) => {
				moveToFixTarget(DownTo[type]);
			}, focusFirstElement);
		};
		const onArrowLeft = (ev?: KeyboardEvent) => {
			ensureElement(ev, ([element, type]) => {
				const targets = LeftTo[type];
				if (targets == null) {
					moveToNextOrPreviousPanelCell(element, type as PanelCellElementType, 'left');
				} else {
					moveToFixTarget(targets, () => {
						if (element.tagName === 'INPUT') {
							const input = element as HTMLInputElement;
							if (input.selectionStart !== 0 || input.selectionEnd !== 0) {
								// arrow left for input, make sure the caret is at very first
								return false;
							}
						}
						return true;
					});
				}
			}, focusFirstElement);
		};
		const onArrowRight = (ev?: KeyboardEvent) => {
			ensureElement(ev, ([element, type]) => {
				const targets = RightTo[type];
				if (targets == null) {
					moveToNextOrPreviousPanelCell(element, type as PanelCellElementType, 'right');
				} else {
					moveToFixTarget(targets, () => {
						if (element.tagName === 'INPUT') {
							const input = element as HTMLInputElement;
							const length = input.value.length;
							if (input.selectionStart !== length || input.selectionEnd !== length) {
								// arrow right for input, make sure the caret is at very last
								return false;
							}
						}
						return true;
					});
				}
			}, focusFirstElement);
		};
		const onConfirm = (ev?: KeyboardEvent) => {
			ensureElement(ev, ([element, type]) => {
				if (['months', 'years', 'day', 'month', 'year'].includes(type)) {
					if (ev?.key === ' ') {
						ev.preventDefault();
					}
					element.click();
				}
			});
		};

		return {
			PanelSelectors,

			moveToStatePanelCell, changeFocusTo,

			onEscape,
			onTab, onShiftTab, onArrowUp, onArrowDown, onArrowLeft, onArrowRight,
			onConfirm
		};
	});
	// visual focus on the state value cell when the popup opens (real focus stays on the container)
	useEffect(() => {
		if (containerRef.current == null || focusRef.current != null) {
			return;
		}
		// focus on the days panel, state value cell
		handlers.moveToStatePanelCell();
		containerRef.current.focus();
	});

	// the picker input drives the grid visual focus while the popup is open
	useEffect(() => {
		const onHoverChange = (el: HTMLElement) => {
			handlers.changeFocusTo(el);
		};
		const onArrowKey = (direction: 'up' | 'down' | 'left' | 'right') => {
			switch (direction) {
				case 'up': {
					handlers.onArrowUp();
					break;
				}
				case 'down': {
					handlers.onArrowDown();
					break;
				}
				case 'left': {
					handlers.onArrowLeft();
					break;
				}
				case 'right': {
					handlers.onArrowRight();
					break;
				}
			}
		};
		const onSelectHovered = () => {
			handlers.onConfirm();
		};
		const onMonthSelected = () => {
			const focusToDayCell = () => {
				setTimeout(() => {
					if (containerRef.current == null) {
						return;
					}
					const monthsPanel = containerRef.current.querySelector(handlers.PanelSelectors.MonthsNotShown);
					if (monthsPanel == null) {
						focusToDayCell();
					} else {
						handlers.moveToStatePanelCell();
					}
				}, 10);
			};
			focusToDayCell();
		};
		const onYearSelected = () => {
			const focusToMonthCell = () => {
				setTimeout(() => {
					if (containerRef.current == null) {
						return;
					}
					const monthsPanel = containerRef.current.querySelector(handlers.PanelSelectors.MonthsShown);
					if (monthsPanel == null) {
						focusToMonthCell();
					} else {
						handlers.moveToStatePanelCell();
					}
				}, 10);
			};
			focusToMonthCell();
		};

		popupContext.on(EvtHxDateTimePicker_HoverChange, onHoverChange);
		popupContext.on(EvtHxDateTimePicker_ArrowKey, onArrowKey);
		popupContext.on(EvtHxDateTimePicker_SelectHovered, onSelectHovered);
		popupContext.on(EvtHxDateTimePicker_MonthSelected, onMonthSelected);
		popupContext.on(EvtHxDateTimePicker_YearSelected, onYearSelected);
		return () => {
			popupContext.off(EvtHxDateTimePicker_HoverChange, onHoverChange);
			popupContext.off(EvtHxDateTimePicker_ArrowKey, onArrowKey);
			popupContext.off(EvtHxDateTimePicker_SelectHovered, onSelectHovered);
			popupContext.off(EvtHxDateTimePicker_MonthSelected, onMonthSelected);
			popupContext.off(EvtHxDateTimePicker_YearSelected, onYearSelected);
		};
	}, [handlers, popupContext, containerRef]);

	// clear the hover visual on unmount
	useEffect(() => {
		return () => {
			focusRef.current?.[0]?.removeAttribute('data-hx-hover');
			delete focusRef.current;
		};
	}, []);

	return (ev: KeyboardEvent<HTMLDivElement>): void => {
		switch (ev.key) {
			case 'Escape': {
				handlers.onEscape();
				break;
			}
			case 'Enter':
			case ' ': {
				handlers.onConfirm(ev);
				break;
			}
			case 'Tab': {
				if (ev.shiftKey) {
					handlers.onShiftTab(ev);
				} else {
					handlers.onTab(ev);
				}
				break;
			}
			case 'ArrowUp': {
				handlers.onArrowUp(ev);
				break;
			}
			case 'ArrowDown': {
				handlers.onArrowDown(ev);
				break;
			}
			case 'ArrowLeft': {
				handlers.onArrowLeft(ev);
				break;
			}
			case 'ArrowRight': {
				handlers.onArrowRight(ev);
				break;
			}
		}
	};
};
