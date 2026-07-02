// @ts-expect-error import React
import React, {
	type KeyboardEventHandler,
	useEffect,
	useState
} from 'react';
import {HxButton} from '../button';
import {HxLabel} from '../label';
import type {
	DateTimePickerPanelProps,
	DateTimePickerSelection,
	PanelViewMode
} from './types';

/** Number of days in a given month (month is 1-based) */
const daysInMonth = (year: number, month: number): number => {
	return new Date(year, month, 1, 0, 0, 0, -1).getDate();
};

/** Get weekday of the first day of month (0=Sunday, 6=Saturday), month is 1-based */
const firstDayOfMonth = (year: number, month: number): number => {
	return new Date(year, month - 1, 1).getDay();
};

/** Check if two dates are on the same calendar day */
const isSameDay = (y1: number, m1: number, d1: number, y2: number, m2: number, d2: number): boolean => {
	return y1 === y2 && m1 === m2 && d1 === d2;
};

/** Clamp a number between min and max */
const clamp = (value: number, min: number, max: number): number => {
	return Math.max(min, Math.min(max, value));
};

/** Check if a date is within the min/max range */
const isDateInRange = (year: number, month: number, day: number, minDate?: Date, maxDate?: Date): boolean => {
	if (minDate != null) {
		const minY = minDate.getFullYear();
		const minM = minDate.getMonth() + 1;
		const minD = minDate.getDate();
		if (year < minY || (year === minY && month < minM) || (year === minY && month === minM && day < minD)) {
			return false;
		}
	}
	if (maxDate != null) {
		const maxY = maxDate.getFullYear();
		const maxM = maxDate.getMonth() + 1;
		const maxD = maxDate.getDate();
		if (year > maxY || (year === maxY && month > maxM) || (year === maxY && month === maxM && day > maxD)) {
			return false;
		}
	}
	return true;
};

/** Check if navigation to a given month is blocked because all days are out of range */
const isMonthOutOfRange = (year: number, month: number, minDate?: Date, maxDate?: Date): boolean => {
	if (maxDate != null) {
		const maxY = maxDate.getFullYear();
		const maxM = maxDate.getMonth() + 1;
		if (year > maxY || (year === maxY && month > maxM)) {
			return true;
		}
	}
	if (minDate != null) {
		const minY = minDate.getFullYear();
		const minM = minDate.getMonth() + 1;
		if (year < minY || (year === minY && month < minM)) {
			return true;
		}
	}
	return false;
};

/** Get today as year/month/day numbers */
const getTodayParts = (): {year: number; month: number; day: number} => {
	const now = new Date();
	return {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};
};

/** Generate the decade range for year selection */
const decadeStart = (year: number): number => year - (year % 10);

/** Zero-pad a number to 2 digits */
const pad2 = (n: number): string => n.toString().padStart(2, '0');

/**
 * DateTime picker panel component — renders the calendar grid, month/year quick-select, and time inputs.
 *
 * Designed for reuse: can be embedded directly (not via popup) for range picker composition.
 */
export const HxDateTimePickerPanel = (props: DateTimePickerPanelProps) => {
	const {
		format, selected, minDate, maxDate,
		firstDayOfWeek, weekdayNames, monthNames,
		showTime, showDate,
		todayKey, clearKey,
		onSelect, onTimeChange, onToday, onClear, onClose
	} = props;

	const todayParts = getTodayParts();
	const now = new Date();

	// --- internal state ---
	const [viewYear, setViewYear] = useState<number>(selected?.year ?? todayParts.year);
	const [viewMonth, setViewMonth] = useState<number>(selected?.month ?? todayParts.month);
	const [viewMode, setViewMode] = useState<PanelViewMode>('calendar');
	const [timeHour, setTimeHour] = useState<number>(selected?.hour ?? 0);
	const [timeMinute, setTimeMinute] = useState<number>(selected?.minute ?? 0);
	const [timeSecond, setTimeSecond] = useState<number>(selected?.second ?? 0);

	// Sync view to selected when panel opens
	useEffect(() => {
		if (selected?.year != null && selected?.month != null) {
			setViewYear(selected.year);
			setViewMonth(selected.month);
		}
		if (selected?.hour != null) {
			setTimeHour(clamp(selected.hour, 0, 23));
		}
		if (selected?.minute != null) {
			setTimeMinute(clamp(selected.minute, 0, 59));
		}
		if (selected?.second != null) {
			setTimeSecond(clamp(selected.second, 0, 59));
		}
	}, [selected?.year, selected?.month, selected?.day, selected?.hour, selected?.minute, selected?.second]);

	// --- navigation ---
	const navPrevMonth = () => {
		let m = viewMonth - 1;
		let y = viewYear;
		if (m < 1) {
			m = 12;
			y -= 1;
		}
		if (!isMonthOutOfRange(y, m, minDate, maxDate)) {
			setViewYear(y);
			setViewMonth(m);
		}
	};
	const navNextMonth = () => {
		let m = viewMonth + 1;
		let y = viewYear;
		if (m > 12) {
			m = 1;
			y += 1;
		}
		if (!isMonthOutOfRange(y, m, minDate, maxDate)) {
			setViewYear(y);
			setViewMonth(m);
		}
	};

	// --- date selection ---
	const selectDate = (year: number, month: number, day: number) => {
		const selection: DateTimePickerSelection = {
			year,
			month,
			day,
			hour: timeHour,
			minute: timeMinute,
			second: timeSecond
		};
		onSelect(selection);
		onClose();
	};

	// --- time change ---
	const fireTimeChange = (h: number, m: number, s: number) => {
		const ch = clamp(h, 0, 23);
		const cm = clamp(m, 0, 59);
		const cs = clamp(s, 0, 59);
		setTimeHour(ch);
		setTimeMinute(cm);
		setTimeSecond(cs);
		onTimeChange(ch, cm, cs);
	};

	// --- month select ---
	const selectMonth = (m: number) => {
		if (!isMonthOutOfRange(viewYear, m, minDate, maxDate)) {
			setViewMonth(m);
			setViewMode('calendar');
		}
	};

	// --- year select ---
	const decadeStartYear = decadeStart(viewYear);
	const years: Array<number> = [];
	for (let i = decadeStartYear - 1; i <= decadeStartYear + 10; i++) {
		years.push(i);
	}

	const selectYear = (y: number) => {
		setViewYear(y);
		setViewMode('calendar');
		// After picking a year, show month selector if we came from month selection
		if (viewMode === 'year-select') {
			setViewMode('month-select');
		}
	};

	const prevDecade = () => {
		setViewYear(viewYear - 10);
	};
	const nextDecade = () => {
		setViewYear(viewYear + 10);
	};

	// --- calendar grid ---
	const buildCalendarDays = () => {
		const cells: Array<{
			year: number; month: number; day: number;
			isCurrentMonth: boolean; isToday: boolean;
			isSelected: boolean; isDisabled: boolean
		}> = [];

		const days = daysInMonth(viewYear, viewMonth);
		const firstDow = firstDayOfMonth(viewYear, viewMonth);
		// Calculate start offset: how many cells before the 1st
		const startOffset = (firstDow - firstDayOfWeek + 7) % 7;

		// Previous month
		const prevMonth = viewMonth === 1 ? 12 : viewMonth - 1;
		const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;
		const prevDays = daysInMonth(prevYear, prevMonth);
		for (let i = startOffset - 1; i >= 0; i--) {
			const d = prevDays - i;
			cells.push({
				year: prevYear, month: prevMonth, day: d,
				isCurrentMonth: false,
				isToday: isSameDay(prevYear, prevMonth, d, todayParts.year, todayParts.month, todayParts.day),
				isSelected: !!selected && isSameDay(prevYear, prevMonth, d, selected.year!, selected.month!, selected.day!),
				isDisabled: !isDateInRange(prevYear, prevMonth, d, minDate, maxDate)
			});
		}

		// Current month
		for (let d = 1; d <= days; d++) {
			cells.push({
				year: viewYear, month: viewMonth, day: d,
				isCurrentMonth: true,
				isToday: isSameDay(viewYear, viewMonth, d, todayParts.year, todayParts.month, todayParts.day),
				isSelected: !!selected && isSameDay(viewYear, viewMonth, d, selected.year!, selected.month!, selected.day!),
				isDisabled: !isDateInRange(viewYear, viewMonth, d, minDate, maxDate)
			});
		}

		// Next month: fill remaining cells to make 6 rows
		const remaining = 42 - cells.length;
		const nextMonth = viewMonth === 12 ? 1 : viewMonth + 1;
		const nextYear = viewMonth === 12 ? viewYear + 1 : viewYear;
		for (let d = 1; d <= remaining; d++) {
			cells.push({
				year: nextYear, month: nextMonth, day: d,
				isCurrentMonth: false,
				isToday: isSameDay(nextYear, nextMonth, d, todayParts.year, todayParts.month, todayParts.day),
				isSelected: !!selected && isSameDay(nextYear, nextMonth, d, selected.year!, selected.month!, selected.day!),
				isDisabled: !isDateInRange(nextYear, nextMonth, d, minDate, maxDate)
			});
		}

		return cells;
	};

	// --- keyboard ---
	const onKeyDown: KeyboardEventHandler = (ev) => {
		switch (ev.key) {
			case 'Escape': {
				ev.preventDefault();
				onClose();
				break;
			}
			case 'ArrowLeft': {
				ev.preventDefault();
				navPrevMonth();
				break;
			}
			case 'ArrowRight': {
				ev.preventDefault();
				navNextMonth();
				break;
			}
			default:
				break;
		}
	};

	// --- render helpers ---
	const weekdayHeaders = () => {
		const headers: Array<string> = [];
		for (let i = 0; i < 7; i++) {
			headers.push(weekdayNames[(firstDayOfWeek + i) % 7]);
		}
		return headers;
	};

	const canNavPrev = !isMonthOutOfRange(
		viewMonth === 1 ? viewYear - 1 : viewYear,
		viewMonth === 1 ? 12 : viewMonth - 1,
		minDate, maxDate
	);
	const canNavNext = !isMonthOutOfRange(
		viewMonth === 12 ? viewYear + 1 : viewYear,
		viewMonth === 12 ? 1 : viewMonth + 1,
		minDate, maxDate
	);

	return (
		<div data-hx-datetime-picker-panel="" onKeyDown={onKeyDown} tabIndex={-1}>
			{/* ---- header ---- */}
			{showDate && (
				<div data-hx-datetime-picker-header="">
					<HxButton
						text="←"
						data-hx-datetime-picker-nav=""
						$disabled={!canNavPrev}
						variant="ghost" color="waive"
						onClick={() => { navPrevMonth(); }}/>
					<HxButton
						text={monthNames[viewMonth - 1]}
						data-hx-datetime-picker-month-select=""
						variant="ghost" color="waive"
						data-hx-active={viewMode === 'month-select' ? '' : (void 0)}
						onClick={() => { setViewMode(viewMode === 'month-select' ? 'calendar' : 'month-select'); }}/>
					<HxButton
						text={String(viewYear)}
						data-hx-datetime-picker-year-select=""
						variant="ghost" color="waive"
						data-hx-active={viewMode === 'year-select' ? '' : (void 0)}
						onClick={() => { setViewMode(viewMode === 'year-select' ? 'calendar' : 'year-select'); }}/>
					<HxButton
						text="→"
						data-hx-datetime-picker-nav=""
						$disabled={!canNavNext}
						variant="ghost" color="waive"
						onClick={() => { navNextMonth(); }}/>
				</div>
			)}

			{/* ---- month select grid ---- */}
			{showDate && viewMode === 'month-select' && (
				<div data-hx-datetime-picker-month-grid="">
					{monthNames.map((name, idx) => {
						const m = idx + 1;
						const disabled = isMonthOutOfRange(viewYear, m, minDate, maxDate);
						const active = viewMonth === m;
						return (
							<HxButton
								key={m}
								text={name}
								data-hx-datetime-picker-month-cell=""
								data-hx-active={active ? '' : (void 0)}
								$disabled={disabled}
								variant="ghost" color="waive"
								onClick={() => { selectMonth(m); }}/>
						);
					})}
					<HxButton
						text={`←`}
						data-hx-datetime-picker-month-cell=""
						variant="ghost" color="waive"
						onClick={() => { setViewYear(viewYear - 1); }}/>
					<HxButton
						text={`→`}
						data-hx-datetime-picker-month-cell=""
						variant="ghost" color="waive"
						onClick={() => { setViewYear(viewYear + 1); }}/>
				</div>
			)}

			{/* ---- year select grid ---- */}
			{showDate && viewMode === 'year-select' && (
				<div data-hx-datetime-picker-year-grid="">
					<HxButton
						text="←"
						data-hx-datetime-picker-year-cell=""
						variant="ghost" color="waive"
						onClick={() => { prevDecade(); }}/>
					{years.map(y => {
						const active = viewYear === y;
						return (
							<HxButton
								key={y}
								text={String(y)}
								data-hx-datetime-picker-year-cell=""
								data-hx-active={active ? '' : (void 0)}
								variant="ghost" color="waive"
								onClick={() => { selectYear(y); }}/>
						);
					})}
					<HxButton
						text="→"
						data-hx-datetime-picker-year-cell=""
						variant="ghost" color="waive"
						onClick={() => { nextDecade(); }}/>
				</div>
			)}

			{/* ---- calendar grid ---- */}
			{showDate && viewMode === 'calendar' && (
				<div data-hx-datetime-picker-calendar="">
					<div data-hx-datetime-picker-weekdays="">
						{weekdayHeaders().map((name) => (
							<span key={name} data-hx-datetime-picker-weekday="">{name}</span>
						))}
					</div>
					<div data-hx-datetime-picker-days="">
						{buildCalendarDays().map((cell, idx) => {
							const dayStr = String(cell.day);
							return (
								<HxButton
									key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
									text={dayStr}
									data-hx-datetime-picker-day=""
									data-hx-datetime-picker-day-other-month={!cell.isCurrentMonth ? '' : (void 0)}
									data-hx-datetime-picker-day-today={cell.isToday ? '' : (void 0)}
									data-hx-active={cell.isSelected ? '' : (void 0)}
									$disabled={cell.isDisabled}
									variant="ghost" color="waive"
									onClick={() => {
										if (!cell.isDisabled) {
											selectDate(cell.year, cell.month, cell.day);
										}
									}}/>
							);
						})}
					</div>
				</div>
			)}

			{/* ---- time inputs ---- */}
			{showTime && (
				<div data-hx-datetime-picker-time="">
					<HxLabel text={showDate ? (void 0) : 'Time'} data-hx-datetime-picker-time-label=""/>
					<div data-hx-datetime-picker-time-inputs="">
						{format.hasHour && (
							<input
								type="number" min={0} max={23}
								value={pad2(timeHour)}
								data-hx-datetime-picker-time-field=""
								onChange={(ev) => {
									const v = parseInt(ev.target.value, 10);
									if (!isNaN(v)) {
										fireTimeChange(v, timeMinute, timeSecond);
									}
								}}/>
						)}
						{format.hasMinute && (
							<>
								{format.hasHour ? <span data-hx-datetime-picker-time-sep="">:</span> : (void 0)}
								<input
									type="number" min={0} max={59}
									value={pad2(timeMinute)}
									data-hx-datetime-picker-time-field=""
									onChange={(ev) => {
										const v = parseInt(ev.target.value, 10);
										if (!isNaN(v)) {
											fireTimeChange(timeHour, v, timeSecond);
										}
									}}/>
							</>
						)}
						{format.hasSecond && (
							<>
								{format.hasMinute ? <span data-hx-datetime-picker-time-sep="">:</span> : (void 0)}
								<input
									type="number" min={0} max={59}
									value={pad2(timeSecond)}
									data-hx-datetime-picker-time-field=""
									onChange={(ev) => {
										const v = parseInt(ev.target.value, 10);
										if (!isNaN(v)) {
											fireTimeChange(timeHour, timeMinute, v);
										}
									}}/>
							</>
						)}
					</div>
				</div>
			)}

			{/* ---- footer ---- */}
			<div data-hx-datetime-picker-footer="">
				<HxButton
					text={todayKey ?? 'Today'}
					data-hx-datetime-picker-footer-btn=""
					variant="link" color="primary"
					onClick={() => {
						setViewYear(todayParts.year);
						setViewMonth(todayParts.month);
						setTimeHour(now.getHours());
						setTimeMinute(now.getMinutes());
						setTimeSecond(now.getSeconds());
						onToday();
					}}/>
				<HxButton
					text={clearKey ?? 'Clear'}
					data-hx-datetime-picker-footer-btn=""
					variant="link" color="danger"
					onClick={() => { onClear(); }}/>
			</div>
		</div>
	);
};

HxDateTimePickerPanel.displayName = 'HxDateTimePickerPanel';
