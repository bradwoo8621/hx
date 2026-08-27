/**
 * Full keyboard control for the HxDateTimePicker popup.
 *
 * This file is the SINGLE keyboard controller for the popup. All key rules,
 * focus routing and focus state live here; the popup-xxx view files contain
 * no keyboard logic. Design approved 2026-08-26.
 *
 * ============================================================================
 * ARCHITECTURE
 * ============================================================================
 *
 * - Visual focus model (same as the select options): the grid cells never
 *   receive real focus and carry NO tabIndex. The currently hovered cell is a
 *   visual indicator only — a ref to the DOM cell plus the data-hx-hover
 *   attribute (label.css renders its background). Real focus stays on the
 *   picker input while the arrows move the grid, exactly like the select
 *   keeps focus in its filter input and moves the option highlight.
 * - The picker input emits EvtHxDateTimePicker_ArrowKey for every arrow key
 *   while the popup is open; this controller subscribes and moves the visual
 *   focus inside the grid. Enter/Space on the input emit
 *   EvtHxDateTimePicker_SelectHovered to select the visual cell.
 * - While the visual focus is inside the grid, arrow keys and Enter/Space
 *   from ANY source (picker input or popup controls) route to the grid: the
 *   container keydown handler checks the visual state first.
 * - Real focus only ever lands on actual controls: header/time/footer
 *   buttons and the time inputs. The header month/year labels keep
 *   tabIndex={-1} so they can receive programmatic focus when the grid
 *   leaves upward (they are the only labels that do).
 * - The grid leaves upward to the header labels (real focus), downward into
 *   the time first input or footer Today (real focus). Time/footer up back
 *   to the grid only re-points the visual indicator; the real focus stays
 *   on the control.
 * - Tab/Shift+Tab inside the popup are intercepted by the container handler
 *   and routed by rule; the picker input Tab is untouched (browser default,
 *   focus flows out and the popup closes through the outside-focus check).
 *   The ONLY unprevented popup Tab is the footer tail Tab: the browser moves
 *   focus naturally (next tabbable element, e.g. the element after the
 *   input; in a single-component page it wraps back to the picker input and
 *   the popup stays open).
 * - Block identification reads the event target's data attributes:
 *     data-hx-dtp-panel-btn="prev-year|prev-month|month|year|next-month|next-year|today|clear|confirm|start-of-day|noon-of-day|end-of-day"
 *     data-hx-dtp-panel-day-gregory={day.key}   (days grid cells)
 *     data-hx-dtp-panel-month-gregory={month.key}
 *     data-hx-dtp-panel-year-gregory={year.key}
 *     data-hx-dtp-panel-time-input="hour|minute|second"
 * - Target lookup: containerRef.current.querySelector('[data-...="..."]').
 * - Focus back to the picker input: via the EvtHxDateTimePicker_GetPicker
 *   popup context event.
 *
 * ============================================================================
 * FOCUS MODEL
 * ============================================================================
 *
 * - Initial visual focus when the popup opens: the day cell of the state
 *   value (data-hx-dtp-panel-state-day, "today" when the value is empty;
 *   defaultValue counts), or the first focusable cell when that one is not
 *   clickable. Real focus stays on the picker input.
 * - On close (Escape / day select / Clear / OK): focus returns to the picker
 *   input (the input's onClosePopup listener keeps this).
 *
 * Block chain: header -> [days | months | years] -> time -> footer
 * (days/months/years are mutually exclusive panels sharing the grid rules;
 * the time block only exists when the value has a time part).
 *
 * ============================================================================
 * KEY RULES
 * ============================================================================
 *
 * --- GRID (visual focus, driven by arrows from any source)
 *   left/right    ±1 within the row; first column left -> last cell of the
 *                  previous row; first cell does NOT respond to left; last
 *                  cell does NOT respond to right
 *   up/down       ±1 row; first row up -> header (years panel -> year label,
 *                  days/months panels -> month label); last row down -> time
 *                  first input if time exists, else footer Today
 *   Enter/Space   select the cell (day/month/year; month/year selection
 *                  returns to the days panel)
 *   No auto page-turn: arrows stay within the current panel; month paging is
 *                  only done via the header buttons. Adjacent-month cells
 *                  remain hoverable and Enter on one selects it (the panel
 *                  follows the selection).
 *   BC / y10k / disabled cells are skipped: never hovered, no operation.
 *   months panel: 12th month down -> 13th month, same rule as 11th month.
 *
 * --- HEADER block (prev-year -> prev-month -> month label -> year label
 * ---               -> next-month -> next-year)
 *   left          = Shift+Tab; prev-year does NOT respond to left
 *   right         = Tab; next-year does NOT respond to right
 *   up            -> back to the input (popup stays open)
 *   down          -> grid visual focus on the first focusable cell
 *   Tab           from next-year -> grid visual focus on the state value cell
 *   Shift+Tab     from prev-year -> input
 *   Enter/Space   trigger the element's click (page / switch panel)
 *
 * --- TIME block (hour -> minute -> second -> start-of-day -> noon-of-day
 * ---            -> end-of-day)
 *   inputs        cursor at start (selectionStart === selectionEnd === 0):
 *                  left -> previous input; cursor at end (=== text length):
 *                  right -> next input or button; otherwise the native input
 *                  behavior applies, no extra handling. The hour input does
 *                  NOT respond to left at cursor 0.
 *   buttons       left = Shift+Tab, right = Tab
 *   up            -> grid visual focus back to the state value cell
 *   down          -> footer Today
 *   Shift+Tab     from hour input -> grid visual focus on the state value cell
 *   Tab           from end-of-day -> Today; end-of-day does NOT respond to
 *                  right
 *   Enter/Space   buttons trigger their click; no arrow increment/decrement
 *                  on time fields (digit input + auto-advance unchanged)
 *
 * --- FOOTER block (Today -> Clear? -> OK?; buttons depend on clearable and
 * ---              valueSyncMode)
 *   left/right    = Shift+Tab / Tab; Today does NOT respond to left; the last
 *                  button does NOT respond to right
 *   up            -> time first input if time exists, else grid visual focus
 *                  on the state value cell
 *   Shift+Tab     from the first button = up behavior
 *   Tab           from the last button: unprevented, flows out naturally
 *   Enter/Space   trigger the button's click
 *
 * ============================================================================
 * FOCUS VISUAL FEEDBACK
 * ============================================================================
 *
 * Control style: same as the select options (hoveredOptionRef pattern) —
 * the controller keeps a reference to the currently hovered cell and
 * directly manipulates DOM attributes instead of React state, so rapid
 * arrow-key movement causes no re-renders.
 *
 * - Grid cells (days/months/years) are HxLabel elements; label.css renders
 *   the hover background for the data-hx-hover attribute. The controller
 *   reuses it for the visual focus:
 *     old cell: removeAttribute('data-hx-hover')
 *     new cell: setAttribute('data-hx-hover', '') + scrollIntoViewIfNeed
 *   Keyboard focus looks identical to mouse hover — same semantics ("the
 *   current target"), no new CSS variables needed.
 * - Buttons (header/time/footer) and the time inputs need no extra work:
 *   button.css already has a :focus rule (focus border) and the inputs have
 *   native focus styling. The header month/year labels get the hover
 *   background as focus feedback (label.css :focus-visible outline is
 *   removed globally).
 *
 * ============================================================================
 * IMPLEMENTATION NOTES
 * ============================================================================
 *
 * - The picker input opens the popup on Arrow/Enter/Space; while open it
 *   keeps the real focus and emits EvtHxDateTimePicker_ArrowKey /
 *   EvtHxDateTimePicker_SelectHovered, which drive the visual grid focus.
 * - Grid movement derives rows/columns from the panel layout: days 7
 *   columns (42 cells), months 3 columns (12 or 13 cells), years 5 columns
 *   (25 cells). BC/y10k/disabled cells are skipped while moving.
 * - Panel switches (header labels, month/year selection) re-render the
 *   target panel asynchronously, so pointing the visual focus at the target
 *   panel's state cell is deferred by a short timeout.
 * - When the value has no time part, the grid last row down goes to Today
 *   directly; footer up goes back to the grid state value cell.
 * - The confirm button is absent when valueSyncMode is immediate; the clear
 *   button is absent when clearable is false; the footer tail is the last
 *   RENDERED button (queried from the DOM).
 */
import {type KeyboardEvent as ReactKeyboardEvent, type RefObject, useEffect, useRef} from 'react';
import {DOMUtils} from '../../utils';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {
	EvtHxDateTimePicker_ArrowKey,
	EvtHxDateTimePicker_ClosePopup,
	EvtHxDateTimePicker_DaySelected,
	EvtHxDateTimePicker_GetPicker,
	EvtHxDateTimePicker_MonthSelected,
	EvtHxDateTimePicker_SelectHovered,
	EvtHxDateTimePicker_SwitchDatePanel
} from './types';

/** The header block element order, left to right */
const HEADER_ORDER = ['prev-year', 'prev-month', 'month', 'year', 'next-month', 'next-year'] as const;
/** The time block element order: the three inputs then the three quick buttons */
const TIME_ORDER = ['hour', 'minute', 'second', 'start-of-day', 'noon-of-day', 'end-of-day'] as const;
/** The footer block button names (the rendered subset decides the actual chain) */
const FOOTER_ORDER = ['today', 'clear', 'confirm'] as const;
/** Column count of each grid panel */
const GRID_COLUMNS = {days: 7, months: 3, years: 5} as const;

type GridPanel = 'days' | 'months' | 'years';

export type HxDateTimePickerGridDirection = 'left' | 'right' | 'up' | 'down';
export type HxDateTimePickerGridMoveResult =
	| {kind: 'move'; index: number}
	| {kind: 'leave'; direction: 'up' | 'down'}
	| {kind: 'stay'};

/**
 * Moves one step in a grid-shaped cell list.
 *
 * - left/right move ±1 within the row; the first cell does not move left,
 *   the last cell does not move right (columns wrap naturally because the
 *   previous row's last column and the next row's first column are adjacent).
 * - up/down move ±1 row; the first row leaves upward, the last row leaves
 *   downward.
 * - Non-clickable cells are skipped in the movement direction.
 * - A row above the last one that runs past the list end clamps to the last
 *   cell (months panel: 12th month down goes to the 13th month).
 *
 * @param cells     - the grid cells, in render order
 * @param index     - the current cell index
 * @param direction - the movement direction
 * @param columns   - the column count of the grid
 * @returns the target index, a leave signal, or stay when nothing moves
 */
export const moveInGrid = (
	cells: ReadonlyArray<{clickable: boolean}>,
	index: number,
	direction: HxDateTimePickerGridDirection,
	columns: number
): HxDateTimePickerGridMoveResult => {
	const length = cells.length;
	if (length === 0 || index < 0 || index >= length) {
		return {kind: 'stay'};
	}
	const step = (from: number): 'leave-up' | 'leave-down' | number => {
		const row = Math.floor(from / columns);
		const col = from % columns;
		switch (direction) {
			case 'left': {
				return (row === 0 && col === 0) ? from : (from - 1);
			}
			case 'right': {
				return (from === length - 1) ? from : (from + 1);
			}
			case 'up': {
				return row === 0 ? 'leave-up' : (from - columns);
			}
			case 'down': {
				if (row === Math.floor((length - 1) / columns)) {
					return 'leave-down';
				}
				return Math.min(from + columns, length - 1);
			}
		}
	};
	let current = index;
	let moved = false;
	while (true) {
		const next = step(current);
		if (next === 'leave-up') {
			return {kind: 'leave', direction: 'up'};
		} else if (next === 'leave-down') {
			return {kind: 'leave', direction: 'down'};
		} else if (next === current) {
			// the cell did not move: boundary stop
			return moved ? {kind: 'move', index: current} : {kind: 'stay'};
		} else if (cells[next].clickable) {
			return {kind: 'move', index: next};
		}
		current = next;
		moved = true;
	}
};

/**
 * Moves one step inside a linear block sequence.
 *
 * @param length - the sequence length
 * @param index  - the current index
 * @param step   - +1 forward, -1 backward
 * @returns the target index, 'head' when stepping before the first element,
 *          or 'tail' when stepping past the last one
 */
export const moveInSequence = (length: number, index: number, step: -1 | 1): number | 'head' | 'tail' => {
	if (length === 0) {
		return 'head';
	} else if (step > 0) {
		return index + 1 >= length ? 'tail' : (index + 1);
	} else {
		return index - 1 < 0 ? 'head' : (index - 1);
	}
};

/**
 * The keyboard controller of the datetime picker popup.
 *
 * @param containerRef  - the popup container element
 * @param stateRef      - the popup state facade (grids, panel, moves)
 * @param timeAvailable - whether the value has a time part (time row rendered)
 * @param visible       - whether the popup is currently shown
 * @returns the container onKeyDown handler
 */
export const useHxDateTimePickerPopupFocusRef = (
	containerRef: RefObject<HTMLDivElement>,
	stateRef: HxDateTimePickerStateRef,
	timeAvailable: boolean,
	visible: boolean
) => {
	const popupContext = useHxPopupContext();
	/** the visual focus inside the grid (panel + cell key); null when outside the grid */
	const visualRef = useRef<{panel: GridPanel; key: string} | null>(null);
	/** the DOM element currently showing the data-hx-hover visual (grid cell or header label) */
	const hoveredElRef = useRef<HTMLElement | null>(null);

	/** the grid data of a panel: key + clickable flag, in render order */
	const gridOf = (panel: GridPanel): Array<{key: string; clickable: boolean}> => {
		if (panel === 'days') {
			return stateRef.days(stateRef.weekdays()).map(day => {
				const year = day.value.getFullYear();
				return {key: day.key, clickable: year > 0 && year <= 9999};
			});
		} else if (panel === 'months') {
			return stateRef.months().map(month => {
				return {key: month.key, clickable: !month.bc && !month.y10k};
			});
		} else {
			return stateRef.years().years.map(year => {
				return {key: year.key, clickable: true};
			});
		}
	};

	const cellAttrOf = (panel: GridPanel): string => {
		return panel === 'days' ? 'data-hx-dtp-panel-day-gregory'
			: panel === 'months' ? 'data-hx-dtp-panel-month-gregory'
				: 'data-hx-dtp-panel-year-gregory';
	};

	const cellSelector = (panel: GridPanel, key: string): string => {
		return `[${cellAttrOf(panel)}="${key}"]`;
	};

	const cellElOf = (panel: GridPanel, key: string): HTMLElement | null => {
		return containerRef.current?.querySelector<HTMLElement>(cellSelector(panel, key)) ?? null;
	};

	/** the cell of the state value in the given panel (always exists for days; null fallback elsewhere) */
	const stateCellEl = (panel: GridPanel): HTMLElement | null => {
		const attr = panel === 'days' ? 'data-hx-dtp-panel-state-day'
			: panel === 'months' ? 'data-hx-dtp-panel-state-month'
				: 'data-hx-dtp-panel-state-year';
		return containerRef.current?.querySelector<HTMLElement>(`[${attr}]`) ?? null;
	};

	const firstClickableCellEl = (panel: GridPanel): HTMLElement | null => {
		const first = gridOf(panel).find(cell => cell.clickable);
		return first != null ? cellElOf(panel, first.key) : null;
	};

	/** moves the data-hx-hover visual to an element (grid cell or header label), clearing the previous one */
	const moveHover = (el: HTMLElement | null | undefined) => {
		if (hoveredElRef.current != null && hoveredElRef.current !== el) {
			hoveredElRef.current.removeAttribute('data-hx-hover');
		}
		hoveredElRef.current = el ?? null;
		if (el != null) {
			el.setAttribute('data-hx-hover', '');
			DOMUtils.scrollIntoViewIfNeed(el);
		}
	};

	/** points the visual focus at a grid cell (no real focus) */
	const setVisualCell = (panel: GridPanel, el: HTMLElement | null | undefined) => {
		moveHover(el);
		visualRef.current = el != null ? {panel, key: el.getAttribute(cellAttrOf(panel)) ?? ''} : null;
	};

	/** clears the grid visual focus */
	const clearVisual = () => {
		moveHover(null);
		visualRef.current = null;
	};

	/** moves the real focus to a control (button/input), clearing the grid visual focus */
	const focusControl = (el: HTMLElement | null | undefined) => {
		clearVisual();
		el?.focus();
	};

	/** moves the real focus to a header label (tabIndex=-1 span), with the hover background as feedback */
	const focusLabel = (el: HTMLElement | null | undefined) => {
		clearVisual();
		moveHover(el);
		el?.focus();
	};

	const btnElOf = (name: string): HTMLElement | null => {
		return containerRef.current?.querySelector<HTMLElement>(`[data-hx-dtp-panel-btn="${name}"]`) ?? null;
	};

	const timeInputElOf = (name: string): HTMLElement | null => {
		return containerRef.current?.querySelector<HTMLElement>(`[data-hx-dtp-panel-time-input="${name}"]`) ?? null;
	};

	/** focus back to the picker input (popup stays open) */
	const backToInput = () => {
		popupContext.emit(EvtHxDateTimePicker_GetPicker, (el?: HTMLElement) => {
			focusControl(el);
		});
	};

	/** grid first row up: real focus to the header month/year label */
	const leaveGridUp = (panel: GridPanel) => {
		const name = panel === 'years' ? 'year' : 'month';
		focusLabel(btnElOf(name));
	};

	/** grid last row down: real focus into the time first input, or footer Today without time */
	const leaveGridDown = () => {
		if (timeAvailable) {
			focusControl(timeInputElOf('hour'));
		} else {
			focusControl(btnElOf('today'));
		}
	};

	/** points the visual focus at the grid state value cell (fallback: first clickable cell) */
	const enterGridAtState = (panel: GridPanel) => {
		setVisualCell(panel, stateCellEl(panel) ?? firstClickableCellEl(panel));
	};

	/** points the visual focus at the grid first clickable cell */
	const enterGridAtFirst = (panel: GridPanel) => {
		setVisualCell(panel, firstClickableCellEl(panel));
	};

	/** footer up: into the time first input, or the grid state value cell without time */
	const upFromFooter = () => {
		if (timeAvailable) {
			focusControl(timeInputElOf('hour'));
		} else {
			enterGridAtState(stateRef.currentDatePanel());
		}
	};

	/** the rendered footer button names, in DOM order */
	const footerBtnNames = (): Array<string> => {
		const container = containerRef.current;
		if (container == null) {
			return [];
		}
		return Array.from(container.querySelectorAll('[data-hx-dtp-panel-footer] [data-hx-dtp-panel-btn]'))
			.map(el => el.getAttribute('data-hx-dtp-panel-btn') ?? '');
	};

	/** moves inside the header block; over the head goes to the input, over the tail into the grid */
	const headerMove = (current: string, step: -1 | 1) => {
		const index = HEADER_ORDER.indexOf(current as (typeof HEADER_ORDER)[number]);
		const next = moveInSequence(HEADER_ORDER.length, index, step);
		if (next === 'head') {
			backToInput();
		} else if (next === 'tail') {
			enterGridAtState(stateRef.currentDatePanel());
		} else {
			const name = HEADER_ORDER[next];
			// the month/year labels get the hover background as focus feedback (buttons have their own :focus)
			if (name === 'month' || name === 'year') {
				focusLabel(btnElOf(name));
			} else {
				focusControl(btnElOf(name));
			}
		}
	};

	/** moves inside the time block; over the head goes to the grid state cell, over the tail to Today */
	const timeMove = (current: string, step: -1 | 1) => {
		const index = TIME_ORDER.indexOf(current as (typeof TIME_ORDER)[number]);
		const next = moveInSequence(TIME_ORDER.length, index, step);
		if (next === 'head') {
			enterGridAtState(stateRef.currentDatePanel());
		} else if (next === 'tail') {
			focusControl(btnElOf('today'));
		} else {
			const name = TIME_ORDER[next];
			// inputs are queried by their time-input attribute, quick buttons by their btn attribute
			focusControl(timeInputElOf(name) ?? btnElOf(name));
		}
	};

	/** moves inside the footer block; over the head goes up, over the tail flows out (caller decides) */
	const footerMove = (current: string, step: -1 | 1): 'moved' | 'tail' => {
		const buttons = footerBtnNames();
		const index = buttons.indexOf(current);
		const next = moveInSequence(buttons.length, index, step);
		if (next === 'head') {
			upFromFooter();
			return 'moved';
		} else if (next === 'tail') {
			return 'tail';
		} else {
			focusControl(btnElOf(buttons[next]));
			return 'moved';
		}
	};

	/** moves the visual focus inside a grid panel, leaving the grid at its vertical borders */
	const gridMove = (panel: GridPanel, key: string, direction: HxDateTimePickerGridDirection) => {
		const grid = gridOf(panel);
		const index = grid.findIndex(cell => cell.key === key);
		const result = moveInGrid(grid, index, direction, GRID_COLUMNS[panel]);
		if (result.kind === 'move') {
			setVisualCell(panel, cellElOf(panel, grid[result.index].key));
		} else if (result.kind === 'leave') {
			if (result.direction === 'up') {
				leaveGridUp(panel);
			} else {
				leaveGridDown();
			}
		}
	};

	/** selects the visual (hovered) grid cell, mirroring the mouse click handlers */
	const selectCell = (panel: GridPanel, key: string) => {
		if (panel === 'days') {
			const day = stateRef.days(stateRef.weekdays()).find(cell => cell.key === key);
			if (day == null) {
				return;
			}
			stateRef.changeDayTo(day.value.getFullYear(), day.value.getMonthIndex() + 1, day.value.getDayOfMonth(), true, !timeAvailable);
			popupContext.emit(EvtHxDateTimePicker_DaySelected);
			if (!timeAvailable) {
				popupContext.emit(EvtHxDateTimePicker_ClosePopup);
			}
		} else if (panel === 'months') {
			const month = stateRef.months().find(cell => cell.key === key);
			if (month == null) {
				return;
			}
			stateRef.changeMonth(month.offset, true);
			popupContext.emit(EvtHxDateTimePicker_MonthSelected);
			// the months panel hides and the days panel re-renders asynchronously
			setTimeout(() => {
				enterGridAtState('days');
			}, 20);
		} else {
			const year = stateRef.years().years.find(cell => cell.key === key);
			if (year == null) {
				return;
			}
			stateRef.changeYear(year.offset, true);
			popupContext.emit(EvtHxDateTimePicker_SwitchDatePanel, 'months');
			// the months panel prepares asynchronously
			setTimeout(() => {
				enterGridAtState('months');
			}, 20);
		}
	};

	/** header month/year label Enter/Space: switch the date panel */
	const switchToPanel = (panel: GridPanel) => {
		stateRef.switchDatePanel(panel, true);
		// the target panel prepares asynchronously
		setTimeout(() => {
			enterGridAtState(panel);
		}, 20);
	};

	/**
	 * The container-level keydown handler. While the grid visual focus is
	 * active, arrows and Enter/Space from any popup control route to the
	 * grid; otherwise the block rules apply.
	 */
	const onPopupKeydown: (ev: ReactKeyboardEvent<HTMLDivElement>) => void = (ev) => {
		const container = containerRef.current;
		if (container == null || ev.defaultPrevented) {
			return;
		}
		const target = ev.target as HTMLElement;
		if (!container.contains(target)) {
			return;
		}

		const btn = target.closest<HTMLElement>('[data-hx-dtp-panel-btn]');
		const timeInput = target.closest<HTMLElement>('[data-hx-dtp-panel-time-input]');

		const btnName = btn?.getAttribute('data-hx-dtp-panel-btn') ?? null;
		const isHeaderBtn = btnName != null && (HEADER_ORDER as ReadonlyArray<string>).includes(btnName);
		const isTimeBtn = btnName != null && (TIME_ORDER as ReadonlyArray<string>).includes(btnName);
		const isFooterBtn = btnName != null && (FOOTER_ORDER as ReadonlyArray<string>).includes(btnName);
		const panel = stateRef.currentDatePanel();
		const visual = visualRef.current;

		switch (ev.key) {
			case 'Escape': {
				ev.preventDefault();
				popupContext.emit(EvtHxDateTimePicker_ClosePopup);
				break;
			}
			case 'Enter':
			case ' ': {
				if (visual != null) {
					ev.preventDefault();
					selectCell(visual.panel, visual.key);
				} else if (btnName === 'month' || btnName === 'year') {
					// the header labels are spans: trigger the panel switch manually
					ev.preventDefault();
					switchToPanel(btnName === 'month' ? 'months' : 'years');
				}
				// buttons trigger their click natively; time inputs keep native behavior
				break;
			}
			case 'Tab': {
				if (isHeaderBtn) {
					ev.preventDefault();
					if (ev.shiftKey) {
						if (btnName === 'prev-year') {
							backToInput();
						} else {
							headerMove(btnName!, -1);
						}
					} else {
						if (btnName === 'next-year') {
							enterGridAtState(panel);
						} else {
							headerMove(btnName!, 1);
						}
					}
				} else if (timeInput != null || isTimeBtn) {
					ev.preventDefault();
					const current = timeInput != null
						? (timeInput.getAttribute('data-hx-dtp-panel-time-input') ?? '')
						: btnName!;
					timeMove(current, ev.shiftKey ? -1 : 1);
				} else if (isFooterBtn) {
					if (footerMove(btnName!, ev.shiftKey ? -1 : 1) !== 'tail') {
						ev.preventDefault();
					}
					// the footer tail Tab is unprevented: focus flows out naturally
				}
				break;
			}
			case 'ArrowLeft':
			case 'ArrowRight': {
				const left = ev.key === 'ArrowLeft';
				if (visual != null) {
					ev.preventDefault();
					gridMove(visual.panel, visual.key, left ? 'left' : 'right');
				} else if (isHeaderBtn) {
					ev.preventDefault();
					if ((left && btnName === 'prev-year') || (!left && btnName === 'next-year')) {
						break;
					}
					headerMove(btnName!, left ? -1 : 1);
				} else if (timeInput != null) {
					// cursor-based movement inside the time inputs
					const input = timeInput as HTMLInputElement;
					const start = input.selectionStart ?? 0;
					const end = input.selectionEnd ?? 0;
					const length = input.value.length;
					const field = timeInput.getAttribute('data-hx-dtp-panel-time-input') ?? '';
					if (left && start === 0 && end === 0) {
						if (field !== 'hour') {
							ev.preventDefault();
							timeMove(field, -1);
						}
						// the hour input does not respond at cursor 0
					} else if (!left && start === length && end === length) {
						if (field !== 'second') {
							ev.preventDefault();
							timeMove(field, 1);
						}
						// the second input's right edge moves into the quick buttons
					}
					// otherwise the native cursor behavior applies
				} else if (isTimeBtn) {
					ev.preventDefault();
					if (!left && btnName === 'end-of-day') {
						break;
					}
					timeMove(btnName!, left ? -1 : 1);
				} else if (isFooterBtn) {
					ev.preventDefault();
					if ((left && btnName === 'today')) {
						break;
					}
					footerMove(btnName!, left ? -1 : 1);
				}
				break;
			}
			case 'ArrowUp':
			case 'ArrowDown': {
				const up = ev.key === 'ArrowUp';
				if (visual != null) {
					ev.preventDefault();
					gridMove(visual.panel, visual.key, up ? 'up' : 'down');
				} else if (isHeaderBtn) {
					ev.preventDefault();
					if (up) {
						backToInput();
					} else {
						enterGridAtFirst(panel);
					}
				} else if (timeInput != null || isTimeBtn) {
					ev.preventDefault();
					if (up) {
						enterGridAtState(panel);
					} else {
						focusControl(btnElOf('today'));
					}
				} else if (isFooterBtn) {
					if (up) {
						ev.preventDefault();
						upFromFooter();
					}
					// footer down is undefined by the rules: native behavior (nothing)
				}
				break;
			}
			default: {
				// do nothing
				break;
			}
		}
	};

	// visual focus on the state value cell when the popup opens (real focus stays on the picker input)
	useEffect(() => {
		if (visible) {
			enterGridAtState(stateRef.currentDatePanel());
		} else {
			clearVisual();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visible]);

	// the picker input drives the grid visual focus while the popup is open
	useEffect(() => {
		const onArrowKey = (direction: 'up' | 'down' | 'left' | 'right') => {
			const visual = visualRef.current;
			if (visual != null) {
				gridMove(visual.panel, visual.key, direction);
			}
		};
		const onSelectHovered = () => {
			const visual = visualRef.current;
			if (visual != null) {
				selectCell(visual.panel, visual.key);
			}
		};
		popupContext.on(EvtHxDateTimePicker_ArrowKey, onArrowKey);
		popupContext.on(EvtHxDateTimePicker_SelectHovered, onSelectHovered);
		return () => {
			popupContext.off(EvtHxDateTimePicker_ArrowKey, onArrowKey);
			popupContext.off(EvtHxDateTimePicker_SelectHovered, onSelectHovered);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [popupContext]);

	// clear the hover visual on unmount
	useEffect(() => {
		return () => {
			hoveredElRef.current?.removeAttribute('data-hx-hover');
			hoveredElRef.current = null;
		};
	}, []);

	return onPopupKeydown;
};
